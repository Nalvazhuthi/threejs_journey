import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 250 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// gui parameters
const parameters = {
  count: 10000, // particles count
  particleSize: 0.01, // particles size
};
parameters.radius = 3;
parameters.branch = 3;
parameters.spin = 3;
parameters.randomness = 0.2;

gui
  .add(parameters, "count")
  .min(1000)
  .max(1000000)
  .step(100)
  .onFinishChange(() => generateGalaxy());
gui
  .add(parameters, "particleSize")
  .min(0.0001)
  .max(1)
  .step(0.0001)
  .onFinishChange(() => generateGalaxy());

gui
  .add(parameters, "radius")
  .min(1)
  .max(20)
  .step(1)
  .onFinishChange(() => generateGalaxy());

gui
  .add(parameters, "branch")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(() => generateGalaxy());
gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(1)
  .onFinishChange(() => generateGalaxy());
gui
  .add(parameters, "randomness")
  .min(1)
  .max(1)
  .step(0.01)
  .onFinishChange(() => generateGalaxy());
/**
 * Objects
 */

let particleGeometry = null;
let particleMaterial = null;
let particle = null;

// generate galaxy
const generateGalaxy = () => {
  if (particle !== null) {
    particleGeometry.dispose();
    particleMaterial.dispose();
    scene.remove(particle);
  }
  particleGeometry = new THREE.BufferGeometry();
  const position = new Float32Array(parameters.count * 3);
  for (let i = 0; i <= parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branch) / parameters.branch) * Math.PI * 2;

    const randomX = (Math.random() - 0.5) * parameters.randomness;
    const randomY = (Math.random() - 0.5) * parameters.randomness;
    const randomZ = (Math.random() - 0.5) * parameters.randomness;

    position[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX; // x
    position[i3 + 1] = randomY; // y
    position[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ; // z
  }
  particleMaterial = new THREE.PointsMaterial({
    size: parameters.particleSize,
    sizeAttenuation: true,
  });
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(position, 3)
  );
  particle = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particle);
};
generateGalaxy();

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

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
