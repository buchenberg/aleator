const FEED_SELECT_A = document.getElementById('feed-a');
const FEED_SELECT_B = document.getElementById('feed-b');
const URL_A = document.getElementById('url-a');
const URL_B = document.getElementById('url-b');
const TEXT_A = document.getElementById('text-a');
const TEXT_B = document.getElementById('text-b');
const LINES = document.getElementById('lines');
const CUT = document.getElementById('cut');
const FULLTEXT = document.getElementById('fulltext');
const TYPEWRITER = document.getElementById('typewriter');
const GO = document.getElementById('go');
const FOLD = document.getElementById('fold');
const OUTPUT = document.getElementById('output');

// the machine rolls A die face for every cut-up it emits
const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const rollDie = () => DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)];

// state of the current fold: the last generated cut-up (fed back in on
// "fold it in again"), how many recursive passes happened, and the seed
// of the run on screen (so share links point at this exact cut-up).
const fold = { text: null, count: 0 };
let currentSeed = null;

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

init();

async function init() {
  loadAbout();
  try {
    const res = await fetch('/api/feeds');
    const { feeds } = await res.json();
    for (const select of [FEED_SELECT_A, FEED_SELECT_B]) {
      for (const [category, feedList] of Object.entries(feeds)) {
        const group = document.createElement('optgroup');
        group.label = category;
        feedList.forEach((feed) => {
          const opt = document.createElement('option');
          opt.value = feed.url;
          opt.textContent = feed.name;
          group.appendChild(opt);
        });
        select.appendChild(group);
      }
    }
    applyLocationParams();
    // default A to the first feed and B to a different one
    if (!location.search) setDefaultFeeds();
  } catch {
    OUTPUT.textContent = '(Could not load curated feeds — you can still paste URLs or text.)';
  }
}

function setDefaultFeeds() {
  for (const select of [FEED_SELECT_A, FEED_SELECT_B]) {
    const options = select.querySelectorAll('option');
    const choose = select === FEED_SELECT_B ? Math.min(1, options.length - 1) : 0;
    if (options.length > 0) select.value = options[choose].value;
  }
}

/** Share links: ?seed=&fa=&fb=&cut=&lines=&ft=&tw= prefill and auto-run. */
function applyLocationParams() {
  const q = new URLSearchParams(location.search);
  if (!q.has('seed') && !q.has('fa') && !q.has('fb')) return false;

  pickSlot(FEED_SELECT_A, URL_A, q.get('fa'));
  pickSlot(FEED_SELECT_B, URL_B, q.get('fb'));
  if (q.has('cut')) {
    const opt = CUT.querySelector(`option[value="${q.get('cut')}"]`);
    if (opt) CUT.value = opt.value;
  }
  if (q.has('lines') && Number(q.get('lines')) >= 1) LINES.value = q.get('lines');
  FULLTEXT.checked = q.get('ft') === '1';
  if (q.has('tw')) TYPEWRITER.checked = q.get('tw') === '1';

  // auto-run the linked cut-up once the first URL-source slot is valid
  if (q.get('seed') && (q.get('fa') || q.get('fb'))) {
    setTimeout(() => {
      fold.count = 0;
      const sourceA = sourceSpec(FEED_SELECT_A, URL_A, TEXT_A);
      const sourceB = sourceSpec(FEED_SELECT_B, URL_B, TEXT_B);
      if (!sourceA.url || !sourceB.url) return; // need both feed URLs to replay
      sourceA.url = q.get('fa') ?? sourceA.url;
      sourceB.url = q.get('fb') ?? sourceB.url;
      queenRun(sourceA, sourceB, q.get('seed'));
    }, 0);
    return true;
  }
  return false;
}

function pickSlot(select, urlInput, url) {
  if (!url) return;
  const matching = [...select.querySelectorAll('option')].find((o) => o.value === url);
  if (matching) select.value = url;
  else urlInput.value = url;
}

document.getElementById('cutup-form').addEventListener('submit', (ev) => {
  ev.preventDefault();
  run();
});

FOLD.addEventListener('click', () => foldIn());

/** Fresh run: source A + source B from the form, fold counter resets. */
async function run() {
  const sourceA = sourceSpec(FEED_SELECT_A, URL_A, TEXT_A);
  const sourceB = sourceSpec(FEED_SELECT_B, URL_B, TEXT_B);
  fold.count = 0;
  await queenRun(sourceA, sourceB, newSeed());
}

/** Burroughs' fold-in: the current cut-up becomes source A, source B stays. */
async function foldIn() {
  if (!fold.text) return;
  const sourceB = sourceSpec(FEED_SELECT_B, URL_B, TEXT_B);
  fold.count++;
  cutting(true, true);
  try {
    await renderWrapped(
      await requestCutup({ text: fold.text }, sourceB, newSeed()),
      { folded: true },
    );
  } catch (err) {
    showError(err);
    fold.count--;
    updateFoldButton();
  } finally {
    cutting(false, true);
  }
}

/** Shared runner: takes explicit source dicts and a seed, renders, records. */
async function queenRun(sourceA, sourceB, seed) {
  cutting(true);
  try {
    await renderWrapped(await requestCutup(sourceA, sourceB, seed), {});
  } catch (err) {
    showError(err);
  } finally {
    cutting(false);
  }
}

function newSeed() {
  return Math.random().toString(36).slice(2, 8);
}

async function requestCutup(sourceA, sourceB, seed) {
  const res = await fetch('/api/cutup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceA,
      sourceB,
      lines: Number(LINES.value) || 8,
      cut: CUT.value,
      seed,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return { ...data, sourceA, sourceB };
}

/* ── rendering ──────────────────────────────────────────────────────────── */

let typingSession = 0;

async function renderWrapped(data, { folded = false } = {}) {
  currentSeed = data.seed ?? null;
  const session = ++typingSession;

  OUTPUT.innerHTML = '';

  const title = document.createElement('p');
  title.className = 'tagline';
  const label = folded
    ? `fold ${fold.count}: last cut-up × ${data.feeds[1]}`
    : `${data.feeds[0]} × ${data.feeds[1]}`;
  const dieRoll = document.createElement('span');
  dieRoll.className = 'die-roll';
  dieRoll.textContent = rollDie();
  title.appendChild(dieRoll);
  title.appendChild(document.createTextNode('  ' + label));
  OUTPUT.appendChild(title);

  const meta = permalink(data);
  if (meta) {
    const chip = document.createElement('button');
    chip.className = 'seed-chip';
    chip.innerHTML = `🎲 ${currentSeed} · ⧉ permalink`;
    chip.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(meta);
        chip.textContent = '🎲 copied ✓';
        setTimeout(() => (chip.textContent = `🎲 ${currentSeed} · ⧉ permalink`), 1500);
      } catch { /* clipboard blocked — the seed still shows */ }
    });
    OUTPUT.appendChild(chip);
  }

  // build every line as spans that know their full text but start empty,
  // then (optionally) type them out left-to-right, line by line
  const spans = [];
  for (const line of data.fragments) {
    const p = document.createElement('p');
    for (const piece of line.pieces) {
      if (piece.lead) {
        const seam = document.createElement('span');
        seam.className = 'frag-x';
        seam.dataset.t = piece.lead;
        p.appendChild(seam);
        spans.push(seam);
      }
      const span = document.createElement('span');
      span.className = `frag-${piece.side}`;
      span.dataset.t = piece.text;
      p.appendChild(span);
      spans.push(span);
    }
    OUTPUT.appendChild(p);
  }

  const typing = TYPEWRITER.checked && !reducedMotion;
  if (typing) {
    await typewrite(spans, session);
  } else {
    for (const span of spans) span.textContent = span.dataset.t;
  }

  // after a successful fold, the previous output is gone — the new
  // cut-up is what gets folded next time around
  fold.text = data.fragments.map((l) => l.text).join('\n');
  updateFoldButton();
  permUrl(data, meta);
}

async function typewrite(spans, session) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const el of spans) {
    const text = el.dataset.t;
    el.textContent = '';
    for (let i = 0; i < text.length; i++) {
      if (session !== typingSession) return; // a newer render took over
      el.textContent += text[i];
      if (text[i] !== ' ') keyClack();
      await sleep(24 + Math.random() * 26);
    }
    returnBell();
    await sleep(260);
  }
}

/* ── typewriter audio (no assets: WebAudio oscillation & noise) ─────────── */

let audio = null;
function ensureAudio() {
  try {
    audio = audio ?? new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    return audio;
  } catch { return null; }
}

function keyClack() {
  const ctx = ensureAudio();
  if (!ctx || ctx.state !== 'running') return;
  const noise = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
  const channel = noise.getChannelData(0);
  for (let i = 0; i < channel.length; i++) channel[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 2600;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  src.connect(band).connect(gain).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + 0.04);
}

function returnBell() {
  const ctx = ensureAudio();
  if (!ctx || ctx.state !== 'running') return;
  const bell = ctx.createOscillator();
  bell.frequency.value = 1440;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.07, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.28);
  bell.connect(gain).connect(ctx.destination);
  bell.start();
  bell.stop(ctx.currentTime + 0.3);
}

/* ── about section (fetches the rendered README) ────────────────────────── */

async function loadAbout() {
  const body = document.querySelector('.about-body');
  try {
    const res = await fetch('/api/about');
    if (!res.ok) throw new Error(res.statusText);
    const { html } = await res.json();
    body.innerHTML = html;
  } catch {
    body.innerHTML = '<p>The machine\'s documentation could not be loaded — see README.md.</p>';
  }
}

/* ── permalinks ─────────────────────────────────────────────────────────── */

function permalink(data) {
  // pasted-text sources can't travel in a URL — permalink needs both feeds
  if (!currentSeed || !(data.sourceA?.url && data.sourceB?.url)) return null;
  const q = new URLSearchParams({
    seed: currentSeed,
    fa: data.sourceA.url,
    fb: data.sourceB.url,
    cut: CUT.value,
    lines: String(Number(LINES.value) || 8),
  });
  if (FULLTEXT.checked) q.set('ft', '1');
  if (TYPEWRITER.checked) q.set('tw', '1');
  return `${location.origin}${location.pathname}?${q}`;
}

function permUrl(data, permalink) {
  if (permalink) {
    history.replaceState(null, '', permalink.replace(location.origin, ''));
  }
}

function updateFoldButton() {
  FOLD.hidden = false;
  FOLD.textContent = fold.count > 0
    ? `Fold it in again (×${fold.count})`
    : 'Fold it in again';
}

function sourceSpec(select, urlInput, textInput) {
  if (textInput.value.trim()) return { text: textInput.value };
  const spec = urlInput.value.trim()
    ? { url: urlInput.value.trim() }
    : { url: select.value };
  if (FULLTEXT.checked) spec.full = true;
  return spec;
}

function cutting(started, isFold) {
  GO.disabled = started;
  FOLD.disabled = started;
  if (started) {
    if (isFold) {
      FOLD.textContent = 'Folding…';
    } else {
      GO.textContent = FULLTEXT.checked ? 'Cutting… (pulling articles)' : 'Cutting…';
      OUTPUT.innerHTML = '<p class="tagline">waiting for the scissors…</p>';
    }
  } else {
    GO.textContent = 'Cut it up';
    updateFoldButton();
  }
}

function showError(err) {
  OUTPUT.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'err';
  p.textContent = err.message;
  OUTPUT.appendChild(p);
}
