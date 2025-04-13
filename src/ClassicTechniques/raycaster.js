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

// raycaster
const raycaster = new THREE.Raycaster();

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

/**
 * Objects
 */
const sphere1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  material.clone()
);
const sphere2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  material.clone()
);
const sphere3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  material.clone()
);
sphere1.position.set(-2, 0, 0);
sphere2.position.set(0, 0, 0);
sphere3.position.set(2, 0, 0);
scene.add(sphere1, sphere2, sphere3);

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

camera.position.z = 4;
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


const mouse = new THREE.Vector2();
let currentIntersect = null;

window.addEventListener("mousemove", (event) => {
  // Convert mouse to normalized device coordinates (-1 to 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycasting from mouse
  raycaster.setFromCamera(mouse, camera);

  const objectsToTest = [sphere1, sphere2, sphere3];
  const intersects = raycaster.intersectObjects(objectsToTest);

  // Reset all colors
  for (let object of objectsToTest) {
    object.material.color.set("red");
  }

  // Highlight intersected objects
  for (let intersect of intersects) {
    intersect.object.material.color.set("blue");
  }

  // Handle mouse enter / leave
  if (intersects.length > 0) {
    const firstIntersected = intersects[0].object;

    if (currentIntersect === null) {
      // Mouse entered an object
      console.log("🟦 mouse enter:", firstIntersected.name);
    } else if (currentIntersect !== firstIntersected) {
      // Mouse moved from one object to another
      console.log("🟥 mouse leave:", currentIntersect.name);
      console.log("🟦 mouse enter:", firstIntersected.name);
    }

    currentIntersect = firstIntersected;
  } else {
    if (currentIntersect !== null) {
      // Mouse left all objects
      console.log("🟥 mouse leave:", currentIntersect.name);
    }

    currentIntersect = null;
  }
});

/**
 * Animate
 */
const clock = new THREE.Clock();


const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  //sphere1.position.y = Math.sin(elapsedTime * speed) * amplitude;
  sphere1.position.y = Math.sin(elapsedTime * 2) * 2;
  sphere2.position.y = Math.sin(elapsedTime * 1.5) * 2;
  sphere3.position.y = Math.sin(elapsedTime * 0.8) * 2;

//   //raycaster
//   const rayOrigin = new THREE.Vector3(-3, 0, 0);
//   const rayDirection = new THREE.Vector3(1, 0, 0);
//   rayDirection.normalize();

//   raycaster.set(rayOrigin, rayDirection);

//   const objectsToTest = [sphere1, sphere2, sphere3];
//   const intersects = raycaster.intersectObjects(objectsToTest);
//   for (let objects of objectsToTest) {
//     objects.material.color.set("red");
//   }

//   for (let intersect of intersects) {
//     console.log("intersect", intersect);
//     intersect.object.material.color.set("blue");
//   }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
