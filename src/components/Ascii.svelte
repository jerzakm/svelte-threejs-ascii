<script>
  import { onMount } from "svelte";
  import { initStores, stores } from "../stores";
  import AsciiCell from "./AsciiCell.svelte";
  import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

  // ascii charlist
  export let charSet = " .:|=~8";
  $: aCharList = charSet.split("");

  // render colors?
  export let color = true;
  // invert rendered brightness
  export let invert = true;

  // three webgl renderer
  export let renderer;
  // 2d debug context
  export let debugCtx;

  // 1 ascii Size in pixels
  export let pixelSize;

  // three camera used for Trackball controlls
  export let camera;

  // temp ascii char and color store for comparison
  let tempStore = {};

  let inner;
  export let renderToConsole;

  let width = window.innerWidth;
  let height = window.innerHeight;

  // dom container
  let domElement;
  // ascii table
  let asciiTable;

  let iWidth;
  let iHeight;
  let oImg;
  let oCanvasImg;
  let oCanvas = document.createElement("canvas");
  let oCtx;
  let controls;
  let gl;

  let mounted;
  var fResolution;

  // three renderer size
  renderer.setSize(width, height);

  // ascii resolution
  iWidth = Math.round(width / pixelSize);
  iHeight = Math.round(height / pixelSize);

  initStores(iWidth, iHeight, color);

  onMount(() => {
    controls = new TrackballControls(camera, domElement);
    oCanvas.width = iWidth;
    oCanvas.height = iHeight;

    setTableStyles(asciiTable);
    oCanvasImg = renderer.domElement;

    mounted = true;
  });

  function setTableStyles(asciiTable) {
    asciiTable.cellSpacing = 0;
    asciiTable.cellPadding = 0;

    asciiTable.style.position = "fixed";
    asciiTable.style.whiteSpace = "pre";
    asciiTable.style.margin = "0px";
    asciiTable.style.padding = "0px";
    // perfectly square roguelike font => http://strlen.com/square/
    asciiTable.style.fontFamily = "square";

    asciiTable.style.fontSize = pixelSize + "px";
    asciiTable.style.lineHeight = pixelSize + "px";
    asciiTable.style.textDecoration = "none";
  }

  export function getDomElement() {
    return domElement;
  }

  export function render(scene, camera) {
    controls.update();
    asciifyImage(renderer, asciiTable);
  }

  function asciifyImage(canvasRenderer, asciiTable) {
    gl = oCanvasImg.getContext("webgl");
    //read pixel data directyl from webgl context
    let pixels = new Uint8Array(
      gl.drawingBufferWidth * gl.drawingBufferHeight * 4
    );
    gl.readPixels(
      0,
      0,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels
    );

    // Debug canvas if you want to see raw threejs output
    if (debugCtx) {
      const ctx = debugCtx;
      ctx.clearRect(0, 0, width, height);

      const imgData = ctx.createImageData(
        gl.drawingBufferWidth,
        gl.drawingBufferHeight
      );

      for (
        let i = 0;
        i < gl.drawingBufferWidth * gl.drawingBufferHeight * 4;
        i++
      ) {
        imgData.data[i] = pixels[i];
      }
      ctx.putImageData(imgData, 0, 0);

      // DEBUG -> draw dots where the color is comign from
      for (let x = 0; x < iWidth; x++) {
        for (let y = 0; y < iHeight; y++) {
          ctx.fillStyle = "#FF0000";
          ctx.fillRect(x * pixelSize + 4, y * pixelSize + 4, 2, 2);
        }
      }
    }

    var strChars = "";

    function getColorIndicesForCoord(x, y, width) {
      const red = y * (width * 4) + x * 4;
      return red;
    }

    for (let y = 0; y < iHeight; y++) {
      for (let x = 0; x < iWidth; x++) {
        const iOffset = getColorIndicesForCoord(
          x * pixelSize,
          y * pixelSize,
          gl.drawingBufferWidth
        );
        const iRed = pixels[iOffset];
        const iGreen = pixels[iOffset + 1];
        const iBlue = pixels[iOffset + 2];

        let iCharIdx;

        let fBrightness = (0.3 * iRed + 0.59 * iGreen + 0.11 * iBlue) / 255;

        iCharIdx = Math.floor((1 - fBrightness) * (aCharList.length - 1));

        if (invert) {
          iCharIdx = aCharList.length - iCharIdx - 1;
        }

        let strThisChar = aCharList[iCharIdx];

        if (strThisChar === undefined) strThisChar = " ";

        const hash = `${x},${y}`;

        if (tempStore[hash] != strThisChar) {
          tempStore[hash] = strThisChar;
          stores[hash].set(strThisChar);
        }

        if (color) {
          const hash = `c${x},${y}`;
          const color = `rgb(${iRed},${iGreen},${iBlue})`;
          if (tempStore[hash] != color) {
            tempStore[hash] = color;
            stores[hash].set(color);
          }
        }
      }
    }

    //This logs 3d render to console. Cool but glitchy. No color
    if (renderToConsole && inner && !color) {
      let html = inner.innerHTML;
      const searchRegExp = /<br>/g;
      const replaceWith = "\n";

      const result = html.replace(searchRegExp, replaceWith);
      console.clear();
      console.log(result);
    }
  }
</script>

<div bind:this={domElement} style="cursor: default;">
  <table bind:this={asciiTable}>
    {#if mounted}
      <tr>
        <td bind:this={inner}>
          {#each { length: iHeight } as y, y}
            {#each { length: iWidth } as x, x}
              <AsciiCell {x} {y} {color} />
            {/each}
            <br />
          {/each}
        </td>
      </tr>
    {/if}
  </table>
</div>
