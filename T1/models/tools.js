import * as THREE from 'three';
import { setDefaultMaterial } from "../libs/util/util.js";

// variável usada para resolver o z-fighting
// quando duas estruturas estão com exatamente a mesma posição
// elas ficam meio que se alternando, ficando bem estranho
// esse offset resolve
export const ZF = 0.01;

export function wall(x, y, z, width, height, depth, rotationY, color, group) {
    let wallGeometry = new THREE.BoxGeometry(width, height, depth);
    let material = setDefaultMaterial(color);
    let wallMesh = new THREE.Mesh(wallGeometry, material);
    wallMesh.position.set(x, y, z);
    wallMesh.rotation.y = rotationY;
    if (group) {
        group.add(wallMesh);
    }
    return wallMesh;
}

export function createFloor(x, y, z, width, height, depth, rotationY = 0, color = "gray", group = null) {
    let floorGeometry = new THREE.BoxGeometry(width + 2 * ZF, height, depth + 2 * ZF);
    let material = setDefaultMaterial(color);
    let floor = new THREE.Mesh(floorGeometry, material);
    floor.position.set(x, y + ZF, z);
    floor.rotation.y = rotationY;
    if (group) {
        group.add(floor);
    }
    return floor;
}

export function createRamp(x, y, z, length, height, width, rotationY, color, group) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(length, 0);
    shape.lineTo(length, height);
    shape.closePath();

    const rampGeometry = new THREE.ExtrudeGeometry(shape, {
        depth: width,
        bevelEnabled: false
    });

    let material = setDefaultMaterial(color);
    let ramp = new THREE.Mesh(rampGeometry, material);
    ramp.userData.walkable = true;

    ramp.position.set(x, y + 2 * ZF, z);
    ramp.rotation.y = rotationY;

    if (group) {
        group.add(ramp);
    }
    return ramp;
}
