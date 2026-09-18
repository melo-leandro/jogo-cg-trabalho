import { InfoBox, SecondaryBox } from "../libs/util/util.js";

export function createHud(camera) {
  const crosshair = document.createElement("div");
  crosshair.textContent = "+";
  Object.assign(crosshair.style, {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    color: "red",
    fontSize: "30px",
    pointerEvents: "none"
  });
  document.body.appendChild(crosshair);

  const cameraBox = new SecondaryBox();
  const updateCameraPosition = () => {
    const { x, y, z } = camera.position;
    cameraBox.changeMessage(`Camera Position: ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`);
  };
  updateCameraPosition();
  camera.addEventListener("change", updateCameraPosition);

  const infoBox = new InfoBox();
  let messageTimeout;

  return {
    showCameraMode(isOrbiting) {
      clearTimeout(messageTimeout);
      infoBox.infoBox.innerHTML = "";
      infoBox.add(isOrbiting ? "Câmera orbital" : "Câmera primeira pessoa");
      infoBox.show();
      messageTimeout = setTimeout(() => infoBox.infoBox.remove(), 2000);
    }
  };
}
