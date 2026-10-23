<script setup>
import { ref } from 'vue';
import { rollDie, DIE_FACES } from '../lib/dice.js';

const phrase = ref('');
const busy = ref(false);
const error = ref('');
const results = ref([]);

async function permute() {
  if (!phrase.value.trim() || busy.value) return;
  busy.value = true;
  error.value = '';
  results.value = [];
  try {
    const res = await fetch('/api/permute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: phrase.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    results.value = data.results;
  } catch (err) {
    error.value = err.message;
  } finally {
    busy.value = false;
  }
}

const emit = defineEmits(['stash']);
</script>

<template>
  <fieldset class="border border-neutral-400 px-4 pb-3 pt-1.5 grid gap-2 font-serif">
    <legend class="font-bold px-1.5">Permutations — Gysin's dial</legend>

    <div class="flex gap-2">
      <input
        v-model="phrase"
        type="text"
        placeholder="one phrase, rotated by every word…"
        class="grow border border-neutral-500 bg-white px-2 py-1.5 font-serif"
        @keydown.enter.prevent="permute"
      >
      <button
        type="button"
        class="border-2 border-ink bg-ink text-paper px-3 py-1 cursor-pointer disabled:opacity-50"
        :disabled="busy"
        @click="permute"
      >{{ busy ? 'perm…' : 'Perm' }}</button>
    </div>

    <p v-if="error" class="text-source-a text-sm">{{ error }}</p>

    <div v-if="results.length" id="perm-out">
      <p class="italic text-neutral-600 text-sm">{{ results.length }} readings of the same phrase:</p>
      <p v-for="(line, i) in results" :key="i" class="text-lg leading-relaxed">
        <span class="die-roll">{{ DIE_FACES[i % DIE_FACES.length] }}</span>{{ line }}
      </p>
      <button
        type="button"
        class="mt-1 text-sm border border-dashed border-neutral-400 px-2 py-0.5 text-neutral-600 hover:text-ink hover:border-ink cursor-pointer"
        @click="emit('stash', results.join('\n'))"
      >✚ stash the whole dial</button>
    </div>
  </fieldset>
</template>
