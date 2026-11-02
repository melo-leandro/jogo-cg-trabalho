import * as THREE from "three";
import {
  createGroundPlaneXZ,
  initRenderer,
  onWindowResize
} from "../libs/util/util.js";
import { castelo } from "../models/castle.js";
import { tallHouse } from "../models/tallHouse.js";
import { shortHouse } from "../models/shortHouse.js";
import { createWallCollision } from "../mechanics/collision.js";
import { bridge } from "../models/bridge.js";
import { criarPortal } from "../models/portal.js";
import { configureWorldShadows, createDayNightLighting } from "./lighting.js";

export function createWorld() {
  const scene = new THREE.Scene();
  const castleCenterX = 286.5;
  const renderer = initRenderer("rgb(135, 206, 235)");
  const toggleDayNight = createDayNightLighting(scene, renderer);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(120 - castleCenterX, 4, 0);
  camera.lookAt(new THREE.Vector3(225 - castleCenterX, 25, 0));
  scene.add(camera);

  // scene.add(new THREE.AxesHelper(12));

  const ground = createGroundPlaneXZ(600, 600, 1, 1, "#29464a");
  ground.matrix.setPosition(0, -3, 0);
  const castleArea = new THREE.Group();
  castleArea.position.x = -castleCenterX;
  castleArea.add(bridge, castelo, tallHouse, shortHouse);
  const courtyard = new THREE.Mesh(
    new THREE.PlaneGeometry(141, 114),
    new THREE.MeshLambertMaterial({
      color: "#62922f", polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
    })
  );
  courtyard.rotation.x = -Math.PI / 2;
  courtyard.position.set(castleCenterX, 0, 0);
  castleArea.add(courtyard);
  scene.add(ground, castleArea);

  const portal = criarPortal();
  portal.grupo.position.set(castleCenterX - 25, 0, 40);
  castleArea.add(portal.grupo);
  configureWorldShadows(scene);

  window.addEventListener("resize", () => onWindowResize(camera, renderer));

  const collisionObjects = [bridge, castelo, tallHouse, shortHouse, portal.grupo];
  return {
    scene,
    renderer,
    camera,
    grounds: [ground, courtyard, bridge, tallHouse, castelo, shortHouse, portal.grupo],
    wallCollisions: createWallCollision(collisionObjects),
    playerCollisions: createWallCollision(collisionObjects, true),
    toggleDayNight,
    portal
  };
}
