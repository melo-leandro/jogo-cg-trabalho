import * as THREE from 'three';
import { InfoBox } from "../libs/util/util.js";

const doorInfoBox = new InfoBox();
doorInfoBox.infoBox.style.removeProperty("bottom");
doorInfoBox.infoBox.style.removeProperty("right");
Object.assign(doorInfoBox.infoBox.style, {
    top: "10px",
    left: "10px",
    width: "max-content",
    maxWidth: "calc(100vw - 20px)"
});

export function doorLerping(door, targetRotation, alpha) {
    door.rotation.y = THREE.MathUtils.lerp(door.rotation.y, targetRotation, alpha);
}

export function isLookingAtDoor(door, camera){
    const raycaster = new THREE.Raycaster();
    const screenCenter = new THREE.Vector2(0, 0);
    raycaster.setFromCamera(screenCenter, camera);
    const intersects = raycaster.intersectObject(door);
    return intersects.length > 0;
}

export function isCloseToDoor(door, camera){
    const doorPosition = new THREE.Vector3();
    door.getWorldPosition(doorPosition);
    const cameraPosition = camera.position.clone();
    const distance = doorPosition.distanceTo(cameraPosition);
    return distance < 14;
}

export function canOpen(door, camera) {
    return isLookingAtDoor(door, camera) && isCloseToDoor(door, camera);
}

export function doorInteraction(doorGroups, camera) {
    const activeDoor = doorGroups.find(({ doors }) =>
        doors.some(([door]) => canOpen(door, camera))
    );

    if (activeDoor) {
        doorInfoBox.infoBox.textContent = activeDoor.isOpen
            ? "Pressione E para fechar a porta."
            : "Pressione E para abrir a porta.";
        doorInfoBox.show();
    } else {
        doorInfoBox.infoBox.remove();
    }

    return activeDoor;
}

