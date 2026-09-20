import { InfoBox } from "../libs/util/util.js";

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

  const cameraModeInfoBox = new InfoBox();

  // infobox do modo de construção
  const buildModeBox = new InfoBox();

  const box = buildModeBox.infoBox;

  box.style.removeProperty("bottom");
  box.style.removeProperty("right");

  Object.assign(box.style, {
    top: "10px",
    left: "10px",
    width: "max-content",
    maxWidth: "calc(100vw - 20px)"
  });

  let cameraMessageTimeout;
  let buildMessageTimeout;

  return {
    setCrosshairVisible(visible) {
      crosshair.style.display = visible ? "block" : "none";
    },

    showCameraMode(isOrbiting) {
      clearTimeout(cameraMessageTimeout);
      cameraModeInfoBox.infoBox.innerHTML = "";
      cameraModeInfoBox.add(isOrbiting ? "Câmera orbital" : "Câmera primeira pessoa");
      cameraModeInfoBox.show();

      cameraMessageTimeout = setTimeout(() => cameraModeInfoBox.infoBox.remove(), 2000);
    },

    showBuildMode(isBuildMode) {
      clearTimeout(buildMessageTimeout);
      buildModeBox.infoBox.innerHTML = "";
      buildModeBox.add(isBuildMode ? "Modo construção ativado" : "Modo construção desativado");
      buildModeBox.show();

      buildMessageTimeout = setTimeout(() => buildModeBox.infoBox.remove(), 2000);
    }
  };
}
