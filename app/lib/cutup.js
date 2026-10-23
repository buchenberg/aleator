import nlp from 'compromise';

/**
 * Split raw text into sentences. Falls back to RSLP-less simple splitting on
 * terminal punctuation; compromise handles the common cases (abbreviations
 * are rare in feed snippets, so regex + compromise is enough here).
 */
export function splitSentences(text) {
  if (!text) return [];
  const cleaned = text
    .replace(/<[^>]+>/g, ' ') // strip residual HTML in summaries
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [];

  const doc = nlp(cleaned);
  const sentences = doc.sentences().out('array');
  // last-ditch fallback: if compromise produced one giant "sentence", split crudely
  if (sentences.length === 1 && sentences[0].length > 240) {
    return cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
  }
  return sentences.map((s) => s.trim()).filter((s) => s.length > 1);
}

/**
 * Cut-depth registry — the generator's tuning panel. Each level defines:
 *   separators — regex marking allowed cut points within a sentence
 *   maxWords   — fence length; fragments longer than this are cut through
 * Add a level here and it is immediately available to the API and client.
 */
export const CUT_LEVELS = {
  // sentence → clauses only; Burroughs' broadest, least violent cuts
  clause: {
    separators: /(?<=[,;:—–])\s+|\s+(?:and|but|or|while|although|because|when|if|that|which|who)\s+/i,
    maxWords: 16,
  },
  // clauses → phrases; the middle ground (previous default)
  phrase: {
    separators: /(?<=[,;:—–])\s+|\s+(?:and|but|or|while|although|because|when|if|that|which|who|also|however|despite|meanwhile|apparently|after|before|between|during|through|across|with|without|into|from)\s+/i,
    maxWords: 7,
  },
  // phrases → shrapnel: no grammar respected, pieces of 1–3 words
  word: {
    separators: null,
    maxWords: 3,
  },
};

/**
 * Cut one sentence into fragment-sized pieces according to a cut level
 * ({@link CUT_LEVELS}). This is where the "cut" in cut-up happens —
 * smaller pieces mean more chaotic folds.
 */
export function cutIntoFragments(sentence, { level = 'phrase', rng } = {}) {
  const { separators, maxWords } = CUT_LEVELS[level] ?? CUT_LEVELS.phrase;

  if (!separators) {
    // word shrapnel: chunk every word into groups of 1–maxWords on the fly
    return chunkWords(sentence.split(/\s+/), maxWords, rng ?? Math.random);
  }

  const parts = sentence.split(separators).map((p) => p.trim());
  // cut through any fragment long enough to brazen out the fence
  return parts.flatMap((f) => {
    if (f.length <= 2) return [];
    const words = f.split(/\s+/);
    if (words.length <= maxWords) return [f];
    const pieces = [];
    for (let i = 0; i < words.length; i += maxWords) {
      pieces.push(words.slice(i, i + maxWords).join(' '));
    }
    return pieces;
  });
}

function chunkWords(words, maxWords, r) {
  const out = [];
  let i = 0;
  while (i < words.length) {
    const size = 1 + Math.floor(r() * maxWords); // 1..maxWords
    out.push(words.slice(i, i + size).join(' '));
    i += size;
  }
  return out.filter((w) => w.length > 2);
}

/**
 * Seeded PRNG (mulberry32) so any cut-up can be replayed from its roll.
 * Pair with {@link hashSeed} to turn a shareable token into a stream:
 * `mulberry32(hashSeed(token))`.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a: any seed string (or number) → uint32 for {@link mulberry32}. */
export function hashSeed(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value >>> 0;
  if (/^\d+$/.test(String(value))) return Number(String(value)) >>> 0;
  const str = String(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * Fold two fragment pools, alternating sources like Burroughs folding
 * pages of text. Each output line stitches one fragment from each pool,
 * with the cut points shifted randomly so every fold looks different.
 *
 * Each line is returned as `pieces`: [{ lead, text, side }] where `lead`
 * is the seam glued in front of the piece (empty for the first) and
 * `side` is 'a' | 'b' | 'x' (x = extra third fragment, chaotic). The
 * plain joined sentence is also provided as `text`.
 *
 * `rng` (a () => float in [0,1)) makes the whole fold deterministic and
 * replayable from a seed; pass `mulberry32(hashSeed(seed))`.
 */
export function foldCorpora(poolA, poolB, { lines = 8, rng } = {}) {
  const r = rng ?? Math.random;
  const out = [];
  for (let i = 0; i < lines; i++) {
    const a = pick(poolA, r);
    const b = pick(poolB, r);
    if (!a && !b) break;

    const order = i % 2 === 0 ? [a, b] : [b, a];
    const sides = i % 2 === 0 ? ['a', 'b'] : ['b', 'a'];
    const pieces = [];
    order.forEach((frag, j) => {
      if (!frag) return;
      const lead = pieces.length === 0 ? '' : pickSeam(pieces[pieces.length - 1].text, r);
      pieces.push({ lead, text: normalizeEdge(frag), side: j === 0 ? sides[0] : sides[1] });
    });

    // randomly stitch a third fragment in for extra chaos
    if (r() < 0.35) {
      const third = pick(i % 2 === 0 ? poolA : poolB, r);
      if (third && pieces.length > 0) {
        const lead = pickSeam(pieces[pieces.length - 1].text, r);
        pieces.push({ lead, text: normalizeEdge(third), side: 'x' });
      }
    }
    if (pieces.length === 0) continue;

    capFirst(pieces[0]);
    // a piece that lands after a sentence-terminating seam starts a new
    // sentence, so restore its capital even if it was cut mid-sentence
    for (let j = 1; j < pieces.length; j++) {
      const prev = pieces[j - 1].text;
      if (/[.!?]$/.test(prev) && /^[a-z]/.test(pieces[j].text)) {
        const t = pieces[j].text;
        pieces[j].text = t.charAt(0).toUpperCase() + t.slice(1);
      }
    }
    const last = pieces[pieces.length - 1];
    if (!/[.!?]$/.test(last.text)) last.text += '.';

    const text = pieces.map((p) => p.lead + p.text).join('');
    out.push({ text, pieces });
  }
  return out;
}

function pick(pool, r) {
  if (!pool || pool.length === 0) return null;
  // weight toward substantial fragments: drop tiny cut-up debris
  const candidates = pool.filter((f) => f.length > 12);
  const poolToUse = candidates.length > 0 ? candidates : pool;
  return poolToUse[Math.floor(r() * poolToUse.length)];
}

function pickSeam(prevText, r) {
  if (/[.!?]$/.test(prevText)) return ' ';
  return r() < 0.7 ? ', ' : ' — ';
}

function normalizeEdge(fragment) {
  const trimmed = fragment.trim();
  if (/[,;:]$/.test(trimmed)) return trimmed.slice(0, -1);
  if (/[.!?]$/.test(trimmed)) return trimmed;
  // lower-case lone proper-case words that now land mid-sentence
  if (/^[A-Z][a-z]+$/.test(trimmed) && !/^(The|This|That|There|They|Then|And|But|If|When|While|Although|Because|After|Before|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/.test(trimmed)) {
    return trimmed[0].toLowerCase() + trimmed.slice(1);
  }
  return trimmed;
}

function capFirst(piece) {
  piece.text = piece.text.charAt(0).toUpperCase() + piece.text.slice(1);
}
