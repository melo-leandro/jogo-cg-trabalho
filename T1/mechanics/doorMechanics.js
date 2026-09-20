import * as THREE from 'three';

const doorPosition = new THREE.Vector3();

export function doorLerping(door, targetRotation, alpha) {
    door.rotation.y = THREE.MathUtils.lerp(door.rotation.y, targetRotation, alpha);
}

function isCloseToDoor(door, camera) {
    door.getWorldPosition(doorPosition);
    return doorPosition.distanceTo(camera.position) < 14;
}

export function doorInteraction(doorGroups, camera) {
    for (const doorGroup of doorGroups) {
        doorGroup.isOpen = doorGroup.doors.some(([door]) => isCloseToDoor(door, camera));
    }
}

