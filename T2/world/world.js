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

export function createDayNightLighting(scene, renderer) {
  const mainLight = new THREE.DirectionalLight();
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(2048, 2048);
  mainLight.shadow.camera.near = 100;
  mainLight.shadow.camera.far = 1000;
  mainLight.shadow.camera.left = -300;
  mainLight.shadow.camera.right = 300;
  mainLight.shadow.camera.bottom = -300;
  mainLight.shadow.camera.top = 300;
  mainLight.shadow.bias = -0.0005;
  mainLight.shadow.normalBias = 0.3;

  const fillLight = new THREE.HemisphereLight();
  scene.add(mainLight, fillLight);

  let isNight = false;

  renderer.setClearColor("#87ceeb");
  mainLight.color.set("#fff4d6");
  mainLight.intensity = 2.2;
  mainLight.position.set(-300, 500, 300);
  fillLight.color.set("#b1e1ff");
  fillLight.groundColor.set("#3d4b32");
  fillLight.intensity = 1.2;

  function toggleDayNight() {
    isNight = !isNight;

    if (isNight) {
      renderer.setClearColor("#07111f");
      mainLight.color.set("#b7c9ff");
      mainLight.intensity = 1.1;
      mainLight.position.set(-300, 400, -300);
      fillLight.color.set("#6177a6");
      fillLight.groundColor.set("#172033");
      fillLight.intensity = 0.75;
    } else {
      renderer.setClearColor("#87ceeb");
      mainLight.color.set("#fff4d6");
      mainLight.intensity = 2.2;
      mainLight.position.set(-300, 500, 300);
      fillLight.color.set("#b1e1ff");
      fillLight.groundColor.set("#3d4b32");
      fillLight.intensity = 1.2;
    }

    return isNight;
  }

  return toggleDayNight;
}

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

  const ground = createGroundPlaneXZ(600, 600, 1, 1, "#328248");
  ground.userData.walkable = true;
  const castleArea = new THREE.Group();
  castleArea.position.x = -castleCenterX;
  castleArea.add(castelo, tallHouse, shortHouse);
  scene.add(ground, castleArea);
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
    wallCollisions: createWallCollision([castelo, tallHouse, shortHouse]),
    toggleDayNight
  };
}
