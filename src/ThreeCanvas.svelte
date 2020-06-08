<script>
  import * as THREE from "three";
  import * as Stats from "stats.js";

  import { onMount } from "svelte";

  import Ascii from "./components/Ascii.svelte";

  import { AsciiEffect } from "./mAsciiEffect.js";
  import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
  import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
  import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
  import { PixelShader } from "three/examples/jsm/shaders/PixelShader.js";
  import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

  let camera, controls, scene, renderer, effect;
  let composer, pixelPass, params;

  let sphere, plane;

  let start = Date.now();

  function init() {
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

    var light = new THREE.PointLight(0xffffff);
    light.position.set(500, 500, 500);
    scene.add(light);

    var light = new THREE.PointLight(0xffffff, 0.25);
    light.position.set(-500, -500, -500);
    scene.add(light);

    sphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(200, 20, 10),
      new THREE.MeshPhongMaterial({ flatShading: true })
    );
    scene.add(sphere);

    // Plane

    plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(400, 400),
      new THREE.MeshBasicMaterial({ color: 0xe0e0e0 })
    );
    plane.position.y = -200;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    effect = new AsciiEffect(renderer, " .:-+*=%@#", {
      invert: true,
      color: false
    });
    effect.setSize(window.innerWidth, window.innerHeight);
    effect.domElement.style.color = "white";
    effect.domElement.style.backgroundColor = "black";

    // Special case: append effect.domElement, instead of renderer.domElement.
    // AsciiEffect creates a custom domElement (a div container) where the ASCII elements are placed.

    document.body.appendChild(effect.domElement);

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
    params = {
      pixelSize: 20,
      postprocessing: true
    };
    pixelPass.uniforms["pixelSize"].value = params.pixelSize;
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    effect.setSize(window.innerWidth, window.innerHeight);
  }

  var stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    render();
    stats.end();
  }

  let myAscii;

  let counter = 0;

  function render() {
    counter++;
    var timer = Date.now() - start;

    sphere.position.y = Math.abs(Math.sin(timer * 0.002)) * 150;
    sphere.rotation.x = timer * 0.0003;
    sphere.rotation.z = timer * 0.0002;

    controls.update();
    composer.render(scene, camera);
    // renderer.render(scene, camera);

    myAscii.render();
  }

  init();
  console.log(composer);
  let debugCanvas;
  let debugCtx;
  onMount(() => {
    if (debugCanvas) {
      debugCanvas.width = window.innerWidth;
      debugCanvas.height = window.innerHeight;
      debugCanvas.style.width = `${window.innerWidth}px`;
      debugCanvas.style.height = `${window.innerHeight}px`;
      debugCtx = debugCanvas.getContext("2d");
    }

    // debugCanvas.style.clipPath = `polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)`;
    // debugCanvas.style.position = "fixed";

    const asciiDom = myAscii.getDomElement();
    // asciiDom.style.clipPath = `polygon(50% 0%, 50% 100%, 0% 50%, 0% 100%)`;
    // asciiDom.style.position = "fixed";

    myAscii.debugCtx = debugCtx;
    controls = new TrackballControls(camera, asciiDom);
    animate();
    requestAnimationFrame(animate);
  });
</script>

<!-- <canvas bind:this={debugCanvas} /> -->
<Ascii {renderer} bind:this={myAscii} {debugCtx} />
