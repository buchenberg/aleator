import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';

const HEADERS = {
  'User-Agent': 'aleator/2.0 (+https://github.com/buchenberg/aleator; cut-up machine)',
  Accept: 'text/html,application/xhtml+xml;q=0.9',
};

/**
 * Fetch one article and squeeze usable text out of it with Readability.
 * Any failure — bad host, paywall, empty page, giant HTML — resolves to
 * null: a missing article never blocks the fold, it just goes quiet.
 */
export async function articleText(url, { timeoutMs = 8000, maxBytes = 400_000 } = {}) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: 'follow', signal: ac.signal });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    // never parse (or store) more than the cap
    const html = new TextDecoder().decode(buf.byteLength > maxBytes ? buf.slice(0, maxBytes) : buf);
    const { document } = parseHTML(html);
    const article = new Readability(document).parse();
    if (!article?.textContent) return null;
    const text = article.textContent.replace(/\s+/g, ' ').trim();
    return text.length > 200 ? text : null; // teasers stay out of the pool
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Pull article bodies for a set of links with limited parallelism, and
 * return whichever succeeded. Order is preserved so the corpus keeps a
 * trace of its own front page.
 */
export async function articlePool(links, { max = 6, concurrency = 3 } = {}) {
  const wanted = links.filter(Boolean).slice(0, max);
  const queue = [...wanted];
  const results = new Array(wanted.length).fill(null);

  async function worker() {
    while (queue.length > 0) {
      const index = wanted.length - queue.length;
      const link = queue.shift();
      if (!link) return;
      results[index] = await articleText(link);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, wanted.length) }, worker));
  return results.filter((t) => t !== null);
}
