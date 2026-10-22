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
 * Cut a sentence further into clause-sized chunks at commas, dashes,
 * colons and coordinating conjunctions. This is where the "cut" in
 * cut-up happens — smaller pieces mean more chaotic folds.
 */
export function cutIntoFragments(sentence) {
  const parts = sentence.split(/(?<=[,;:—–])\s+|\s+(?:and|but|or|while|although|because|when|if|that|which)\s+/i);
  const fragments = parts.map((p) => p.trim()).filter((p) => p.length > 2);
  // if the sentence refuses to be cut, at least trim it into bite-size halves
  if (fragments.length === 1 && fragments[0].split(' ').length > 14) {
    const words = fragments[0].split(' ');
    const mid = Math.floor(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }
  return fragments.length > 0 ? fragments : [sentence];
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
 */
export function foldCorpora(poolA, poolB, { lines = 8 } = {}) {
  const out = [];
  for (let i = 0; i < lines; i++) {
    const a = pick(poolA);
    const b = pick(poolB);
    if (!a && !b) break;

    const order = i % 2 === 0 ? [a, b] : [b, a];
    const sides = i % 2 === 0 ? ['a', 'b'] : ['b', 'a'];
    const pieces = [];
    order.forEach((frag, j) => {
      if (!frag) return;
      const lead = pieces.length === 0 ? '' : pickSeam(pieces[pieces.length - 1].text);
      pieces.push({ lead, text: normalizeEdge(frag), side: j === 0 ? sides[0] : sides[1] });
    });

    // randomly stitch a third fragment in for extra chaos
    if (Math.random() < 0.35) {
      const third = pick(i % 2 === 0 ? poolA : poolB);
      if (third && pieces.length > 0) {
        const lead = pickSeam(pieces[pieces.length - 1].text);
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

function pick(pool) {
  if (!pool || pool.length === 0) return null;
  // weight toward substantial fragments: drop tiny cut-up debris
  const candidates = pool.filter((f) => f.length > 12);
  const poolToUse = candidates.length > 0 ? candidates : pool;
  return poolToUse[Math.floor(Math.random() * poolToUse.length)];
}

function pickSeam(prevText) {
  if (/[.!?]$/.test(prevText)) return ' ';
  return Math.random() < 0.7 ? ', ' : ' — ';
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
