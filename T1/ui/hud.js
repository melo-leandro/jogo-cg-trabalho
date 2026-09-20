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

  // infobox fixo com os comandos
  const controlsBox = new InfoBox();
  controlsBox.infoBox.style.removeProperty("bottom");
  Object.assign(controlsBox.infoBox.style, {
    top: "10px",
    right: "10px",
    left: "auto",
    fontSize: "14px",
    opacity: "0.8"
  });
  controlsBox.add("Mover: WASD / Setas");
  controlsBox.add("Olhar: Mouse");
  controlsBox.add("Correr: Shift");
  controlsBox.add("Pular: Espaço");
  controlsBox.add("Atirar: Clique esquerdo/direito");
  controlsBox.add("Câmera orbital: C");
  controlsBox.add("Modo construção: B");
  controlsBox.show();

  const orbitControlsBox = new InfoBox();
  orbitControlsBox.infoBox.style.cssText = controlsBox.infoBox.style.cssText;
  orbitControlsBox.add("Girar: Botão esquerdo do mouse");
  orbitControlsBox.add("Pan: Botão direito do mouse");
  orbitControlsBox.add("Zoom: Roda do mouse");
  orbitControlsBox.add("Voltar: C");

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

  let buildMessageTimeout;

  return {
    setCrosshairVisible(visible) {
      crosshair.style.display = visible ? "block" : "none";
    },

    showCameraMode(isOrbiting) {
      controlsBox.infoBox.remove();
      orbitControlsBox.infoBox.remove();
      (isOrbiting ? orbitControlsBox : controlsBox).show();
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
