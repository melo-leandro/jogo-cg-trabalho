import * as THREE from "three";
import { restoreCamera, saveCamera } from "../cameraStorage.js";
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
import { aoMudarChaves, alternarTodasAsChaves, TOTAL_CHAVES } from "./mechanics/keys.js";
import { criarMecanicaPortal } from "./mechanics/portalMechanics.js";
import { createEnemies } from "./mechanics/enemies.js";

const { scene, renderer, camera, grounds, wallCollisions, playerCollisions, toggleDayNight, portal } = createWorld();

const enemySystem = createEnemies(scene, wallCollisions);
playerCollisions.push(...enemySystem.colliders);
restoreCamera(camera);
window.addEventListener("pagehide", () => saveCamera(camera));
// o dardo crava em paredes, pisos e também no chão
const boltColliders = [...wallCollisions, ...grounds.filter((object) => object.isMesh)];

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
  if (event.code === "KeyH" && !event.repeat) toggleDayNight();
});

// chaves e portal
aoMudarChaves((carregadas, colocadas) => hud.setKeys(carregadas, colocadas, TOTAL_CHAVES));
const portalMechanics = criarMecanicaPortal(portal, {
  aoColocarEsfera: (colocadas, total) => hud.showMessage(`Esfera colocada no pedestal (${colocadas}/${total})`),
  aoAbrir: () => hud.showMessage("O portal se abriu!")
});

window.addEventListener("keydown", (event) => {
  if (event.code !== "KeyK" || event.repeat) return;

  const ativo = alternarTodasAsChaves();
  hud.showMessage(ativo ? "Todas as chaves recebidas" : "Chaves anteriores restauradas");
});

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
      wallCollision(camera, previousPosition, playerCollisions);
      groundCollision(camera, grounds, delta);
    }
  }

  doorInteraction(doorGroups, camera);
  enemySystem.update(delta, camera);

  for (const doorGroup of doorGroups) {
    for (const [door, openRotation, animationSpeed = 0.05] of doorGroup.doors) {
      doorLerping(door, doorGroup.isOpen ? openRotation : 0, animationSpeed);
    }
  }

  portalMechanics.atualizar(delta, camera, !isInOrbitMode() && !isBuildCameraEnabled());

  hud.setReloadProgress(atualizarBesta(delta, besta, camera));
  atualizarProjeteis(delta, scene, boltColliders);
  renderWithWeapon(renderer, scene, camera, arma);
  requestAnimationFrame(render);
}
