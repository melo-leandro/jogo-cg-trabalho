import { FirstPersonControls } from "../build/jsm/controls/FirstPersonControls.js";
import { PointerLockControls } from "../build/jsm/controls/PointerLockControls.js";

export function createPlayerControls(camera, domElement, canLock, canFly) {
  const controls = new PointerLockControls(camera, domElement);
  const movementControls = new FirstPersonControls(camera.clone(false), document.createElement("div"));
  let isRunning = false;

  movementControls.movementSpeed = 15;
  movementControls.lookSpeed = 0;

  domElement.addEventListener("click", () => {
    if (canLock()) controls.lock(true);
  });

  window.addEventListener("keydown", ({ code }) => {
    if (code === "ShiftLeft" || code === "ShiftRight") isRunning = true;
  });
  window.addEventListener("keyup", ({ code }) => {
    if (code === "ShiftLeft" || code === "ShiftRight") isRunning = false;
  });

  function update(delta) {
    const previousHeight = camera.position.y;

    movementControls.object.position.copy(camera.position);
    movementControls.object.quaternion.copy(camera.quaternion);
    movementControls.movementSpeed = isRunning ? 30 : 15;
    movementControls.update(delta);
    camera.position.copy(movementControls.object.position);

    // ponytail: no modo normal, a gravidade continua sendo a dona do eixo Y.
    if (!canFly()) camera.position.y = previousHeight;
  }

  return { controls, update };
}
