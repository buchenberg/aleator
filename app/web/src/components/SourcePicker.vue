<script setup>
const props = defineProps({
  side: { type: String, required: true },
  label: { type: String, required: true },
  categories: { type: Object, default: () => ({}) },
  busy: { type: Boolean, default: false },
});

const feed = defineModel('feed', { type: String, default: '' });
const url = defineModel('url', { type: String, default: '' });
const text = defineModel('text', { type: String, default: '' });
const useHordeFlag = defineModel('useHorde', { type: Boolean, default: false });

const swatch = side === 'a' ? 'bg-source-a' : 'bg-source-b';
</script>

<template>
  <fieldset class="border border-neutral-400 px-4 pb-3 pt-1.5 grid gap-2 text-base font-serif">
    <legend class="font-bold px-1.5">
      {{ label }} <span class="inline-block w-3 h-3 rounded-full align-baseline ml-1" :class="swatch"></span>
    </legend>

    <select v-model="feed" class="border border-neutral-500 bg-white px-2 py-1.5 font-serif">
      <optgroup v-for="(feedList, category) in categories" :key="category" :label="category">
        <option v-for="f in feedList" :key="f.url" :value="f.url">{{ f.name }}</option>
      </optgroup>
    </select>

    <input
      v-model="url"
      type="url"
      placeholder="or paste a feed URL"
      class="border border-neutral-500 bg-white px-2 py-1.5 font-serif"
    >

    <textarea
      v-model="text"
      placeholder="or paste raw text"
      class="border border-neutral-500 bg-white px-2 py-1.5 font-serif min-h-14 resize-y"
    ></textarea>

    <label class="flex items-center gap-1.5 text-sm text-neutral-600">
      <input v-model="useHordeFlag" type="checkbox" class="accent-ink">
      fold from the word horde
    </label>

    <span v-if="busy" class="text-xs italic text-neutral-500">waiting for the scissors…</span>
  </fieldset>
</template>
