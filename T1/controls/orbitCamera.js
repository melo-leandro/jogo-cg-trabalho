import * as THREE from 'three';
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";

let isOrbiting = false;
let orbitControls = null;
let savedPosition = new THREE.Vector3();
let savedQuaternion = new THREE.Quaternion();
const castleCenter = new THREE.Vector3(0, 0, 0);
const viewHeight = 240;

export function toggleOrbit (camera, renderer, fpsControls){
    isOrbiting = !isOrbiting;

    if (isOrbiting) {
        savedPosition.copy(camera.position);
        savedQuaternion.copy(camera.quaternion);

        fpsControls.unlock();

        if (!orbitControls){
            orbitControls = new OrbitControls(camera, renderer.domElement);
        }

        camera.position.set(castleCenter.x, castleCenter.y + viewHeight, castleCenter.z + viewHeight * 0.4);
        orbitControls.target.copy(castleCenter);
        orbitControls.enablePan = true;

        orbitControls.update();
    } else {
        orbitControls.dispose(); 
        orbitControls = null;

        camera.position.copy(savedPosition);
        camera.quaternion.copy(savedQuaternion);

        fpsControls.lock();
    }
}

export function isInOrbitMode (){
    return isOrbiting;
}

export function updateOrbit(){
    if (orbitControls) {
        orbitControls.update();
    }
}
