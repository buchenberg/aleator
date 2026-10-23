# aleator — development

Developer documentation for the machine: how to run it locally, the HTTP
surface it serves, and where the knobs live. User-facing documentation of
the instrument itself is in the [README](README.md).

## Layout

```
app/
  server.js          Express server: static client + JSON API
  lib/
    cutup.js         split / cut / fold pipeline, CUT_LEVELS registry, seeded PRNG
    articles.js      full-article fetching + Readability extraction
  public/            the client (no build step): index.html, main.js, style.css
docs/
  ROADMAP.md         shipped features + ideas on the bench
```

## Running

```
cd app
npm install
npm start     # node server.js → http://localhost:3000
npm run dev   # node --watch: server restarts on edits
```

The client files are served statically per request — no build step, no
restart needed for `index.html` / `main.js` / `style.css` changes.
`PORT` (default 3000) is the only environment knob.

## Stopping / restarting

Foreground instance: Ctrl-C. Background instance:

```
kill $(lsof -ti:3000)      # graceful stop of whatever holds port 3000
```

Always confirm the old process is gone before starting a new one, or the
new one fails silently with `EADDRINUSE` and the *stale* server keeps
answering.

## API

### `GET /api/feeds`

Curated feeds as `{ feeds: { [category]: [{ name, url }] } }` for
`<optgroup>` rendering. Edit the `SUGGESTED_FEEDS` array in
`app/server.js` to change the gallery.

### `POST /api/cutup`

Body `{ sourceA, sourceB, lines, cut, seed }`:

- `lines` — output line count, 1–24, default 8
- `cut` — `'clause' | 'phrase' | 'word'`, default `'phrase'`
  (see [Cut depth](#cut-depth))
- `seed` — any string or number; replayable runs (below)
- `sourceA` / `sourceB` — each `{ url }` or `{ text }`. URL sources accept an
  optional `full: true` to pull whole article bodies (Readability) instead of
  titles + summaries.

Response:

```json
{
  "feeds": ["BBC News", "Hacker News: Front Page"],
  "seed": "pool9x",
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

### Seeded runs

Every fold decision (fragment picks, seams, the ~35% chaos roll, word-chunk
sizes) rolls from a mulberry32 PRNG keyed by FNV-1a hash of `seed`. Same
seed + same corpus → byte-identical cut-up. Feeds move over time, so old
seeds replay the *cut pattern* against whatever is on the front pages at
replay time (`?seed=…&fa=…&fb=…&cut=…&lines=…` in the client URL encodes it).

### `GET /api/about`

`README.md` from the repo root, parsed with `marked` — the page's About
section renders it verbatim so docs can't drift from the UI.

## Tuning registries

- **`CUT_LEVELS`** (`app/lib/cutup.js`) — each entry defines `separators`
  (allowed cut points as one regex) and `maxWords` (fence length). Adding an
  entry exposes a new depth to the API; add a matching `<option>` in
  `app/public/index.html` to surface it in the UI. Unknown `cut` values fall
  back to `phrase`.
- **`SUGGESTED_FEEDS`** (`app/server.js`) — name, URL, category; grouped for
  the client automatically.

## Notes on hosts

- Identify with a custom `User-Agent` (the server already does): rate-limited
  feed hosts such as `hnrss.org` answer blank/default UAs with 429s. The
  server retries 429s with a short backoff (`parseFeedWithRetry`).
- Full-article pulls are capped (6 links, concurrency 3, 8s timeout, 400KB
  body cap) and quietly skip failures — a dead article never blocks a fold.
