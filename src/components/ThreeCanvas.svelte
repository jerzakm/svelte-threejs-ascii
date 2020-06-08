<script>
  import * as THREE from "three";

  import { onMount } from "svelte";

  import Ascii from "./Ascii.svelte";

  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
  import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
  import { PixelShader } from "three/examples/jsm/shaders/PixelShader.js";
  // import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

  export let pixelSize;
  export let debug;

  let camera, controls, scene, renderer, effect;
  let composer, pixelPass;
  let sphere;

  let start = Date.now();

  export function getRenderer() {
    return renderer;
  }

  export function getCamera() {
    return camera;
  }

  function setupScene() {
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.y = 150;
    camera.position.z = 500;
    camera.scale.x = -1;
    camera.scale.y = -1;
    camera.updateProjectionMatrix();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0, 0, 0);

    const light1 = new THREE.PointLight(0xffffff);
    light1.position.set(500, 500, 500);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xffffff, 0.25);
    light2.position.set(-500, -500, -500);
    scene.add(light2);

    sphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(200, 20, 10),
      new THREE.MeshPhongMaterial({ flatShading: true, color: 0xffffff })
    );
    scene.add(sphere);

    // Plane

    const plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(400, 400),
      new THREE.MeshBasicMaterial({ color: 0xff3200 })
    );
    plane.position.y = -200;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", onWindowResize, false);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    pixelPass = new ShaderPass(PixelShader);
    pixelPass.uniforms["resolution"].value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    );
    pixelPass.uniforms["resolution"].value.multiplyScalar(
      window.devicePixelRatio
    );
    composer.addPass(pixelPass);
    pixelPass.uniforms["pixelSize"].value = pixelSize;
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  export function render() {
    const timer = Date.now() - start;

    sphere.position.y = Math.abs(Math.sin(timer * 0.002)) * 150;
    sphere.rotation.x = timer * 0.0003;
    sphere.rotation.z = timer * 0.0002;

    // controls.update();
    composer.render(scene, camera);

    // myAscii.render();
  }

  setupScene();
  let debugCanvas;
  let debugCtx;
  export function getDebugContext() {
    return debug ? debugCtx : undefined;
  }
  onMount(() => {
    if (debugCanvas) {
      debugCanvas.width = window.innerWidth;
      debugCanvas.height = window.innerHeight;
      debugCanvas.style.width = `${window.innerWidth}px`;
      debugCanvas.style.height = `${window.innerHeight}px`;
      debugCanvas.style.clipPath = `polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)`;
      debugCanvas.style.position = "fixed";
      debugCanvas.style.zIndex = "100";
      debugCtx = debugCanvas.getContext("2d");
    }

    // controls = new TrackballControls(camera, asciiDom);
    // animate();
    // requestAnimationFrame(animate);
  });
</script>

{#if debug}
  <canvas bind:this={debugCanvas} />
{/if}
