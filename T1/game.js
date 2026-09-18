import * as THREE from "three";
import { createPlayerControls } from "./controls/playerControls.js";
import { isInOrbitMode, toggleOrbit, updateOrbit } from "./controls/orbitCamera.js";
import { criarArma } from "./models/gun.js";
import { groundCollision, wallCollision } from "./mechanics/collision.js";
import { atirar, atualizarProjeteis } from "./mechanics/shooting.js";
import { createHud } from "./ui/hud.js";
import { createWorld } from "./world/world.js";

const { scene, renderer, camera, grounds, wallCollisions } = createWorld();
const { controls, update: movePlayer } = createPlayerControls(
  camera,
  renderer.domElement,
  () => !isInOrbitMode()
);
const { arma, ponta } = criarArma(camera);
const hud = createHud(camera);

window.addEventListener("keydown", (event) => {
  if (event.code !== "KeyC") return;

  toggleOrbit(camera, renderer, controls);
  arma.visible = !isInOrbitMode();
  hud.showCameraMode(isInOrbitMode());
});

window.addEventListener("mousedown", () => {
  if (!isInOrbitMode() && controls.isLocked) atirar(scene, camera, ponta);
});

const clock = new THREE.Timer();
clock.connect(document);


render();

function render() {
  clock.update();
  const delta = Math.min(clock.getDelta(), 0.05);

  if (isInOrbitMode()) {
    updateOrbit();
  } else if (controls.isLocked) {
    const previousPosition = camera.position.clone();
    movePlayer(delta);
    wallCollision(camera, previousPosition, wallCollisions);
    groundCollision(camera, grounds, delta);
  }

  atualizarProjeteis(delta, scene, wallCollisions);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}