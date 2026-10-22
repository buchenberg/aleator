const FEED_SELECT_A = document.getElementById('feed-a');
const FEED_SELECT_B = document.getElementById('feed-b');
const URL_A = document.getElementById('url-a');
const URL_B = document.getElementById('url-b');
const TEXT_A = document.getElementById('text-a');
const TEXT_B = document.getElementById('text-b');
const LINES = document.getElementById('lines');
const GO = document.getElementById('go');
const FOLD = document.getElementById('fold');
const OUTPUT = document.getElementById('output');

// state of the current fold: the last generated cut-up (fed back in on
// "fold it in again") and how many recursive passes have happened.
const fold = { text: null, count: 0 };

init();

async function init() {
  try {
    const res = await fetch('/api/feeds');
    const { feeds } = await res.json();
    for (const select of [FEED_SELECT_A, FEED_SELECT_B]) {
      const defaultIndex = select === FEED_SELECT_B ? 1 : 0;
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
      // default A to the first feed and B to a different one
      const options = select.querySelectorAll('option');
      const chosen = Math.min(defaultIndex, options.length - 1);
      select.value = options[chosen].value;
    }
  } catch {
    OUTPUT.textContent = '(Could not load curated feeds — you can still paste URLs or text.)';
  }
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
  cutting(true);
  try {
    render(await requestCutup(sourceA, sourceB));
  } catch (err) {
    showError(err);
  } finally {
    cutting(false);
  }
}

/** Burroughs' fold-in: the current cut-up becomes source A, source B stays. */
async function foldIn() {
  if (!fold.text) return;
  const sourceB = sourceSpec(FEED_SELECT_B, URL_B, TEXT_B);
  fold.count++;
  cutting(true, true);
  try {
    render(await requestCutup({ text: fold.text }, sourceB));
  } catch (err) {
    showError(err);
    fold.count--;
    updateFoldButton();
  } finally {
    cutting(false, true);
  }
}

async function requestCutup(sourceA, sourceB) {
  const res = await fetch('/api/cutup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceA,
      sourceB,
      lines: Number(LINES.value) || 8,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function render({ fragments, feeds }) {
  OUTPUT.innerHTML = '';

  const title = document.createElement('p');
  title.className = 'tagline';
  title.textContent = fold.count > 0
    ? `fold ${fold.count}: last cut-up × ${feeds[1]}`
    : `${feeds[0]} × ${feeds[1]}`;
  OUTPUT.appendChild(title);

  for (const line of fragments) {
    const p = document.createElement('p');
    for (const piece of line.pieces) {
      if (piece.lead) {
        const seam = document.createElement('span');
        seam.className = 'frag-x';
        seam.textContent = piece.lead;
        p.appendChild(seam);
      }
      const span = document.createElement('span');
      span.className = `frag-${piece.side}`;
      span.textContent = piece.text;
      p.appendChild(span);
    }
    OUTPUT.appendChild(p);
  }

  // after a successful fold, the previous output is gone — the new
  // cut-up is what gets folded next time around
  fold.text = fragments.map((l) => l.text).join('\n');
  updateFoldButton();
}

function updateFoldButton() {
  FOLD.hidden = false;
  FOLD.textContent = fold.count > 0
    ? `Fold it in again (×${fold.count})`
    : 'Fold it in again';
}

function sourceSpec(select, urlInput, textInput) {
  if (textInput.value.trim()) return { text: textInput.value };
  if (urlInput.value.trim()) return { url: urlInput.value.trim() };
  return { url: select.value };
}

function cutting(started, isFold) {
  GO.disabled = started;
  FOLD.disabled = started;
  if (started) {
    if (isFold) {
      FOLD.textContent = 'Folding…';
    } else {
      GO.textContent = 'Cutting…';
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
