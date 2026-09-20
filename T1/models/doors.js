import * as THREE from 'three';
import { setDefaultMaterial } from "../libs/util/util.js";

const frontDoor = new THREE.Group();
const doorMaterial = setDefaultMaterial("saddlebrown");
const handleMaterial = setDefaultMaterial("#404040");
const handleGeometry = new THREE.TorusGeometry(0.18, 0.04, 8, 16, Math.PI);

function addHandle(door, x, y, z, side) {
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.userData.ignoreCollision = true;
    handle.position.set(x, y, z);
    handle.rotation.z = -side * Math.PI / 2;
    door.add(handle);
}

export function createDoubleDoor(width, height, handleSide) {
    const leafWidth = width / 2 - 0.005;
    const leafGeometry = new THREE.BoxGeometry(0.1, height, leafWidth);
    leafGeometry.translate(0, height / 2, leafWidth / 2);

    const rightDoor = new THREE.Mesh(leafGeometry, doorMaterial);
    rightDoor.userData.dynamicCollider = true;
    rightDoor.position.z = -width / 2;
    addHandle(rightDoor, handleSide * 0.05, height / 2, leafWidth - 0.3, handleSide);
    addHandle(rightDoor, -handleSide * 0.05, height / 2, leafWidth - 0.3, -handleSide);

    const leftDoor = rightDoor.clone();
    leftDoor.scale.z = -1;
    leftDoor.position.z = width / 2;

    const group = new THREE.Group();
    group.add(leftDoor, rightDoor);

    return {
        group,
        doors: [
            [leftDoor, handleSide * Math.PI / 2],
            [rightDoor, -handleSide * Math.PI / 2]
        ]
    };
}

export function createSingleDoor(width, height, handleSide) {
    const doorGeometry = new THREE.BoxGeometry(0.1, height, width);
    doorGeometry.translate(0, height / 2, width / 2);

    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.userData.dynamicCollider = true;
    door.position.z = -width / 2;
    addHandle(door, handleSide * 0.05, height / 2, width - 0.18, handleSide);
    addHandle(door, -handleSide * 0.05, height / 2, width - 0.18, -handleSide);

    const group = new THREE.Group();
    group.add(door);

    return {
        group,
        doors: [[door, handleSide * Math.PI / 2, 0.12]]
    };
}

const doorShape = new THREE.Shape();
doorShape.moveTo(0, 0);
doorShape.lineTo(1.5, 0);
doorShape.lineTo(1.5, 3.2);
doorShape.quadraticCurveTo(0.98, 4.12, 0, 4.35);
doorShape.closePath();

const doorGeometry = new THREE.ExtrudeGeometry(doorShape, {
    depth: 0.1,
    bevelEnabled: false
});
doorGeometry.translate(-1.5, 0, -0.1);
doorGeometry.rotateY(Math.PI / 2);

const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial);
rightDoor.userData.dynamicCollider = true;
rightDoor.position.set(71.6, 0, -1.5);
addHandle(rightDoor, -0.1, 1.5, 1.2, -1);
addHandle(rightDoor, 0, 1.5, 1.2, 1);

const leftDoor = rightDoor.clone();
leftDoor.scale.z = -1;
leftDoor.position.z = 1.5;

frontDoor.add(leftDoor, rightDoor);

const castleDoors = [[leftDoor, -Math.PI / 2], [rightDoor, Math.PI / 2]];

export { frontDoor, castleDoors };
