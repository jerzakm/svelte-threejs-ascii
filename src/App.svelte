<script>
  import * as Stats from "stats.js";
  import Ascii from "./components/Ascii.svelte";
  import ThreeCanvas from "./components/ThreeCanvas.svelte";
  import { onMount } from "svelte";

  const pixelSize = 25;
  const color = true;
  const invert = true;
  const debug = false;

  //This logs 3d render to console. Cool but glitchy
  const renderToConsole = true;

  let threeRenderer;
  let myAscii;

  //FPS counter
  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  let mounted;

  //Render loop
  let asciiDom;
  onMount(() => {
    mounted = true;

    animate();
    requestAnimationFrame(animate);
    function animate() {
      requestAnimationFrame(animate);
      stats.begin();
      threeRenderer.render();
      if (myAscii) {
        myAscii.render();
      }
      stats.end();
    }
  });
</script>

<ThreeCanvas bind:this={threeRenderer} {pixelSize} {debug} />

{#if mounted}
  <Ascii
    renderer={threeRenderer.getRenderer()}
    bind:this={myAscii}
    debugCtx={threeRenderer.getDebugContext()}
    camera={threeRenderer.getCamera()}
    {pixelSize}
    {renderToConsole} />
{/if}
