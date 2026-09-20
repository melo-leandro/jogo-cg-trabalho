import * as THREE from "three";
import {
  createGroundPlaneXZ,
  initDefaultBasicLight,
  initRenderer,
  onWindowResize
} from "../libs/util/util.js";
import { castelo } from "../models/castle.js";
import { tallHouse } from "../models/tallHouse.js";
import { shortHouse } from "../models/shortHouse.js";
import { createWallCollision } from "../mechanics/collision.js";

export function createWorld() {
  const scene = new THREE.Scene();
  const renderer = initRenderer("rgb(135, 206, 235)");
  const sun = initDefaultBasicLight(
    scene,
    true,
    new THREE.Vector3(-300, 500, 300),
    600,
    2048,
    100,
    1000
  );
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.3;

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(190, 4, 0);
  camera.lookAt(new THREE.Vector3(225, 4, 0));
  scene.add(camera);

  scene.add(new THREE.AxesHelper(12));

  const ground = createGroundPlaneXZ(800, 800, 1, 1, "#328248");
  ground.userData.walkable = true;
  scene.add(ground, castelo, tallHouse, shortHouse);
  scene.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });

  window.addEventListener("resize", () => onWindowResize(camera, renderer));

  return {
    scene,
    renderer,
    camera,
    grounds: [ground, tallHouse, castelo, shortHouse],
    wallCollisions: createWallCollision([castelo, tallHouse, shortHouse])
  };
}
