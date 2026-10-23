# aleator 🎲

Aleator is a Burroughs-style **cut-up machine**: pick two text sources, and it folds
their sentences and clauses into one random, chimeric text. *Aleator* — from Latin
*aleator*, "dice player" — wears the 🎲 for a reason: every cut is a roll.

William S. Burroughs developed the cut-up method in the 1950s–60s, slicing pages of
text and re-arranging the pieces to reveal new meaning. This app does it with RSS
feeds: choose two feeds (or paste raw text), and the server cuts both into fragments
and splices them together.

## Running

The implementation lives in [`app/`](app/) — a lean Node.js server with no
database. Install and start:

```
cd app
npm install
npm start   # → http://localhost:3000  (the client ships prebuilt; npm run build rebuilds it)
```

Built with Vue 3 + Vite + Tailwind. Deeper development details (API
reference, configuration, project layout) live in
[DEVELOPMENT.md](DEVELOPMENT.md). The original 2017 Java/Spring +
Stanford CoreNLP implementation was removed when the rebuild landed;
it still lives in this repository's git history for reference.

## Using the machine

1. Pick **Source A** and **Source B**. Both offer a dropdown of curated feeds
   grouped by category (News, Science, Tech, Culture), or paste your own feed URL,
   or paste raw text — each source independently uses whichever you filled in
   (text beats URL beats dropdown).
2. Hit **Cut it up**. Each run rolls one of the die faces (⚀–⚅) as its mark,
   and the output renders line by line, with each fragment color-coded by
   origin: red = Source A, blue = Source B, black = seams and wildcards.
   Options in the form:
   - **Pull full articles** — fold whole article bodies (via
     [Readability](https://github.com/mozilla/readability)) rather than titles
     and summaries. Slower; sharper fragments.
   - **Typewriter** — the cut-up is typed out on an animated carriage with key
     clacks and a return bell (skipped automatically under
     `prefers-reduced-motion`).
3. Every run shows a **🎲 seed chip**. When both sources are feed URLs, thank
   you **permalinks**: clicking copies a URL that re-runs the exact same
   cut-up later (`?seed=…&fa=…&fb=…&cut=…&lines=…`). Opening the link replays
   it automatically. Same seed + same feed content → byte-identical text;
   feeds drift over time, so old links re-play against the current front
   pages — the seed remembers the cut, the web remembers the words.
4. Hit **Fold it in again** to feed the *current output* back in as Source A
   against your unchanged Source B — Burroughs' recursive fold-in technique.
   Each pass stacks (`fold 2: last cut-up × …`) and the text gets more
   chimeric as it repeats.

## The history of the cut-up

**Dada, 1920.** The earliest written recipe is practically aleator's noisiest
ancestor. Tristan Tzara's *"To Make a Dadaist Poem"* (published under the subtitle
*dada manifesto on feeble love and bitter love* in issue **391**, December 1920)
instructs: *take a newspaper, take your scissors, cut the article out, cut out each
word, put them all in a bag, shake gently, and copy the words in the order they
leave the bag. "The poem will resemble you."* Weeks earlier at a Dada rally he had
performed the same trick live, pulling random words from a hat for a poem written
on the spot.

**Paris, room 15 of the Beat Hotel, 1958–59.** Painter, writer and calligrapher
**Brion Gysin** — working on drawing mounts atop a stack of old newspapers — sliced
straight through the pile with a Stanley blade and found the broken newspaper
fragments read *"so amusing"* that he began jiggling them around like a collage.
He had accidentally re-found what the Dadaists had theorized four decades earlier,
and immediately saw it as painters' collage applied to writing. Gysin showed the
technique to **William S. Burroughs** when Burroughs arrived in Paris, September 1959, and it "dramatically changed the landscape of American
literature." (Gysin kept refining the technique beyond simple cuts, too — his
"permutation poems" repeated a single phrase with the words rearranged each time.)

**Burroughs, 1959–1964.** The first published experiments appeared in *Minutes to
Go* (1960, a four-way collaboration with Gysin, Gregory Corso and Sinclair
Beiles), which contains *"unedited unchanged cut ups emerging as quite coherent
and meaningful prose"*. Burroughs then applied the method to literature at novel
scale with his "word horde" — a stockpile of cut fragments he drew from for *Naked
Lunch*, *The Soft Machine* (1961), *The Ticket That Exploded* (1962) and *Nova
Express* (1964). In *"The Cut-Up Method of Brion Gysin"* (1961) he laid the theory
out plainly: *"all writing is in fact cut ups"* — the best sentences arrive by
accident, and the cut-up makes the accident mechanical: *"You can not will
spontaneity."*

**Two techniques.** The cut-up is one of two linked methods; the other is the
**fold-in** — overlapping the middle of two pages so their halves fuse, with
Burroughs instructing: *take a page, cut down the middle and cross the middle; the
resulting four sections are re-woven into one text*. Folds of the same text against
itself recombine and mutate with each pass — which is exactly what the **Fold it
in again** button does, feeding the last cut-up back in as the opposing page. His
advice on what to expect: *"When you cut into the present the future leaks out."*

**The Third Mind.** Burroughs and Gysin's collaboration culminated in *The Third
Mind* (1964–77): the idea that two writers cut into and interwoven produce a third,
anonymous author that belongs to neither. Aleator's two Feed inputs (A × B) are a
small ode to that premise — the chimera is not feed A or feed B, it is what happens
between them.

**Afterlife.** The technique leaked out of literature. Filmmaker Antony Balch took
it to cinema (*Towers Open Fire*, *The Cut-Ups*); Gysin and mathematician Ian
Sommerville tunnelled it into audio and produced the Dreamachine. In rock, it went
fully mainstream: **David Bowie** used it as *"a kind of Western tarot"* for his
lyrics (and later a computer program "that would eat the words and spit them back
in some less referential form"); **Kurt Cobain** said *"my lyrics are total cut-up"*
and built his *Montage of Heck* mixtapes from the same impulses; Genesis P-Orridge
carried the method from Throbbing Gristle into industrial music, and Radiohead's
Thom Yorke and Tom Waits have both worked with it. The Beatles put Burroughs
himself on the *Sgt. Pepper* cover.

**Aleator keeps the same chain, automated:** scissors → the sentence/clause splitting
in `app/lib/cutup.js`; two pages over one another → the A/B feeds; the fold-in →
the button. Only the Stanley blade is replaced by JavaScript.

Further reading: [BBC — What is the Cut-Up Method?](https://www.bbc.com/news/magazine-33254672),
[Cut-up technique (Wikipedia)](https://en.wikipedia.org/wiki/Cut-up_technique),
[briongysin.com — Cut ups](https://www.briongysin.com/cut-ups),
[Guardian — When Bowie met Burroughs](https://www.theguardian.com/music/2013/mar/09/david-bowie-william-burroughs),
Open Culture — [Bowie, Cobain & Yorke with the cut-up technique](https://www.openculture.com/2015/02/bowie-cut-up-technique.html).

## How the cut-up works

`app/lib/cutup.js` and `app/lib/articles.js`:

1. **Split** — sources (feed titles + summaries, optionally whole articles
   pulled via Readability, or pasted text) are cleaned and split into
   sentences with [compromise](https://github.com/spencermountain/compromise).
2. **Cut** — sentences are cut into fragment-sized pieces according to the
   configured **cut depth** (see below); over-long fragments are cut through at
   a `maxWords` fence so nothing resists the scissors.
3. **Fold** — fragments are drawn alternately from the two pools by a seeded
   PRNG (mulberry32) and stitched with random seams (`, ` / ` — ` /
   sentence-ending), with case fixes applied at the seams; ~35% of lines get
   an extra third fragment from A or B. Pass the same `seed` to replay any
   fold exactly.

### Cut depth

How far apart the scissors sit is configurable — pass it in the UI ("Cut
depth" selector) or as the `cut` body parameter on `POST /api/cutup`:

| Level         | Terrain                                                              |
|---------------|----------------------------------------------------------------------|
| `clause`      | Sentences sliced only at clause boundaries — Burroughs' broad, stately cuts |
| `phrase` (default) | Clause cuts **plus** adverbial/relational joints (*after*, *with*, *apparently*…), force-halved at a 7-word fence |
| `word`        | Maximum bleed: no grammar rules, pieces of 1–3 words stitched against each other |

The depths live in one obvious place — the `CUT_LEVELS` registry at the top of
`app/lib/cutup.js` — each level defining its `separators` regex (the allowed cut
points) and `maxWords` fence. To add your own depth (say, "sever": 1-word
slots), add an entry to the registry and it is immediately served by the API —
and add the matching `<option>` to the "Cut depth" selector in
`app/public/index.html` if it belongs on screen. Unknown level names quietly
fall back to `phrase`.
