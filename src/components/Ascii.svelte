<script>
  import { onMount } from "svelte";
  import { initStores, stores } from "../stores";
  import AsciiCell from "./AsciiCell.svelte";
  // let charSet = " .:-=+*#%@";
  let aCharList = " .,:;i1tfLCG08@".split("");
  let bResolution = 0.15;
  let iScale = 1;
  let bColor = false;
  let alpha = false;
  let block = false;
  let bInvert = true;
  export let renderer;
  export let debugCtx;
  $: console.log(debugCtx);

  let tempStore = {};

  let strResolution = "low";
  let width;
  let height;

  let domElement;
  let oAscii;

  let iWidth;
  let iHeight;
  let oImg;
  let oCanvasImg;
  let oCanvas = document.createElement("canvas");
  let oCtx;

  let gl;

  let mounted;
  var fResolution;
  switch (strResolution) {
    case "low":
      fResolution = 0.1;
      break;
    case "medium":
      fResolution = 0.5;
      break;
    case "high":
      fResolution = 1;
      break;
  }
  setSize(window.innerWidth, window.innerHeight);

  export function getDomElement() {
    return domElement;
  }

  export function render(scene, camera) {
    // renderer.render(scene, camera);
    asciifyImage(renderer, oAscii);
  }

  function asciifyImage(canvasRenderer, oAscii) {
    oCtx.clearRect(0, 0, iWidth, iHeight);

    oCtx.drawImage(oCanvasImg, 0, 0, iWidth, iHeight);
    gl = oCanvasImg.getContext("webgl");
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
    if (debugCtx) {
      const ctx = debugCtx;
      ctx.clearRect(0, 0, width, height);

      const imgData = ctx.createImageData(
        gl.drawingBufferWidth,
        gl.drawingBufferHeight
      );
      const data = imgData.data;

      // copy img byte-per-byte into our ImageData
      for (
        let i = 0;
        i < gl.drawingBufferWidth * gl.drawingBufferHeight * 4;
        i++
      ) {
        data[i] = pixels[i];
      }

      // now we can draw our imagedata onto the canvas
      ctx.putImageData(imgData, 0, 0);

      const debugW = Math.floor(gl.drawingBufferWidth / 10);
      const debugH = Math.floor(gl.drawingBufferHeight / 10);

      for (let x = 0; x < debugW; x++) {
        for (let y = 0; y < debugH; y++) {
          ctx.fillStyle = "#FF0000";
          ctx.fillRect(x * 10 + 4, y * 10 + 4, 2, 2);
        }
      }
    }

    var oImgData = oCtx.getImageData(0, 0, iWidth, iHeight).data;

    var strChars = "";

    for (var y = 0; y < iHeight; y += 2) {
      for (var x = 0; x < iWidth; x++) {
        var iOffset = (y * iWidth + x) * 4;

        var iRed = oImgData[iOffset];
        var iGreen = oImgData[iOffset + 1];
        var iBlue = oImgData[iOffset + 2];
        // var iRed = pixels[iOffset];
        // var iGreen = pixels[iOffset + 1];
        // var iBlue = pixels[iOffset + 2];

        var iCharIdx;

        var fBrightness = (0.3 * iRed + 0.59 * iGreen + 0.11 * iBlue) / 255;

        fBrightness = (0.3 * iRed + 0.59 * iGreen + 0.11 * iBlue) / 255;

        iCharIdx = Math.floor((1 - fBrightness) * (aCharList.length - 1));

        if (bInvert) {
          iCharIdx = aCharList.length - iCharIdx - 1;
        }

        var strThisChar = aCharList[iCharIdx];

        if (strThisChar === undefined) strThisChar = " ";

        const hash = `${x},${y}`;

        if (tempStore[hash] != strThisChar) {
          tempStore[hash] = strThisChar;
          stores[hash].set(strThisChar);
        }

        if (bColor) {
          const hash = `c${x},${y}`;
          const color = `rgb(${iRed},${iGreen},${iBlue})`;
          if (tempStore[hash] != color) {
            tempStore[hash] = color;
            stores[hash].set(color);
          }
        }
      }
    }
  }
  iWidth = Math.round(width * fResolution);
  iHeight = Math.round(height * fResolution);

  initStores(iWidth, iHeight, bColor);

  onMount(() => {
    oCanvas.width = iWidth;
    oCanvas.height = iHeight;

    oImg = renderer.domElement;

    if (oImg.style.backgroundColor) {
      oAscii.rows[0].cells[0].style.backgroundColor =
        oImg.style.backgroundColor;
      oAscii.rows[0].cells[0].style.color = oImg.style.color;
    }

    oAscii.cellSpacing = 0;
    oAscii.cellPadding = 0;

    var fFontSize = (2 / fResolution) * iScale;
    var fLineHeight = (2 / fResolution) * iScale;

    var oStyle = oAscii.style;
    oAscii.style.display = "inline";
    oAscii.style.width = Math.round((iWidth / fResolution) * iScale) + "px";
    oAscii.style.height = Math.round((iHeight / fResolution) * iScale) + "px";
    oAscii.style.whiteSpace = "pre";
    oAscii.style.margin = "0px";
    oAscii.style.padding = "0px";
    oAscii.style.letterSpacing = fLetterSpacing + "px";
    oAscii.style.fontFamily = "courier new, monospace";
    oAscii.style.fontSize = fFontSize + "px";
    oAscii.style.lineHeight = fLineHeight / 2 + "px";
    oAscii.style.textAlign = "left";
    oAscii.style.textDecoration = "none";
    oAscii.style.color = "grey";
    var aDefaultCharList = " .,:;i1tfLCG08@".split("");
    var aDefaultColorCharList = " CGO08@".split("");
    var strFont = "courier new, monospace";

    oCanvasImg = renderer.domElement;

    oCtx = oCanvas.getContext("2d");

    var aCharList = bColor ? aDefaultColorCharList : aDefaultCharList;

    if (bResolution) fResolution = bResolution;

    // Setup dom

    // adjust letter-spacing for all combinations of scale and resolution to get it to fit the image width.

    var fLetterSpacing = 0;

    if (strResolution == "low") {
      switch (iScale) {
        case 1:
          fLetterSpacing = -1;
          break;
        case 2:
        case 3:
          fLetterSpacing = -2.1;
          break;
        case 4:
          fLetterSpacing = -3.1;
          break;
        case 5:
          fLetterSpacing = -4.15;
          break;
      }
    }

    if (strResolution == "medium") {
      switch (iScale) {
        case 1:
          fLetterSpacing = 0;
          break;
        case 2:
          fLetterSpacing = -1;
          break;
        case 3:
          fLetterSpacing = -1.04;
          break;
        case 4:
        case 5:
          fLetterSpacing = -2.1;
          break;
      }
    }

    if (strResolution == "high") {
      switch (iScale) {
        case 1:
        case 2:
          fLetterSpacing = 0;
          break;
        case 3:
        case 4:
        case 5:
          fLetterSpacing = -1;
          break;
      }
    }

    mounted = true;
  });

  function setSize(w, h) {
    width = w;
    height = h;
    renderer.setSize(w, h);
  }
</script>

<div bind:this={domElement} style="cursor: default;">
  <table bind:this={oAscii}>
    {#if mounted}
      <tr>
        <td>
          {#each { length: iHeight } as y, y}
            {#each { length: iWidth } as x, x}
              {#if y % 2 == 0}
                <AsciiCell {x} {y} {bColor} />
              {/if}
            {/each}
            <br />
          {/each}
        </td>
      </tr>
    {/if}
  </table>
</div>
