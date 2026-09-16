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
import { smallHouse } from "./models/smallHouse.js";
import { castelo } from "./models/castle.js";
import { restoreCamera, saveCamera } from "./cameraStorage.js";
import { toggleOrbit, isInOrbitMode, updateOrbit } from "./orbitCamera.js";
import { createCrosshair } from "./crosshair.js";
import { criarArma } from "./models/arma.js";
import { atirar, atualizarProjeteis } from "./tiro.js";

let scene, renderer, camera, light, flyingCamera;

createCrosshair();

scene = new THREE.Scene();
const clock = new THREE.Timer();

clock.connect(document);

renderer = initRenderer("rgb(135, 206, 235)");
light = initDefaultBasicLight(scene);

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-5, 2, -5);
camera.lookAt(new THREE.Vector3(0, 2, 0));
scene.add(camera);

// CÓDIGO PARA SALVAR E RESTAURAR A POSIÇÃO DA CÂMERA NO RELOAD DO SITE
restoreCamera(camera);
window.addEventListener("pagehide", function () {
  saveCamera(camera);
});

const {arma,ponta} = criarArma(camera);

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
    if (!isInOrbitMode()) {
        controls.lock(true);
    }
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

const infoBox = new InfoBox();

window.addEventListener("keydown", function (event) {
  if (event.code === "KeyC") {

    toggleOrbit(camera, renderer, controls);

    infoBox.infoBox.innerHTML = "";

    if (isInOrbitMode()) {
        infoBox.add("Câmera orbital");
    } else {
        infoBox.add("Câmera primeira pessoa");
    }

    infoBox.show();

    setTimeout(function () {
        infoBox.infoBox.remove();
    }, 2000);

    return;
}
});

window.addEventListener("mousedown", function (event) {
  if (!isInOrbitMode() && controls.isLocked) {
    atirar(scene, camera, arma);
  }
});

function movePlayer(delta) {
  const distance = 20 * delta;

  if (keys.has("KeyW") || keys.has("ArrowUp")) controls.moveForward(distance);
  if (keys.has("KeyS") || keys.has("ArrowDown")) controls.moveForward(-distance);
  if (keys.has("KeyD") || keys.has("ArrowRight")) controls.moveRight(distance);
  if (keys.has("KeyA") || keys.has("ArrowLeft")) controls.moveRight(-distance);
  if (keys.has("KeyE")) camera.position.y += distance;
  if (keys.has("KeyQ")) camera.position.y -= distance;
  // shiftzin pra acelerar a vida
  if (keys.has("ShiftLeft") && keys.has("KeyW")) controls.moveForward(distance * 4);
  if (keys.has("ShiftLeft") && keys.has("KeyS"))  controls.moveForward(-distance * 4);
  if (keys.has("ShiftLeft") && keys.has("KeyD")) controls.moveRight(distance * 4);
  if (keys.has("ShiftLeft") && keys.has("KeyA")) controls.moveRight(-distance * 4);
  if (keys.has("ShiftLeft") && keys.has("KeyE")) camera.position.y += distance * 4;
  if (keys.has("ShiftLeft") && keys.has("KeyQ")) camera.position.y -= distance * 4;
}


scene.add(castelo);
scene.add(smallHouse);
render();
function render() {
  clock.update();
  const delta = Math.min(clock.getDelta(), 0.05);

  if (isInOrbitMode()) {
    updateOrbit();
  } else if (controls.isLocked) {
    movePlayer(delta);
  }

  atualizarProjeteis(delta, scene);

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
