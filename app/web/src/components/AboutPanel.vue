<script setup>
import { ref } from 'vue';

const html = ref(`The machine's documentation could not be loaded — see README.md.`);

fetch('/api/about')
  .then((res) => (res.ok ? res.json() : Promise.reject(res)))
  .then(({ html: about }) => (html.value = about))
  .catch(() => { /* keep fallback */ });
</script>

<template>
  <details class="font-serif border-t border-neutral-400 pt-4 mt-8 text-base text-neutral-700">
    <summary class="cursor-pointer select-none text-neutral-500 hover:text-ink text-sm uppercase tracking-widest">
      📖 About the machine
    </summary>
    <div class="mt-3 max-w-[40rem] leading-relaxed about-shell" v-html="html"></div>  </details>
</template>
