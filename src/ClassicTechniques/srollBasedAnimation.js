import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

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

const objectsDistance = 4;
/**
 * Materials
 */
const material = new THREE.MeshToonMaterial();

/**
 * Objects
 */
// Sphere (reference object)

// TetrahedronGeometry
const object1 = new THREE.Mesh(
  new THREE.TetrahedronGeometry(0.5), // Radius = 0.5
  material
);
object1.position.x = 1; // Offset to avoid overlap
scene.add(object1);

// DodecahedronGeometry
const object2 = new THREE.Mesh(
  new THREE.DodecahedronGeometry(0.5), // Radius = 0.5
  material
);
object2.position.x = -1; // Offset to avoid overlap
scene.add(object2);

// TorusKnotGeometry
const object3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.5, 0.1, 100, 16), // Radius = 0.5, Tube = 0.1
  material
);
object3.position.x = 1; // Offset to avoid overlap
scene.add(object3);

object1.position.y = -objectsDistance * 0;
object2.position.y = -objectsDistance * 1;
object3.position.y = -objectsDistance * 2;

const objects = [object1, object2, object3];

// particles
const count = 10000;
const position = new Float32Array(count * 3);

for (let i = 0; i <= count; i++) {
  const i3 = i * 3;
  position[i3] = (Math.random() - 0.5) * 10;
  position[i3 + 1] =
    objectsDistance * 0.5 - Math.random() * objectsDistance * objects.length;
  position[i3 + 2] = (Math.random() - 0.5) * 10;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(position, 3)
);
const particleMaterial = new THREE.PointsMaterial({
  size: 0.01,
  sizeAttenuation: false,
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

const curser = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (e) => {
  curser.x = e.screenX / sizes.width - 0.5; // values (-0.5 to 0.5)
  curser.y = e.screenY / sizes.height - 0.5; // values (-0.5 to 0.5)
});

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

// group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

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

camera.position.z = 2;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let scrollY = window.scrollY;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY / sizes.height;
});

let currentSection = 0;
window.addEventListener("scroll", () => {
  const newSection = Math.round(window.scrollY / sizes.height);
  if (currentSection != newSection) {
    currentSection = newSection;
    const mesh = objects[currentSection];
    gsap.to(mesh.rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=5",
    });
  }
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  camera.position.y = -scrollY * objectsDistance;

  cameraGroup.position.x +=
    (curser.x - cameraGroup.position.x) * 10 * deltaTime;
  cameraGroup.position.y +=
    (-curser.y - cameraGroup.position.y) * 10 * deltaTime;

  // Render
  for (let mesh of objects) {
    mesh.rotation.x += deltaTime;
    mesh.rotation.y += deltaTime;
  }

  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
