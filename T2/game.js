import * as THREE from "three";
import { restoreCamera, saveCamera } from "./controls/cameraStorage.js";
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
import { aoMudarChaves, alternarTodasAsChaves } from "./mechanics/keys.js";
import { criarMecanicaPortal } from "./mechanics/portalMechanics.js";
import { createEnemies } from "./mechanics/enemies.js";
import { createVictorySwirl } from "./world/victorySwirl.js";

const { scene, renderer, camera, grounds, wallCollisions, playerCollisions, toggleDayNight, portal } = createWorld();

const initialCamera = camera.clone(false);
restoreCamera(camera);
window.addEventListener("pagehide", () => {
  if (!hasWon) saveCamera(camera);
});
// o dardo crava em paredes, pisos e também no chão
const boltColliders = [...wallCollisions, ...grounds.filter((object) => object.isMesh)];

const { controls, update: movePlayer } = createPlayerControls(
  camera,
  renderer.domElement,
  () => !hasWon && !isInOrbitMode(),
  isBuildCameraEnabled
);
const besta = criarArma(camera);
const { arma } = besta;
const hud = createHud();
let updateVictorySwirl = null;
let hasWon = false;
const enemySystem = createEnemies(scene, wallCollisions, playerCollisions, grounds);
const buildModeEnabled = isBuildCameraEnabled();
arma.visible = !buildModeEnabled;
hud.setCrosshairVisible(!buildModeEnabled);

window.addEventListener("keydown", (event) => {
  if (hasWon && event.code === "KeyR") window.location.reload();
  if (!hasWon && event.code === "KeyH" && !event.repeat) {
    enemySystem.setNight(toggleDayNight());
  }
});

// chaves e portal
aoMudarChaves((carregadas, colocadas) => hud.setKeys(carregadas, colocadas));
const portalMechanics = criarMecanicaPortal(portal, {
  aoColocarEsfera: (colocadas, total) => hud.showMessage(`Esfera colocada no pedestal (${colocadas}/${total})`),
  aoAbrir: () => hud.showMessage("O portal se abriu! Entre no círculo para escapar."),
  aoEntrar: () => {
    hasWon = true;
    saveCamera(initialCamera);
    controls.unlock();
    arma.visible = false;
    hud.setCrosshairVisible(false);
    updateVictorySwirl = createVictorySwirl(renderer, scene, camera);
  }
});

window.addEventListener("keydown", (event) => {
  if (hasWon || event.code !== "KeyK" || event.repeat) return;

  const ativo = alternarTodasAsChaves();
  hud.showMessage(ativo ? "Todas as chaves recebidas" : "Chaves anteriores restauradas");
});

window.addEventListener("keydown", (event) => {
  if (hasWon || event.code !== "KeyC" || event.repeat || isBuildCameraEnabled()) return;

  toggleOrbit(camera, renderer, controls);
  arma.visible = !isInOrbitMode();
  hud.setCrosshairVisible(!isInOrbitMode());
  hud.showCameraMode(isInOrbitMode());
});

// modo construção
window.addEventListener("keydown", (event) => {
  if (hasWon || event.code !== "KeyB" || event.repeat || isInOrbitMode()) return;

  const enabled = toggleBuildCamera();
  arma.visible = !enabled;
  hud.setCrosshairVisible(!enabled);
  hud.showBuildMode(enabled);
});

window.addEventListener("keydown", (event) => {
  if (
    event.code !== "Space" ||
    hasWon ||
    event.repeat ||
    !controls.isLocked ||
    isInOrbitMode() ||
    isBuildCameraEnabled()
  ) return;

  jump();
});

// qualquer botão do mouse dispara (respeitando o tempo de recarga)
window.addEventListener("mousedown", () => {
  if (!hasWon && !isInOrbitMode() && !isBuildCameraEnabled() && controls.isLocked) {
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

  if (hasWon) {
    hud.showVictory(updateVictorySwirl(delta));
    requestAnimationFrame(render);
    return;
  }
  if (isInOrbitMode()) {
    updateOrbit();
  } else if (controls.isLocked) {
    const previousPosition = camera.position.clone();
    movePlayer(delta);

    if (!isBuildCameraEnabled()) {
      wallCollision(camera, previousPosition, playerCollisions);
      groundCollision(camera, grounds, delta);
    }
  }

  doorInteraction(doorGroups, camera);
  const isPlaying = !hasWon && controls.isLocked && !isInOrbitMode() && !isBuildCameraEnabled();
  enemySystem.update(delta, camera, isPlaying);

  for (const doorGroup of doorGroups) {
    for (const [door, openRotation, animationSpeed = 0.05] of doorGroup.doors) {
      doorLerping(door, doorGroup.isOpen ? openRotation : 0, animationSpeed);
    }
  }

  portalMechanics.atualizar(delta, camera, isPlaying);

  hud.setReloadProgress(atualizarBesta(delta, besta, camera));
  atualizarProjeteis(delta, scene, boltColliders, enemySystem.targets);
  renderWithWeapon(renderer, scene, camera, arma);
  requestAnimationFrame(render);
}
