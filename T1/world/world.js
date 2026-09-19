import * as THREE from "three";
import {
  createGroundPlaneXZ,
  initDefaultBasicLight,
  initRenderer,
  onWindowResize
} from "../libs/util/util.js";
import { castelo } from "../models/castle.js";
import { smallHouse } from "../models/smallHouse.js";
import { createWallCollision } from "../mechanics/collision.js";

export function createWorld() {
  const scene = new THREE.Scene();
  const renderer = initRenderer("rgb(135, 206, 235)");
  initDefaultBasicLight(scene);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(190, 4, 0);
  camera.lookAt(new THREE.Vector3(225, 4, 0));
  scene.add(camera);

  scene.add(new THREE.AxesHelper(12));

  const ground = createGroundPlaneXZ(1000, 1000);
  ground.userData.walkable = true;
  scene.add(ground, castelo, smallHouse);

  window.addEventListener("resize", () => onWindowResize(camera, renderer));

  return {
    scene,
    renderer,
    camera,
    grounds: [ground, smallHouse, castelo],
    wallCollisions: createWallCollision([castelo, smallHouse])
  };
}
