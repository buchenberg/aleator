import { ref } from 'vue';

const entries = ref([]);

const KEY = 'aleator.horde.v1';
const MAX = 200;
const getId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

try {
  const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
  if (Array.isArray(stored)) entries.value = stored;
} catch { /* first run or corrupted horde — start empty */ }

function save() {
  entries.value = entries.value.slice(-MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.value));
  } catch { /* storage full or blocked — the session horde stays */ }
}

export function useHorde() {
  return {
    entries,
    add(text, meta = {}) {
      const clean = String(text || '').trim();
      if (clean.length < 2) return false;
      if (entries.value.some((e) => e.text === clean)) return false; // horde, not ledger
      entries.value.push({
        id: getId(),
        text: clean,
        meta: { kind: 'fragment', date: Date.now(), ...meta },
      });
      save();
      return true;
    },
    remove(id) {
      entries.value = entries.value.filter((e) => e.id !== id);
      save();
    },
    clear() {
      entries.value = [];
      save();
    },
    text() {
      return entries.value.map((e) => e.text).join('\n');
    },
  };
}
