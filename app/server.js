import express from 'express';
import { marked } from 'marked';
import fs from 'node:fs';
import Parser from 'rss-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitSentences, cutIntoFragments, foldCorpora, CUT_LEVELS, hashSeed, mulberry32, permute } from './lib/cutup.js';
import { articlePool } from './lib/articles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
// hnrss.org and other hosts rate-limit blank/default User-Agents; identify ourselves
const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'aleator/2.0 (+https://github.com/buchenberg/aleator; cut-up machine)',
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Curated feeds for the UI dropdowns; users can paste their own too.
// Grouped by category, rendered as <optgroup> in the client.
const SUGGESTED_FEEDS = [
  { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'News' },
  { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'News' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'News' },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', category: 'News' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'News' },

  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/top/science.xml', category: 'Science' },
  { name: 'Phys.org', url: 'https://phys.org/rss-feed/', category: 'Science' },
  { name: 'Quanta Magazine', url: 'https://api.quantamagazine.org/feed/', category: 'Science' },
  { name: 'NASA', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', category: 'Science' },

  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Tech' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Tech' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'Tech' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech' },

  { name: 'Boing Boing', url: 'https://boingboing.net/feed', category: 'Culture' },
  { name: 'Longreads', url: 'https://longreads.com/feed/', category: 'Culture' },
  { name: 'Hackaday', url: 'https://hackaday.com/feed/', category: 'Culture' },
];

// Rate-limited feed hosts (e.g. hnrss.org) answer 429 under repeated cuts;
// back off and retry rather than dead-end the user's session.
function parseFeedWithRetry(url, { tries = 3, baseDelayMs = 1500 } = {}) {
  const attempt = async (n) => {
    try {
      return await parser.parseURL(url);
    } catch (err) {
      if (n < tries && /429/.test(String(err.message))) {
        await new Promise((r) => setTimeout(r, baseDelayMs * n));
        return attempt(n + 1);
      }
      throw err;
    }
  };
  return attempt(1);
}

app.get('/api/feeds', (req, res) => {
  // group by category for <optgroup> rendering
  const grouped = SUGGESTED_FEEDS.reduce((acc, feed) => {
    (acc[feed.category] ??= []).push({ name: feed.name, url: feed.url });
    return acc;
  }, {});
  res.json({ feeds: grouped });
});

// The README is the single source of truth: the page's About section
// renders it verbatim, so docs and UI can never drift apart.
app.get('/api/about', (req, res) => {
  try {
    const md = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
    res.json({ html: marked.parse(md) });
  } catch (err) {
    res.status(404).json({ error: 'README not available' });
  }
});

/**
 * Turn a source spec ({url} or {text}) into a pool of clause fragments.
 * Feeds contribute every item's title and summary; pasted text is used whole.
 * Returns { title, fragments } so the UI can label each side.
 */
async function buildPool(source, cutLevel, rng) {
  const cutOpts = { level: cutLevel, rng };
  if (source.text && source.text.trim()) {
    return {
      title: 'pasted text',
      fragments: splitSentences(source.text).flatMap((s) => cutIntoFragments(s, cutOpts)),
    };
  }
  if (source.url) {
    const feed = await parseFeedWithRetry(source.url);
    const snippets = feed.items.map(
      (item) => [item.title || '', item.contentSnippet || item.content || item.summary || ''].join(' '),
    );
    // optional full-article pull: whole article bodies, not just teasers
    if (source.full) {
      const seen = new Set();
      const links = feed.items
        .filter((item) => item.link && !seen.has(item.link) && seen.add(item.link))
        .map((item) => item.link);
      const articles = await articlePool(links);
      snippets.push(...articles);
    }
    return {
      title: feed.title || new URL(source.url).hostname,
      fragments: splitSentences(snippets.join(' ')).flatMap((s) => cutIntoFragments(s, cutOpts)),
    };
  }
  throw new Error('Source needs either a url or text');
}

app.post('/api/permute', (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required — give the dial a phrase' });
  }
  res.json({ results: permute(text) });
});

app.post('/api/cutup', async (req, res) => {
  const { sourceA, sourceB, lines, cut, seed } = req.body || {};
  if (!sourceA || !sourceB) {
    return res.status(400).json({ error: 'Both sourceA and sourceB are required' });
  }
  // unknown cut levels quietly fall back to the middle ground
  const cutLevel = Object.keys(CUT_LEVELS).includes(cut) ? cut : 'phrase';
  // seeded runs replay: same seed + same corpus → byte-identical cut-up
  const token = seed === undefined || seed === null || seed === '' ? null : String(seed);
  const rng = token === null ? null : mulberry32(hashSeed(token));
  try {
    const [sideA, sideB] = await Promise.all([
      buildPool(sourceA, cutLevel, rng),
      buildPool(sourceB, cutLevel, rng),
    ]);
    if (sideA.fragments.length === 0 || sideB.fragments.length === 0) {
      return res.status(422).json({ error: 'One of the sources produced no usable text' });
    }
    const fragments = foldCorpora(sideA.fragments, sideB.fragments, {
      lines: Math.min(Math.max(Number(lines) || 8, 1), 24),
      rng,
    });
    res.json({ fragments, feeds: [sideA.title, sideB.title], seed: token });
  } catch (err) {
    console.error('cutup failed:', err.message);
    res.status(502).json({ error: `Could not process sources: ${err.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`aleator cut-up machine listening on http://localhost:${PORT}`);
});
