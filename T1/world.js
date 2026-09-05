import * as THREE from  'three';
import { FlyControls } from './build/jsm/controls/FlyControls.js';
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
renderer = initRenderer("rgb(135, 206, 235)");
light = initDefaultBasicLight(scene);

camera = initCamera(new THREE.Vector3(-100, 30, 0));
restoreCamera(camera);
scene.add(camera); // Add camera to the scene

window.addEventListener("pagehide", function() {
  saveCamera(camera);
});

flyingCamera = new FlyControls( camera, renderer.domElement );
  flyingCamera.movementSpeed = 30;
  flyingCamera.rollSpeed = 0.3;
  flyingCamera.autoForward = false;
  flyingCamera.dragToLook = true;

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
flyingCamera.addEventListener("change", function() {
    box.changeMessage("Camera Position: " + (camera.position.x).toFixed(2) + ", " + (camera.position.y).toFixed(2) + ", " + (camera.position.z).toFixed(2));
});

scene.add(castelo);
render();
function render()
{
  requestAnimationFrame(render);
  clock.update();
  const delta = clock.getDelta();
  flyingCamera.update(delta);
  renderer.render(scene, camera) // Render scene
}
