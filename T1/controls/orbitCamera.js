import * as THREE from 'three';
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";

let isOrbiting = false;
let orbitControls = null;
let savedPosition = new THREE.Vector3();
let savedQuaternion = new THREE.Quaternion();

export function toggleOrbit (camera, renderer, fpsControls){
    isOrbiting = !isOrbiting;

    if (isOrbiting) {
        savedPosition.copy(camera.position);
        savedQuaternion.copy(camera.quaternion);

        fpsControls.unlock();

        if (!orbitControls){
            orbitControls = new OrbitControls(camera, renderer.domElement);
        }

        const ALTURA_VISAO = 240; 
        const target = new THREE.Vector3(camera.position.x, 0, camera.position.z);
        camera.position.set(target.x, target.y + ALTURA_VISAO, target.z + ALTURA_VISAO * 0.4);

        orbitControls.target.copy(target);

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
