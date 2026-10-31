import assert from 'node:assert/strict';
import * as THREE from '../build/three.module.js';
import { castelo } from './castle.js';
import { createWallCollision, rayIntersectsColliders, wallCollision } from '../mechanics/collision.js';

const colliders = createWallCollision([castelo]);
const playerColliders = createWallCollision([castelo], true);
const triangleCount = meshes => meshes.reduce((total, mesh) =>
    total + (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3, 0);
assert.ok(triangleCount(playerColliders) < triangleCount(colliders) / 2,
    'Player collision must use simpler geometry than projectile collision');
for (const door of colliders.filter(mesh => mesh.userData.dynamicCollider)) {
    assert.ok(playerColliders.includes(door), 'Moving doors must keep the same collider');
}

const borders = [];
castelo.traverse(object => {
    if (object.name === 'slitBorder') borders.push(object);
});
assert.equal(borders.length, 37, 'Each slit must have a border');
assert.ok(borders.every(border => !colliders.includes(border) && !playerColliders.includes(border)),
    'Borders must not change collisions');
const camera = new THREE.PerspectiveCamera();
const openings = [];
for (const [x, z, rows] of [
    [72, -20, [[5.2, [-140, -70, 110]], [10, [-60, 165]], [14.4, [-140, 120]]]],
    [72, 20, [[4.7, [-140, -15, 40]], [9.4, [-80, 40]], [14.2, [-135, -15, 45]]]],
    [119, -20, [[5.5, [-165, 30, 130]], [10.4, [-160, 70]], [15.2, [-100, 35, 130]]]],
    [119, 20, [[5.5, [-65, 0, 120]], [10.6, [-45, 60]], [15.4, [60]]]]
]) {
    for (const [height, angles] of rows) {
        for (const degrees of angles) {
            const angle = THREE.MathUtils.degToRad(degrees);
            openings.push([x + Math.sin(angle) * 4, height, z + Math.cos(angle) * 4, angle]);
        }
    }
}
openings.push(
    [95, 4.6, -23.5, Math.PI], [94.9, 7.7, -23.5, Math.PI], [94.7, 12.6, -23.5, Math.PI],
    [94.8, 4.1, 23.5, 0], [96, 8.5, 23.5, 0], [93.6, 13.3, 23.5, 0],
    [122.5, 7.8, 0, Math.PI / 2], [122.5, 13.2, 0, Math.PI / 2]
);
assert.equal(openings.length, 37);

for (const [x, y, z, angle] of openings) {
    const label = `${x}, ${y}, ${z}, ${angle}`;
    const direction = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
    const sideways = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
    const center = new THREE.Vector3(x, y, z).multiplyScalar(3);
    function blocked(offset, height = 0, reverse = false) {
        const origin = center.clone().addScaledVector(direction, reverse ? -2.4 : 6)
            .addScaledVector(sideways, offset * 3);
        origin.y += height * 3;
        return rayIntersectsColliders(origin, direction.clone().multiplyScalar(reverse ? 1 : -1), 8.4, colliders);
    }
    assert.equal(blocked(0), false, `Opening blocked at ${label}`);
    assert.equal(blocked(0, -1.1), false, `Flat base blocked at ${label}`);
    assert.equal(blocked(0, 1.15), false, `Rounded top blocked at ${label}`);
    assert.equal(blocked(0.12, 1.15), true, `Rounded corner missing at ${label}`);
    assert.equal(blocked(0, -1.3), true, `Stone below opening missing at ${label}`);
    assert.equal(blocked(0.35), true, `Stone beside opening missing at ${label}`);
    assert.equal(blocked(0, 0, true), false, `Opening blocked from inside at ${label}`);
    const outside = center.clone().addScaledVector(direction, 6);
    const inside = center.clone().addScaledVector(direction, -2.4);
    camera.position.copy(inside);
    wallCollision(camera, outside, playerColliders);
    assert.ok(camera.position.clone().sub(center).dot(direction) > 1.5, `Player entered slit at ${label}`);
    camera.position.copy(outside);
    wallCollision(camera, inside, playerColliders);
    assert.ok(camera.position.clone().sub(center).dot(direction) < -1.5, `Player exited slit at ${label}`);
}

const ray = new THREE.Raycaster(new THREE.Vector3(216, 6, 60), new THREE.Vector3(0, -1, 0));
assert.ok(Math.abs(ray.intersectObjects(playerColliders)[0].point.y - 3) < 1e-5, 'Tower floor must remain closed');
ray.set(new THREE.Vector3(216, 42, 60), new THREE.Vector3(0, 1, 0));
assert.ok(Math.abs(ray.intersectObjects(playerColliders)[0].point.y - 51) < 1e-5, 'Tower ceiling must remain closed');
assert.equal(rayIntersectsColliders(new THREE.Vector3(207, 6, 33), new THREE.Vector3(1, 0, 0), 18, colliders),
    true, 'Curtain walls must remain solid');
console.log(`37 slits checked: shots, player collision in both directions, borders, floors and ceilings.\nCollision triangles: player ${triangleCount(playerColliders)}, projectiles ${triangleCount(colliders)}.`);
