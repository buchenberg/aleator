# aleator roadmap

Ideas on the bench for the cut-up machine. Anything marked *shipped* lives
below the fold — the live feature set is described in the main
[README](../README.md).

## Shipped

- ✅ **Curated feed gallery** — named feeds grouped by category, `<optgroup>`
  dropdowns for both sources (2026-10 revival)
- ✅ **Fold-it-in-again** — recursive Burroughs fold: each cut-up becomes the
  next run's opposing page
- ✅ **Cut depth** — `clause / phrase / word` cut levels via the `CUT_LEVELS`
  registry in `app/lib/cutup.js`
- ✅ **Seeded runs + share links** — any cut-up is reproducible and has a
  permalink (seed + feeds + settings encoded in the URL)
- ✅ **Full-article extraction** — the machine can pull whole article bodies
  instead of titles + summaries, via `@mozilla/readability`
- ✅ **Typewriter mode** — output arrives on an animated carriage with key
  clacks and a return bell

## The lineage (Burroughs / Gysin techniques)

- [ ] **Permutations** — Gysin's own variation: type one sentence, receive all
  of its word-reorderings, six passes like his permuted poems. Small, pure
  UI, very canon.
- [ ] **The word horde** — bank every generated cut-up (localStorage) as a
  personal stockpile, then fold new feeds against *your own* hoard later.
- [ ] **Third-mind batching** — more than two sources (3–5 feeds) with
  per-source weights; the fold becomes composition rather than a duet.
- [ ] **Divination mode** — one line per die face ⚀–⚅, laid out like a tarot
  cross; frame the machine as an oracle: *when you cut into the present, the
  future leaks out.*
- [ ] **Tape splice** — sound cut-ups. Where feed items carry audio
  (`<enclosure>`/podcast URLs), download, cut, and interleave the audio the
  way Burroughs & Gysin cut tape. Heavier (ffmpeg or WebAudio splicing).

## Machine tuning

- [ ] **Weighted seams** — fade the uniform `, ` / ` — ` / `.` seam choice
  into a configurable, weighted list (a sibling registry to `CUT_LEVELS`).
- [ ] **Chaos knob** — surface the ~35% third-fragment roll as a user-visible
  0–100 setting; the die glyph could reflect the roll.
- [ ] **Punctuation diet** — optional: strip or normalize capitals/periods for
  fully flat "war-incision" prose.

## Feeds and corpora

- [ ] **Gutenberg slot** — paste a Project Gutenberg URL directly; fold
  *The Waste Land* against this morning's BBC.
- [ ] **More source families** — HN search, podcast RSS, YouTube channels,
  GitHub release notes — one parser each, all behind the same `{ url }` spec.
- [ ] **Corpus curation** — blocklist hosts, deduplicate syndication, cap
  fragment reuse per run so one chatty source can't dominate the fold.

## Presentation

- [ ] **Cut-out strip view** — render fragments as physical paper scraps
  (CSS transforms), slightly offset, so the collage is visible, not just the
  text.
- [ ] **Brag card** — export a cut-up as a shareable PNG rendered on canvas,
  tagged with the seed and both feed names.
- [ ] **Permalink history** — a "recent cuts" shelf of the day's seeds.
