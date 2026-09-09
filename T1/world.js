import * as THREE from  'three';
import { PointerLockControls } from "./build/jsm/controls/PointerLockControls.js";
import { initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        SecondaryBox,
        onWindowResize,
        createGroundPlaneXZ } from "./libs/util/util.js";
import { castelo } from "./castle.js";
import { restoreCamera, saveCamera } from "./cameraStorage.js";

let scene, renderer, camera, light, flyingCamera;

scene = new THREE.Scene();
const clock = new THREE.Timer();

clock.connect(document);

renderer = initRenderer("rgb(135, 206, 235)");
light = initDefaultBasicLight(scene);

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-5, 2, -5);
camera.lookAt(new THREE.Vector3(0, 2, 0));
scene.add(camera);

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(1000, 1000);
scene.add(plane);

// mostra a posição atual da câmera
let box = new SecondaryBox();
box.changeMessage("Camera Position: " + (camera.position.x).toFixed(2) + ", " + (camera.position.y).toFixed(2) + ", " + (camera.position.z).toFixed(2));
camera.addEventListener("change", function() {
    box.changeMessage("Camera Position: " + (camera.position.x).toFixed(2) + ", " + (camera.position.y).toFixed(2) + ", " + (camera.position.z).toFixed(2));
});

const controls = new PointerLockControls(camera, renderer.domElement);

renderer.domElement.addEventListener("click", function () {
  controls.lock(true);
});

const keys = new Set();

window.addEventListener("keydown", function (event) {
  keys.add(event.code);
});

window.addEventListener("keyup", function (event) {
  keys.delete(event.code);
});

controls.addEventListener("unlock", function () {
  keys.clear();
});

function movePlayer(delta) {
  const distance = 20 * delta;

  if (keys.has("KeyW")) controls.moveForward(distance);
  if (keys.has("KeyS")) controls.moveForward(-distance);
  if (keys.has("KeyD")) controls.moveRight(distance);
  if (keys.has("KeyA")) controls.moveRight(-distance);
  if (keys.has("KeyE")) camera.position.y += distance;
  if (keys.has("KeyQ")) camera.position.y -= distance;
}

scene.add(castelo);
render();
function render()
{
  clock.update();
  //Limita saltos de movimento causados por pausas entre frames
  const delta = Math.min(clock.getDelta(), 0.05);
  if (controls.isLocked) {
    movePlayer(delta);
  }

  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}
