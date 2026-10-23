<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import SourcePicker from './components/SourcePicker.vue';
import PermDial from './components/PermDial.vue';
import OutputPanel from './components/OutputPanel.vue';
import HordeDrawer from './components/HordeDrawer.vue';
import AboutPanel from './components/AboutPanel.vue';
import { useHorde } from './store/horde.js';
import { toast, useToast } from './store/toast.js';
import { newSeed } from './lib/dice.js';

const horde = useHorde();
const { message: toastMessage } = useToast();

/* ── form state ──────────────────────────────────────────────────────────── */
const categories = ref({});
const sideA = reactive({ feed: '', url: '', text: '', useHorde: false });
const sideB = reactive({ feed: '', url: '', text: '', useHorde: false });
const lines = ref(8);
const cut = ref('phrase');
const fulltext = ref(false);
const typewriter = ref(true);

/* ── run state ───────────────────────────────────────────────────────────── */
const out = reactive({
  fragments: [],
  feeds: ['—', '—'],
  seed: null,
  permalink: '',
  folded: 0,
  error: '',
  busy: false,
});
const foldCounter = ref(0);
const foldText = ref('');
const lastSpec = ref(null); // { sourceA, sourceB, folded } for die re-rolls

/* ── init: feeds + share links ───────────────────────────────────────────── */
onMounted(async () => {
  try {
    const res = await fetch('/api/feeds');
    const { feeds } = await res.json();
    categories.value = feeds;
  } catch {
    out.error = 'Could not load curated feeds — you can still paste URLs or text.';
    return;
  }

  const flatFeeds = Object.values(categories.value).flat().map((f) => f.url);
  if (flatFeeds[0]) sideA.feed = flatFeeds[0];
  if (flatFeeds[1]) sideB.feed = flatFeeds[1];

  const q = new URLSearchParams(location.search);
  if (!q.has('seed') && !q.has('fa') && !q.has('fb')) return;

  pickSlotFor(sideA, q.get('fa'), flatFeeds);
  pickSlotFor(sideB, q.get('fb'), flatFeeds);
  if (['clause', 'phrase', 'word'].includes(q.get('cut'))) cut.value = q.get('cut');
  if (Number(q.get('lines')) >= 1) lines.value = Number(q.get('lines'));
  fulltext.value = q.get('ft') === '1';
  if (q.has('tw')) typewriter.value = q.get('tw') === '1';

  const { seed, fa, fb } = { seed: q.get('seed'), fa: q.get('fa'), fb: q.get('fb') };
  if (seed && fa && fb) {
    out.busy = true;
    await doRun({ url: fa }, { url: fb }, seed, 0);
    out.busy = false;
  }
});

/** Feed URL → chosen dropdown, else → the custom URL input. */
function pickSlotFor(slot, url, flatFeeds) {
  if (!url) return;
  if (flatFeeds.includes(url)) slot.feed = url;
  else slot.url = url;
}

/* ── sources ─────────────────────────────────────────────────────────────── */

function sourceOf(side) {
  // the horde outranks feeds but not hand-pasted text
  if (side.useHorde && horde.text().trim().length > 0) return { text: horde.text() };
  if (side.text.trim()) return { text: side.text };
  const spec = side.url.trim() ? { url: side.url.trim() } : { url: side.feed };
  if (fulltext.value) spec.full = true;
  return spec;
}

/* ── running / folding / rerolling ───────────────────────────────────────── */

async function run() {
  const sourceA = sourceOf(sideA);
  const sourceB = sourceOf(sideB);
  foldCounter.value = 0;
  await doRun(sourceA, sourceB, newSeed(), 0);
}

async function foldIn() {
  if (!foldText.value) return;
  const folded = foldCounter.value + 1;
  await doRun({ text: foldText.value }, sourceOf(sideB), newSeed(), folded);
}

async function reroll() {
  if (lastSpec.value) {
    const { sourceA, sourceB, folded } = lastSpec.value;
    await doRun(sourceA, sourceB, newSeed(), folded);
  }
}

async function doRun(sourceA, sourceB, seed, folded) {
  out.busy = true;
  out.error = '';
  try {
    const res = await fetch('/api/cutup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceA, sourceB, lines: lines.value, cut: cut.value, seed }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    out.fragments = data.fragments;
    out.feeds = data.feeds;
    out.seed = data.seed;
    out.folded = folded;
    out.permalink = buildPermalink(seed, sourceA, sourceB);
    foldText.value = data.fragments.map((l) => l.text).join('\n');
    lastSpec.value = { sourceA, sourceB, folded };
  } catch (err) {
    out.error = err.message;
    out.fragments = [];
  } finally {
    out.busy = false;
  }
}

function buildPermalink(seed, sourceA, sourceB) {
  if (!(sourceA?.url && sourceB?.url)) return ''; // pasted text & horde sources can't travel
  const q = new URLSearchParams({
    seed,
    fa: sourceA.url,
    fb: sourceB.url,
    cut: cut.value,
    lines: String(lines.value),
  });
  if (fulltext.value) q.set('ft', '1');
  if (typewriter.value) q.set('tw', '1');
  return `${location.origin}${location.pathname}?${q}`;
}

/* ── stashing ────────────────────────────────────────────────────────────── */

function metaFor(kind) {
  return { seed: out.seed, feeds: [...out.feeds], kind, date: Date.now() };
}

function stashPiece(pieceText) {
  const clean = String(pieceText || '').replace(/[,;:.—]+$/, '').trim();
  if (horde.add(clean, metaFor('fragment'))) toast(`stashed in the word horde 🎲 (${horde.entries.value.length})`);
}

function stashLine(lineText) {
  if (horde.add(String(lineText || '').trim(), metaFor('line'))) toast(`stashed in the word horde 🎲 (${horde.entries.value.length})`);
}

function stashComposition() {
  if (horde.add(foldText.value, metaFor('composition'))) toast(`whole composition stashed 🎲 (${horde.entries.value.length})`);
}

function stashPerm(text) {
  if (horde.add(text, { seed: out.seed, kind: 'composition', date: Date.now() })) {
    toast(`the dial is in the horde 🎲 (${horde.entries.value.length})`);
  }
}
</script>

<template>
  <main class="max-w-2xl mx-auto px-4 py-10">
    <h1 class="text-5xl tracking-tight font-serif m-0">
      <span class="die text-[0.55em] align-baseline mr-1 select-none" aria-hidden="true">🎲</span>aleator
    </h1>
    <p class="italic text-neutral-600 mt-1">
      fold two feed sources into one cut-up, William S. Burroughs style.
    </p>

    <form id="cutup-form" class="grid gap-4 my-8" @submit.prevent="run">
      <PermDial @stash="stashPerm" />

      <SourcePicker v-model:feed="sideA.feed" v-model:url="sideA.url" v-model:text="sideA.text"
        v-model:use-horde="sideA.useHorde" side="a" label="Source A" :categories="categories" :busy="out.busy" />

      <SourcePicker v-model:feed="sideB.feed" v-model:url="sideB.url" v-model:text="sideB.text"
        v-model:use-horde="sideB.useHorde" side="b" label="Source B" :categories="categories" />

      <div class="grid gap-2 text-base font-serif">
        <label for="lines">
          Lines:
          <input id="lines" v-model.number="lines" type="number" min="1" max="24"
            class="w-16 border border-neutral-500 bg-white px-2 py-1 font-serif">
        </label>
        <label>
          Cut depth:
          <select v-model="cut" class="border border-neutral-500 bg-white px-2 py-1 font-serif">
            <option value="clause">clause</option>
            <option value="phrase">phrase</option>
            <option value="word">word shrapnel</option>
          </select>
        </label>
        <div class="flex items-center gap-6 text-sm text-neutral-700">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input v-model="fulltext" type="checkbox" class="accent-ink"> Pull full articles
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input v-model="typewriter" type="checkbox" class="accent-ink"> Typewriter
          </label>
        </div>
        <button
          type="submit"
          class="justify-self-start border-2 border-ink bg-ink text-paper px-5 py-1.5 font-serif text-lg cursor-pointer disabled:opacity-50"
          :disabled="out.busy"
        >{{ out.busy ? 'Cutting…' : fulltext ? 'Cut it up (pulling articles)' : 'Cut it up' }}</button>
      </div>
    </form>

    <button
      id="fold"
      type="button"
      class="hidden border-2 border-ink text-ink px-3 py-1 font-serif cursor-pointer disabled:opacity-50"
      :class="{ '!block': foldText && !out.busy }"
      :disabled="out.busy"
      @click="foldIn"
    >{{ foldCounter > 0 ? `Fold it in again (×${foldCounter})` : 'Fold it in again' }}</button>

    <OutputPanel
      class="mt-6"
      :fragments="out.fragments"
      :feeds="out.feeds"
      :seed="out.seed"
      :folded="out.folded"
      :typewriter="typewriter"
      :permalink="out.permalink"
      :error="out.error"
      :busy="out.busy"
      @stash-piece="stashPiece"
      @stash-line="stashLine"
      @stash-composition="stashComposition"
      @reroll="reroll"
    />

    <HordeDrawer />
    <AboutPanel />

    <Teleport to="body">
      <Transition name="horde">
        <div
          v-if="toastMessage"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-paper px-4 py-2 text-sm font-serif shadow-lg"
        >{{ toastMessage }}</div>
      </Transition>
    </Teleport>
  </main>
</template>
