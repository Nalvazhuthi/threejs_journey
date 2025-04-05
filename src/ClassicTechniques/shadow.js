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

// texture load
const textureLoader = new THREE.TextureLoader();
const bakedShadow = textureLoader.load("/textures/simpleShadow.jpg");

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
directionalLight.castShadow = true; // Enable shadow casting
console.log(directionalLight.shadow);

// Set the shadow map size
directionalLight.shadow.mapSize.width = 1024; // Default
directionalLight.shadow.mapSize.height = 1024; // Default

// near and far planes of the shadow camera
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;

// Amplitude of the shadow camera
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;

// Blurring of the shadow
directionalLight.shadow.radius = 10;

// Camera helper
const directionalLightHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
// scene.add(directionalLightHelper);

directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, "intensity").min(0).max(3).step(0.001);
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);
scene.add(directionalLight);

// spot light
const spotLight = new THREE.SpotLight(
  0x78ff00,
  0.5,
  10,
  Math.PI * 0.1,
  0.25,
  1
);
// camera helper
const spotLightHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(spotLightHelper);

spotLight.position.set(0, 2, 2);
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.castShadow = true;
// near and far planes of the shadow camera
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;

scene.add(spotLight);
scene.add(spotLight.target);

gui.add(spotLight, "intensity").min(0).max(3).step(0.001);
gui.add(spotLight.position, "x").min(-5).max(5).step(0.001);
gui.add(spotLight.position, "y").min(-5).max(5).step(0.001);
gui.add(spotLight.position, "z").min(-5).max(5).step(0.001);
gui.addColor(spotLight, "color").onChange(() => {
  spotLightHelper.update();
});

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);

/**
 * Objects
 */
// sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.castShadow = true; // Cast shadow

// Floor
const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;
plane.receiveShadow = true; // Receive shadow

// shadow Plane
const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    alphaMap: bakedShadow,
  })
);
shadowPlane.rotation.x = -Math.PI * 0.5;
shadowPlane.position.y = plane.position.y + 0.01;
scene.add(sphere, plane, shadowPlane);

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
// renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const debugAnimation = {
  radius: 1.5,
  frequency: 2,
};
gui.add(debugAnimation, "radius").min(0).max(5).step(0.001);
gui.add(debugAnimation, "frequency").min(0).max(10).step(0.001);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  sphere.position.x = Math.cos(elapsedTime) * debugAnimation.radius;
  sphere.position.z = Math.sin(elapsedTime) * debugAnimation.radius;
  sphere.position.y = Math.abs(
    Math.sin(elapsedTime * debugAnimation.frequency)
  );

  shadowPlane.position.x = sphere.position.x;
  shadowPlane.position.z = sphere.position.z;
  shadowPlane.material.opacity = (1 - sphere.position.y) * 0.3;
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
