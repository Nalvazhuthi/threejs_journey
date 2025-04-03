import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

// scene
const scene = new THREE.Scene();

// light
// 1. ambiantLight
// const ambiantLight = new THREE.AmbientLight("#fcfcfc", 0.3);
// scene.add(ambiantLight);

// // 2. Direction
// const directionalLight = new THREE.DirectionalLight("#fcfcfc", 1);
// directionalLight.position.y = 3;
// scene.add(directionalLight);

// // 3. Hemisphere
// const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
// scene.add(hemisphereLight);

// //  4. PointLight
// const pointLight = new THREE.PointLight(0xff9000, 0.5, 10, 1);
// pointLight.position.set(1, -0.5, 1);
// scene.add(pointLight);

// //  5. Rect Area Light
// const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
// rectAreaLight.position.set(-1.5, 0, 1.5);
// rectAreaLight.lookAt(new THREE.Vector3());
// scene.add(rectAreaLight);

//  6. Spot light
const spotLight = new THREE.SpotLight(
  0x78ff00,
  0.5,
  10,
  Math.PI * 0.1,
  0.25,
  1
);
spotLight.position.set(0, 2, 3);
scene.add(spotLight);
spotLight.target.position.x = 1;
scene.add(spotLight.target);
// object
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;

const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 32, 64),
  material
);
torus.position.x = 1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube, torus, plane);

// camera
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const camera = new THREE.PerspectiveCamera(
  75,
  size.width / size.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// render
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(size.width, size.height);
renderer.render(scene, camera);

// orbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// resize
window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  renderer.setSize(size.width, size.height);
  renderer.render(scene, camera);
});

// animation
const clock = new THREE.Clock();

function tick() {
  const elapseTime = clock.getElapsedTime();

  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

tick();
