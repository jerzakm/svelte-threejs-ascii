<script>
  export let x;
  export let y;
  export let bColor;
  import { stores } from "../stores";
  import { onMount } from "svelte";
  const hash = `${x},${y}`;

  let char = "x";
  let span;

  stores[hash].subscribe(c => {
    char = c;
  });

  onMount(() => {
    if (bColor) {
      stores[`c${x},${y}`].subscribe(c => {
        span.style.color = c;
      });
    }
  });
</script>

<d bind:this={span}>{char}</d>
