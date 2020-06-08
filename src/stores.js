import {
  writable
} from 'svelte/store';

export let stores = {}

export const initStores = (x, y, color) => {
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      stores[`${i},${j}`] = writable('.')
      if (color) {
        stores[`c${i},${j}`] = writable(`rgb(255,255,255)`)
      }
    }
  }
}