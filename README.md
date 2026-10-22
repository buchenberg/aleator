# aleator

Aleator is a Burroughs-style **cut-up machine**: pick two text sources, and it folds
their sentences and clauses into one random, chimeric text.

William S. Burroughs developed the cut-up method in the 1950s–60s, slicing pages of
text and re-arranging the pieces to reveal new meaning. This app does it with RSS
feeds: choose two feeds (or paste raw text), and the server cuts both into fragments
and splices them together.

## Running

The current implementation lives in [`app/`](app/) — a lean Node.js server with no
database (feed text is parsed in memory on each request). The original 2017
Java/Spring + Stanford CoreNLP implementation is kept under `client/` and `server/`
for posterity.

```
cd app
npm install
npm start
```

Then open http://localhost:3000.

## Using the machine

1. Pick **Source A** and **Source B**. Both offer a dropdown of curated feeds
   grouped by category (News, Science, Tech, Culture), or paste your own feed URL,
   or paste raw text — each source independently uses whichever you filled in
   (text beats URL beats dropdown).
2. Hit **Cut it up**. The output renders line by line, with each fragment
   color-coded by origin: red = Source A, blue = Source B, black = seams and
   wildcards.
3. Hit **Fold it in again** to feed the *current output* back in as Source A
   against your unchanged Source B — Burroughs' recursive fold-in technique.
   Each pass stacks (`fold 2: last cut-up × …`) and the text gets more
   chimeric as it repeats.

## API

- `GET /api/feeds` — curated feeds as `{ feeds: { [category]: [{ name, url }] } }`
  for `<optgroup>` rendering. Edit the `SUGGESTED_FEEDS` array in
  `app/server.js` to change the list.
- `POST /api/cutup` — body `{ sourceA, sourceB, lines }` (lines: 1–24, default 8),
  where each source is `{ url }` or `{ text }`. Returns:

  ```json
  {
    "feeds": ["BBC News", "Hacker News: Front Page"],
    "fragments": [
      {
        "text": "Assembled plain-text line.",
        "pieces": [
          { "lead": "",      "text": "Assembled plain-text line.", "side": "a" },
          { "lead": ", ",    "text": "second fragment",            "side": "b" },
          { "lead": " — ",   "text": "third fragment.",            "side": "x" }
        ]
      }
    ]
  }
  ```

  Each fragment's `side` is its provenance — `a` or `b` for the two sources,
  `x` for the extra third fragment randomly stitched in for chaos — so clients
  can color-code which source each piece came from. `lead` is the seam glued in
  front of each piece (empty for the first), formatted for neutral styling.

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

`app/lib/cutup.js`:

1. **Split** — sources (feed titles + summaries, or pasted text) are cleaned of
   HTML, split into sentences with [compromise](https://github.com/spencermountain/compromise).
2. **Cut** — sentences are cut into clause-sized fragments at commas, dashes,
   colons and coordinating conjunctions; over-long fragments get halved so
   nothing resists the scissors.
3. **Fold** — fragments are drawn alternately from the two pools and stitched
   with random seams (`, ` / ` — ` / sentence-ending), with case fixes applied
   at the seams; ~35% of lines get an extra third fragment from A or B.
