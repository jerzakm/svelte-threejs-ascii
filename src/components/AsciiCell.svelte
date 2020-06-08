<script>
  export let x;
  export let y;
  export let color;
  import { stores } from "../stores";
  import { onMount } from "svelte";
  const hash = `${x},${y}`;

  let char = "x";
  let span;

  stores[hash].subscribe(c => {
    char = c;
  });

  onMount(() => {
    if (color) {
      stores[`c${x},${y}`].subscribe(c => {
        span.style.color = c;
      });
    }
  });
</script>

{#if color}
  <span bind:this={span}>{char}</span>
{:else}{char}{/if}
