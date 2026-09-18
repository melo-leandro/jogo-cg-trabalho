import { PointerLockControls } from "../build/jsm/controls/PointerLockControls.js";

export function createPlayerControls(camera, domElement, canLock) {
  const controls = new PointerLockControls(camera, domElement);
  const keys = new Set();

  domElement.addEventListener("click", () => {
    if (canLock()) controls.lock(true);
  });

  window.addEventListener("keydown", (event) => keys.add(event.code));
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  controls.addEventListener("unlock", () => keys.clear());

  function update(delta) {
    const distance = 20 * delta;

    if (keys.has("KeyW") || keys.has("ArrowUp")) controls.moveForward(distance);
    if (keys.has("KeyS") || keys.has("ArrowDown")) controls.moveForward(-distance);
    if (keys.has("KeyD") || keys.has("ArrowRight")) controls.moveRight(distance);
    if (keys.has("KeyA") || keys.has("ArrowLeft")) controls.moveRight(-distance);

    if (keys.has("ShiftLeft") && keys.has("KeyW")) controls.moveForward(distance * 4);
    if (keys.has("ShiftLeft") && keys.has("KeyS")) controls.moveForward(-distance * 4);
    if (keys.has("ShiftLeft") && keys.has("KeyD")) controls.moveRight(distance * 4);
    if (keys.has("ShiftLeft") && keys.has("KeyA")) controls.moveRight(-distance * 4);
  }

  return { controls, update };
}
