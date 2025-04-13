import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import CANNON from "cannon";
/**
 * Base
 */
// Debug
const gui = new GUI();
const debugObject = {};

// audio
const hitSound = new Audio("/sounds/hit.mp3");

const playHitSound = (collision) => {
  const impactStrength = collision.contact.getImpactVelocityAlongNormal();
  if (impactStrength > 1.5) {
    hitSound.volume = Math.random();
    hitSound.currentTime = 0;
    hitSound.play();
  }
};
// Cannon worlds.
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

const defaultMaterial = new CANNON.Material("default");

const dafaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);

world.addContactMaterial(dafaultContactMaterial);
world.defaultContactMaterial = dafaultContactMaterial;

// Plane
const planeShape = new CANNON.Plane();
const planeBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, -0.5, 0),
  shape: planeShape,
});
// planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);

world.addBody(planeBody);

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
const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;

scene.add(plane);

const objectsToUpdate = [];
const createMeshes = (radius, position) => {
  // Three.js
  const meshes = [
    new THREE.SphereGeometry(1, 20, 20),
    new THREE.BoxGeometry(1, 1, 1),
  ];

  const randomGeometry = Math.round(Math.random());
  const mesh = new THREE.Mesh(
    meshes[randomGeometry],
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: false,
    })
  );
  mesh.scale.set(radius, radius, radius);
  mesh.position.copy(position);
  scene.add(mesh);

  // physics
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: shape,
  });
  body.position.copy(position);
  body.addEventListener("collide", playHitSound);
  world.addBody(body);

  // objects to update
  objectsToUpdate.push({ mesh, body });
};

// create random sphere with random position and radius
for (let i = 0; i <= 100; i++) {
  const radius = Math.random() * 0.5; // random radius from 0 - 5
  const position = {
    x: Math.random() * 10 - 5, // Random x position between -5 and 5
    y: 3, // Random y position between -5 and 5
    z: Math.random() * 10 - 5, // Random z position between -5 and 5
  };

  createMeshes(radius, position);
}

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

debugObject.reset = () => {
  console.log("reset");
  for (const objects of objectsToUpdate) {
    objects.body.removeEventListener("collide", playHitSound);
    world.remove(objects.body);
    scene.remove(objects.mesh);
    objectsToUpdate.splice(0, objectsToUpdate.length);
  }
};

gui.add(debugObject, "reset");

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
let oldElaspeTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElaspeTime;
  oldElaspeTime = elapsedTime;

  // update physics
  world.step(1 / 60, deltaTime, 3);

  // update objects
  for (let objects of objectsToUpdate) {
    objects.mesh.position.copy(objects.body.position);
    objects.mesh.quaternion.copy(objects.body.quaternion);
  }
  // orbit controls update
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
