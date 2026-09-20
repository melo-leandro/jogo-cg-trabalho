import { PointerLockControls } from "../build/jsm/controls/PointerLockControls.js";

export function createPlayerControls(camera, domElement, canLock, canFly) {
  const controls = new PointerLockControls(camera, domElement);
  const keys = new Set();

  domElement.addEventListener("click", () => {
    if (canLock()) controls.lock(true);
  });

  window.addEventListener("keydown", (event) => keys.add(event.code));
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  controls.addEventListener("unlock", () => keys.clear());

  function update(delta) {
    const isRunning = keys.has("ShiftLeft") || keys.has("ShiftRight");
    const distance = 20 * delta * (isRunning ? 3 : 1);
    const isFlying = canFly();

    if (keys.has("KeyW") || keys.has("ArrowUp")) controls.moveForward(distance);
    if (keys.has("KeyS") || keys.has("ArrowDown")) controls.moveForward(-distance);
    if (keys.has("KeyD") || keys.has("ArrowRight")) controls.moveRight(distance);
    if (keys.has("KeyA") || keys.has("ArrowLeft")) controls.moveRight(-distance);

    if (isFlying) {
      if (keys.has("KeyQ")) camera.position.y -= distance;
      if (keys.has("KeyE")) camera.position.y += distance;
    }
  }

  return { controls, update };
}
