import * as THREE from 'three';
import { setDefaultMaterial } from "../libs/util/util.js";

// variável usada para resolver o z-fighting
// quando duas estruturas estão com exatamente a mesma posição
// elas ficam meio que se alternando, ficando bem estranho
// esse offset resolve
export const ZF = 0.01;

export function wall(x, y, z, width, height, depth, rotationY, group, material = null, geometry = null) {
    validateGeometry(geometry, [width, height, depth]);
    if (!geometry) {
        geometry = new THREE.BoxGeometry(width, height, depth);
    }
    if (!material) {
        material = setDefaultMaterial("red");
    }
    let wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);
    wall.rotation.y = rotationY;
    if (group) {
        group.add(wall);
    }
    return wall;
}

export function floor(x, y, z, width, height, depth, rotationY = 0, group = null, material = null, geometry = null) {
    validateGeometry(geometry, [width, height, depth]);
    if (!geometry) {
        geometry = new THREE.BoxGeometry(width + 2 * ZF, height, depth + 2 * ZF);
    }
    if (!material) {
        material = setDefaultMaterial("red");
    }
    let floor = new THREE.Mesh(geometry, material);
    floor.position.set(x, y + ZF, z);
    floor.rotation.y = rotationY;
    if (group) {
        group.add(floor);
    }
    floor.userData.walkable = true;
    return floor;
}

export function ramp(x, y, z, length, height, width, rotationY, color, group = null, material = null, steps = 0, geometry = null) {
    validateGeometry(geometry, [length, height, width]);
    if (!material) {
        material = setDefaultMaterial(color);
    }

    if (!geometry) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(length, 0);
        shape.lineTo(length, height);
        shape.closePath();

        geometry = new THREE.ExtrudeGeometry(shape, {
            depth: width,
            bevelEnabled: false
        });
    }

    const collisionRamp = new THREE.Mesh(geometry, material);
    collisionRamp.userData.walkable = true;
    const stepCount = Math.max(0, Math.floor(steps));
    let ramp = collisionRamp;

    if (stepCount > 0) {
        ramp = new THREE.Group();
        collisionRamp.visible = false;
        ramp.add(collisionRamp);
        const stepLength = length / stepCount;

        for (let index = 0; index < stepCount; index++) {
            const stepHeight = height * (index + 1) / stepCount;
            const step = new THREE.Mesh(
                new THREE.BoxGeometry(stepLength, stepHeight, width),
                material
            );
            step.position.set(
                stepLength * (index + 0.5),
                stepHeight / 2,
                width / 2
            );
            step.userData.ignoreCollision = true;
            ramp.add(step);
        }
    }

    ramp.userData.walkable = true;

    ramp.position.set(x, y + 2 * ZF, z);
    ramp.rotation.y = rotationY;

    if (group) {
        group.add(ramp);
    }
    return ramp;
}

// Se a geometria for fornecida, as dimensões devem ser nulas e vice-versa.
function validateGeometry(geometry, dimensions) {
    if (geometry && dimensions.some(dimension => dimension !== null)) {
        throw new Error("Dimensions must be null when geometry is provided.");
    }
}
