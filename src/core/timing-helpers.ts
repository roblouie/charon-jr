let debounceTimeout: number;

export function debounce(callback: Function, wait: number) {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(callback, wait);
}
