<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { rollDie } from '../lib/dice.js';
import { keyClack, returnBell } from '../lib/audio.js';

const props = defineProps({
  fragments: { type: Array, default: () => [] }, // [{pieces:[{lead,text,side}]}]
  feeds: { type: Array, default: () => ['—', '—'] },
  seed: { type: String, default: null },
  folded: { type: Number, default: 0 }, // 0 = fresh run, n = fold number
  typewriter: { type: Boolean, default: false },
  permalink: { type: String, default: '' },
  error: { type: String, default: '' },
  busy: { type: Boolean, default: false },
});

const emit = defineEmits(['stash-piece', 'stash-line', 'stash-composition', 'reroll']);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const chipText = ref('');

// typewriter cursor position across the whole composed flow
const progress = ref({ line: 0, piece: 0, char: 0 });
let session = 0;
const typingActive = ref(false);

watch(
  () => [props.fragments, props.typewriter],
  () => startReveal(),
  { immediate: true },
);

onBeforeUnmount(() => { session++; });

function pieceFull(line, piece) {
  const p = props.fragments[line]?.pieces?.[piece];
  return p ? p.lead + p.text : '';
}

/** How many chars of a piece are revealed given the cursor position. */
function charsFor(line, piece) {
  const full = pieceFull(line, piece).length;
  const { line: cl, piece: cp, char } = progress.value;
  if (line < cl || (line === cl && piece < cp)) return full; // behind the cursor
  if (line > cl || (line === cl && piece > cp)) return 0;    // ahead of it
  return Math.max(0, Math.min(char, full));
}

function seamVisible(line, piece) {
  return pieceFull(line, piece).slice(0, charsFor(line, piece)).slice(0, props.fragments[line]?.pieces?.[piece]?.lead?.length ?? 0);
}

function textVisible(line, piece) {
  const p = props.fragments[line]?.pieces?.[piece];
  if (!p) return '';
  const start = p.lead.length;
  return pieceFull(line, piece).slice(start, Math.max(start, charsFor(line, piece)));
}

async function startReveal() {
  const target = ++session;
  progress.value = { line: 0, piece: 0, char: 0 };
  chipText.value = '';

  const typing = props.typewriter && !reducedMotion && props.fragments.length > 0;
  if (!typing) {
    typingActive.value = false;
    progress.value = { line: props.fragments.length, piece: 0, char: 0 };
    return;
  }
  typingActive.value = true;
  for (let line = 0; line < props.fragments.length; line++) {
    const pieces = props.fragments[line]?.pieces || [];
    for (let piece = 0; piece < pieces.length; piece++) {
      const total = pieceFull(line, piece).length;
      for (let char = 1; char <= total; char++) {
        if (target !== session) return;
        progress.value = { line, piece, char };
        const text = pieceFull(line, piece);
        if (text[char - 1] !== ' ') keyClack();
        await new Promise((r) => setTimeout(r, 24 + Math.random() * 26));
      }
    }
    if (target !== session) return;
    progress.value = { line, piece: pieces.length, char: 0 };
    returnBell();
    await new Promise((r) => setTimeout(r, 260));
  }
  if (target !== session) return;
  typingActive.value = false;
  progress.value = { line: props.fragments.length, piece: 0, char: 0 };
}

async function copyPermalink() {
  try {
    await navigator.clipboard.writeText(props.permalink);
    chipText.value = '🎲 copied ✓';
    setTimeout(() => (chipText.value = ''), 1500);
  } catch { /* clipboard blocked — permalink still shown via title */ }
}

const title = computed(() =>
  props.folded > 0
    ? `fold ${props.folded}: last cut-up × ${props.feeds[1]}`
    : `${props.feeds[0]} × ${props.feeds[1]}`,
);
</script>

<template>
  <section aria-live="polite" class="font-serif text-xl leading-relaxed border-t border-neutral-400 pt-6">
    <p v-if="busy" class="italic text-neutral-500">waiting for the scissors…</p>

    <p v-else-if="error" class="text-source-a">{{ error }}</p>

    <template v-else-if="fragments.length">
      <p class="italic text-neutral-600 text-base">
        <button
          type="button"
          class="die-roll cursor-pointer hover:scale-125 transition-transform"
          title="roll again (same settings, new seed)"
          @click="emit('reroll')"
        >{{ rollDie() }}</button>
        {{ title }}
      </p>

      <button
        v-if="permalink"
        type="button"
        class="block text-sm border border-dashed border-neutral-400 text-neutral-600 px-2 py-0.5 my-2 hover:text-ink hover:border-ink cursor-pointer"
        @click="copyPermalink"
      >{{ chipText || `🎲 ${seed} · ⧉ permalink` }}</button>

      <p v-for="(line, li) in fragments" :key="li" class="relative group pr-6">
        <template v-for="(piece, pi) in line.pieces" :key="pi">
          <span v-if="piece.lead" class="text-ink">{{ seamVisible(li, pi) }}</span>
          <span
            :class="['cursor-pointer hover:bg-black/10 rounded-sm px-0.5', piece.side === 'a' ? 'text-source-a' : piece.side === 'b' ? 'text-source-b' : 'text-ink']"
            title="click to stash this fragment in the word horde"
            @click="emit('stash-piece', piece.text)"
          >{{ textVisible(li, pi) }}</span>
        </template>
        <button
          type="button"
          class="absolute right-0 top-0 text-xs text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-ink cursor-pointer"
          title="stash this line in the word horde"
          @click="emit('stash-line', line.pieces.map((p) => p.lead + p.text).join(''))"
        >✚</button>
      </p>

      <button
        type="button"
        class="mt-2 text-sm border border-neutral-400 text-neutral-700 px-3 py-1 hover:border-ink hover:text-ink cursor-pointer"
        @click="emit('stash-composition')"
      >✚ Stash whole composition</button>
    </template>
  </section>
</template>
