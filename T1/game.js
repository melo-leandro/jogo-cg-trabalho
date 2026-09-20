import * as THREE from "three";
import { isBuildCameraEnabled, toggleBuildCamera } from "./controls/buildCamera.js";
import { restoreCamera, saveCamera } from "./controls/cameraStorage.js";
import { createPlayerControls } from "./controls/playerControls.js";
import { isInOrbitMode, toggleOrbit, updateOrbit } from "./controls/orbitCamera.js";
import { criarArma } from "./models/gun.js";
import { groundCollision, jump, wallCollision } from "./mechanics/collision.js";
import { atirar, atualizarProjeteis } from "./mechanics/shooting.js";
import { createHud } from "./ui/hud.js";
import { createWorld } from "./world/world.js";
import { castleDoors } from "./models/doors.js";
import { shortHouseDoors } from "./models/shortHouse.js";
import { tallHouseDoors } from "./models/tallHouse.js";
import { doorInteraction, doorLerping } from "./mechanics/doorMechanics.js";

const { scene, renderer, camera, grounds, wallCollisions } = createWorld();
restoreCamera(camera);
window.addEventListener("pagehide", () => saveCamera(camera));

const { controls, update: movePlayer } = createPlayerControls(
  camera,
  renderer.domElement,
  () => !isInOrbitMode(),
  isBuildCameraEnabled
);
const { arma, ponta } = criarArma(camera);
const hud = createHud(camera);
const buildModeEnabled = isBuildCameraEnabled();
arma.visible = !buildModeEnabled;
hud.setCrosshairVisible(!buildModeEnabled);

window.addEventListener("keydown", (event) => {
  if (event.code !== "KeyC" || event.repeat || isBuildCameraEnabled()) return;

  toggleOrbit(camera, renderer, controls);
  arma.visible = !isInOrbitMode();
  hud.showCameraMode(isInOrbitMode());
});

// modo construção
window.addEventListener("keydown", (event) => {
  if (event.code !== "KeyB" || event.repeat || isInOrbitMode()) return;

  const enabled = toggleBuildCamera();
  arma.visible = !enabled;
  hud.setCrosshairVisible(!enabled);
  hud.showBuildMode(enabled);
});

window.addEventListener("keydown", (event) => {
  if (
    event.code !== "Space" ||
    event.repeat ||
    !controls.isLocked ||
    isInOrbitMode() ||
    isBuildCameraEnabled()
  ) return;

  jump();
});

window.addEventListener("mousedown", () => {
  if (!isInOrbitMode() && !isBuildCameraEnabled() && controls.isLocked) {
    atirar(scene, camera, ponta);
  }
});


// interação com portas
const doorGroups = [castleDoors, shortHouseDoors, tallHouseDoors]
  .map((doors) => ({ doors, isOpen: false }));
let activeDoor = null;

window.addEventListener("keydown", (event) => {
  if (
    event.code === "KeyE" &&
    !event.repeat &&
    activeDoor &&
    !isInOrbitMode() &&
    !isBuildCameraEnabled()
  ) {
    activeDoor.isOpen = !activeDoor.isOpen;
  }
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

    if (!isBuildCameraEnabled()) {
      wallCollision(camera, previousPosition, wallCollisions);
      groundCollision(camera, grounds, delta);
    }
  }

  activeDoor = doorInteraction(doorGroups, camera);

  for (const doorGroup of doorGroups) {
    for (const [door, openRotation, animationSpeed = 0.05] of doorGroup.doors) {
      doorLerping(door, doorGroup.isOpen ? openRotation : 0, animationSpeed);
    }
  }

  atualizarProjeteis(delta, scene, wallCollisions);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
