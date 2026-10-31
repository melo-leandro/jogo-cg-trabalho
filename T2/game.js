import * as THREE from "three";
import { isBuildCameraEnabled, toggleBuildCamera } from "./controls/buildCamera.js";
import { createPlayerControls } from "./controls/playerControls.js";
import { isInOrbitMode, toggleOrbit, updateOrbit } from "./controls/orbitCamera.js";
import { criarArma } from "./models/gun.js";
import { backCastleDoors } from "./models/castle.js";
import { groundCollision, jump, wallCollision } from "./mechanics/collision.js";
import { atirar, atualizarBesta, atualizarProjeteis } from "./mechanics/shooting.js";
import { renderWithWeapon } from "./world/renderWithWeapon.js";
import { createHud } from "./ui/hud.js";
import { createWorld } from "./world/world.js";
import { castleDoors } from "./models/doors.js";
import { shortHouseDoors } from "./models/shortHouse.js";
import { tallHouseDoors } from "./models/tallHouse.js";
import { doorInteraction, doorLerping } from "./mechanics/doorMechanics.js";

const { scene, renderer, camera, ground, grounds, wallCollisions } = createWorld();
// o dardo crava em paredes, pisos e também no chão
const boltColliders = [...wallCollisions, ground];

const { controls, update: movePlayer } = createPlayerControls(
  camera,
  renderer.domElement,
  () => !isInOrbitMode(),
  isBuildCameraEnabled
);
const besta = criarArma(camera);
const { arma } = besta;
const hud = createHud(camera);
const buildModeEnabled = isBuildCameraEnabled();
arma.visible = !buildModeEnabled;
hud.setCrosshairVisible(!buildModeEnabled);

window.addEventListener("keydown", (event) => {
  if (event.code !== "KeyC" || event.repeat || isBuildCameraEnabled()) return;

  toggleOrbit(camera, renderer, controls);
  arma.visible = !isInOrbitMode();
  hud.setCrosshairVisible(!isInOrbitMode());
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

// qualquer botão do mouse dispara (respeitando o tempo de recarga)
window.addEventListener("mousedown", () => {
  if (!isInOrbitMode() && !isBuildCameraEnabled() && controls.isLocked) {
    atirar(scene, camera, besta, boltColliders);
  }
});
renderer.domElement.addEventListener("contextmenu", (event) => event.preventDefault());


// interação com portas
const doorGroups = [castleDoors, backCastleDoors, shortHouseDoors, tallHouseDoors]
  .map((doors) => ({ doors, isOpen: false }));


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

  doorInteraction(doorGroups, camera);

  for (const doorGroup of doorGroups) {
    for (const [door, openRotation, animationSpeed = 0.05] of doorGroup.doors) {
      doorLerping(door, doorGroup.isOpen ? openRotation : 0, animationSpeed);
    }
  }

  hud.setReloadProgress(atualizarBesta(delta, besta, camera));
  atualizarProjeteis(delta, scene, boltColliders);
  renderWithWeapon(renderer, scene, camera, arma);
  requestAnimationFrame(render);
}
