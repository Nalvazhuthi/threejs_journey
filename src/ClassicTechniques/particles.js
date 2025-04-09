import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// textureLoader
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/textures/particles/3.png");

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
gui.add(ambientLight, "intensity").min(0).max(3).step(0.001);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, "intensity").min(0).max(3).step(0.001);
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);
scene.add(directionalLight);

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);

// particle geometry
// const particleGeometry = new THREE.SphereGeometry();
const count = 10000;
const particleGeometry = new THREE.BufferGeometry();
const position = new Float32Array(count * 3);
const color = new Float32Array(count * 3);

for (let i = 0; i <= count * 3; i++) {
  position[i] = (Math.random() - 0.5) * 10;
  color[i] = Math.random();
}
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(position, 3)
);
particleGeometry.setAttribute("color", new THREE.BufferAttribute(color, 3));

const particleMaterial = new THREE.PointsMaterial({
  size: 0.1,
  sizeAttenuation: true,
  //   color: "#ff88cc",
  vertexColors: true,
  transparent: true,
  alphaMap: texture,
  //alphaTest: 0.001,
  //depthTest:false
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = particleGeometry.attributes.position.array[i3 + 0];
    particleGeometry.attributes.position.array[i3 + 1] = Math.sin(
      elapsedTime + x
    );
  }
  particleGeometry.attributes.position.needsUpdate = true;
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
