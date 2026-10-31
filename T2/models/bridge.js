import * as THREE from 'three';
import { stoneMaterial } from "./tools.js";

const bridge = new THREE.Group();
const grassMaterial = new THREE.MeshLambertMaterial({
    color: "#62922f", polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
});
const sandMaterial = new THREE.MeshLambertMaterial({
    color: "#ceb38b", polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
});

for (const [geometry, x, widthScale] of [
    [new THREE.CylinderGeometry(18, 18, 3.5, 8), 122, 1.1],
    [new THREE.BoxGeometry(14, 3.5, 7), 144, 1],
    [new THREE.BoxGeometry(54, 3.5, 18), 178, 1],
    [new THREE.BoxGeometry(14, 3.5, 15), 212, 1]
]) {
    const stone = new THREE.Mesh(geometry, stoneMaterial);
    stone.position.set(x, -1.75, 0);
    stone.scale.x = widthScale;
    stone.userData.ignoreCollision = true;
    const grass = new THREE.Mesh(geometry, grassMaterial);
    grass.position.set(x, -0.015, 0);
    grass.scale.set(widthScale, 0.03 / 3.5, 1);
    grass.userData.walkable = true;
    bridge.add(stone, grass);
}

const sand = new THREE.Mesh(
    new THREE.BoxGeometry(136, 0.03, 6),
    sandMaterial
);
sand.position.set(172, -0.015, 0);
sand.userData.walkable = true;
bridge.add(sand);

const ruinShape = new THREE.Shape();
ruinShape.moveTo(0, 0);
for (const [x, y] of [
    [0, 10], [2, 10], [2, 12], [4, 12], [4, 14.5],
    [7, 16.5], [10, 15], [10, 13], [14, 13], [14, 11], [18, 9], [18, 0]
]) ruinShape.lineTo(x, y);
ruinShape.closePath();
const opening = new THREE.Path();
opening.moveTo(2, 0.1);
opening.lineTo(5, 0.1);
opening.lineTo(5, 7.5);
opening.absarc(3.5, 7.5, 1.5, 0, Math.PI, false);
opening.closePath();
ruinShape.holes.push(opening);
const ruin = new THREE.Mesh(
    new THREE.ExtrudeGeometry(ruinShape, { depth: 2, bevelEnabled: false, curveSegments: 6 }),
    stoneMaterial
);
ruin.position.set(152, 0.06, 6);
bridge.add(ruin);

export { bridge };
