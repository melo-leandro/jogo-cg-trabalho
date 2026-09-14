import * as THREE from 'three';
import { OrbitControls } from "./build/jsm/controls/OrbitControls.js";

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

        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.multiplyScalar (20);
        let target = camera.position.clone();
        target.add (direction);
        orbitControls.target.copy(target);

        orbitControls.enabled = true;
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