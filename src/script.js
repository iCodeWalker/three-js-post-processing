import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "lil-gui";
// import EffectComposer class
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// import RenderPass
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import DotScreenPass
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";
// import GlitchPass
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
// for using RBGShift pass we have to use it with ShaderPass
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
// import GammaCorrectionShader
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
// import SMAA Pass
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
// import UnrealBloomPass
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntensity = 2.5;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);
environmentMap.encoding = THREE.sRGBEncoding;

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load("/models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // handling the resizing on the effectComposer
  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Render Target
 */
const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
  samples: renderer.getPixelRatio() === 1 ? 2 : 0,
});

// Send this renderTarget to effectComposer

/**
 * Instantiate the 'EffectComposer'
 */
const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

/**
 * Instantiate the 'RenderPass'
 */
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);
/**
 * Instantiate the 'DotScreenPass'
 */
const dotScreenPass = new DotScreenPass();
// to disable the pass
dotScreenPass.enabled = false;
effectComposer.addPass(dotScreenPass);

/**
 * Instantiate the 'GlitchPass'
 */
const glitchPass = new GlitchPass();
glitchPass.goWild = false;
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);

/**
 * Instantiate the 'ShaderPass' with 'RGBShiftShader'
 */
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.enabled = false;
effectComposer.addPass(rgbShiftPass);

/**
 * Instantiate the 'UnrealBloomPass'
 */
const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.strength = 0.9;
unrealBloomPass.radius = 1;
unrealBloomPass.threshold = 0.6;
effectComposer.addPass(unrealBloomPass);

gui.add(unrealBloomPass, "enabled");
gui.add(unrealBloomPass, "strength").min(0).max(2).step(0.001);
gui.add(unrealBloomPass, "radius").min(0).max(2).step(0.001);
gui.add(unrealBloomPass, "threshold").min(0).max(2).step(0.001);

/**
 * Instantiate the 'ShaderPass' with 'GammaCorrectionShader'
 */
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
gammaCorrectionPass.enabled = true;
effectComposer.addPass(gammaCorrectionPass);

/**
 * ####### Tint Pass (Custom Pass) ########
 */

const TintShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTint: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 uTint;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      // color.r += 0.1;
      // color.b += 0.1;
      color.rgb += uTint;
      gl_FragColor = color;
    }
  `,
};

// Create the pass with 'shaderPass' and add it to our effectComposer
const tintPass = new ShaderPass(TintShader);
// We set the default value of 'uTint' to null because we are going to change it once we
// instantiate the ShaderPass
tintPass.material.uniforms.uTint.value = new THREE.Vector3();
effectComposer.addPass(tintPass);

// ######## Adding to GUI ########
gui
  .add(tintPass.material.uniforms.uTint.value, "x")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Red");
gui
  .add(tintPass.material.uniforms.uTint.value, "y")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Green");
gui
  .add(tintPass.material.uniforms.uTint.value, "z")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Blue");

/**
 * ####### Displacement Pass (Custom Pass) ########
 */

const DisplacementShader = {
  uniforms: {
    tDiffuse: { value: null },
    // uTime: { value: null }, // For time based animation
    uNormalMap: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D uNormalMap;
    varying vec2 vUv;

    // uniform float uTime;

    void main() {

      // vec2 newUv = vec2(
      //   vUv.x,
      //   vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1
      // );

      vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
      vec2 newUv = vUv + normalColor.xy * 0.1;
  
      vec4 color = texture2D(tDiffuse, newUv);
      // color.r += 0.1;
      // color.b += 0.1;

      vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
      float lightness = clamp(dot(normalColor, lightDirection),0.0, 1.0);
      color += lightness * 2.0;
      gl_FragColor = color;
    }
  `,
};

// Create the pass with 'shaderPass' and add it to our effectComposer
const displacementPass = new ShaderPass(DisplacementShader);
// Set value of 'uTime' after creating the pass to 0.
// displacementPass.material.uniforms.uTime.value = 0;
displacementPass.material.uniforms.uNormalMap.value = textureLoader.load(
  "/textures/interfaceNormalMap.png"
);

effectComposer.addPass(displacementPass);

// ###### AnitAliasing pass should be after gammaCorrectionPass

/**
 * Instantiate the 'SMAAPass'
 */
if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
  const smaaPass = new SMAAPass();
  effectComposer.addPass(smaaPass);
}

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  // renderer.render(scene, camera);
  // Replace the  renderer.render(scene, camera) with effectComposer.render();
  effectComposer.render();

  // update the pass for displacement animation
  // displacementPass.material.uniforms.uTime.value = elapsedTime;

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
