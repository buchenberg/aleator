<script setup>
import { useHorde } from '../store/horde.js';

const { entries, remove, clear } = useHorde();

const preview = (t) => (t.length > 160 ? t.slice(0, 160) + '…' : t);
const label = (kind) => (kind === 'composition' ? 'composition' : kind === 'line' ? 'line' : 'fragment');
const when = (date) => (date ? new Date(date).toLocaleDateString() : '');
</script>

<template>
  <details class="font-serif border-t border-neutral-400 pt-4 mt-8 text-base text-neutral-700">
    <summary class="cursor-pointer select-none text-neutral-500 hover:text-ink text-sm uppercase tracking-widest">
      🎲 Word horde ({{ entries.length }})
    </summary>

    <div class="mt-2 flex items-center gap-3">
      <button
        v-if="entries.length"
        type="button"
        class="text-sm border border-dashed border-neutral-400 px-2 py-0.5 text-neutral-600 hover:text-source-a hover:border-source-a cursor-pointer"
        @click="clear"
      >empty the horde</button>
      <span class="text-xs italic text-neutral-500">click any fragment to stash it · ✚ stashes a line</span>
    </div>

    <p v-if="!entries.length" class="mt-3 italic text-neutral-500">
      empty — every stash you make lands here and can be folded back in against any feed.
    </p>

    <ul class="mt-3 space-y-2">
      <li
        v-for="entry in [...entries].reverse()"
        :key="entry.id"
        class="border-b border-dashed border-neutral-300 pb-2"
      >
        <div class="whitespace-pre-line">{{ preview(entry.text) }}</div>
        <div class="flex items-baseline gap-2 text-xs text-neutral-500 mt-0.5">
          <span class="tracking-wide">
            {{ label(entry.meta?.kind) }}{{ when(entry.meta?.date) ? ' · ' + when(entry.meta?.date) : '' }}{{
              entry.meta?.seed ? ' · seed ' + entry.meta.seed : ''
            }}
          </span>
          <button
            type="button"
            class="text-neutral-400 hover:text-source-a cursor-pointer ml-auto"
            title="remove from horde"
            @click="remove(entry.id)"
          >×</button>
        </div>
      </li>
    </ul>
  </details>
</template>
