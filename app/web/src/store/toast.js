import { ref } from 'vue';

// single-slot toast, latest message wins
const message = ref('');
let timer = null;

export function toast(text) {
  message.value = text;
  clearTimeout(timer);
  timer = setTimeout(() => (message.value = ''), 2200);
}

export function useToast() {
  return { message };
}
