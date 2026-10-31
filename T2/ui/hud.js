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

  // barra de recarga da besta, logo abaixo da mira
  const reloadBar = document.createElement("div");
  const reloadFill = document.createElement("div");
  Object.assign(reloadBar.style, {
    position: "fixed",
    left: "50%",
    top: "calc(50% + 24px)",
    width: "48px",
    height: "4px",
    transform: "translateX(-50%)",
    background: "rgba(0, 0, 0, 0.45)",
    borderRadius: "2px",
    overflow: "hidden",
    pointerEvents: "none",
    display: "none"
  });
  Object.assign(reloadFill.style, {
    width: "0%",
    height: "100%",
    background: "#e8d9a8"
  });
  reloadBar.appendChild(reloadFill);
  document.body.appendChild(reloadBar);
  let crosshairVisible = true;

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
  controlsBox.add("Disparar besta: Clique esquerdo/direito");
  controlsBox.add("Câmera orbital: C");
  controlsBox.add("Modo construção: B");
  controlsBox.add("Dia/noite: H");
  controlsBox.add("Todas as chaves: K");
  controlsBox.show();

  const orbitControlsBox = new InfoBox();
  orbitControlsBox.infoBox.style.cssText = controlsBox.infoBox.style.cssText;
  orbitControlsBox.add("Girar: Botão esquerdo do mouse");
  orbitControlsBox.add("Arrastar: Botão direito do mouse");
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

  let messageTimeout;

  function showMessage(text) {
    clearTimeout(messageTimeout);
    buildModeBox.infoBox.innerHTML = "";
    buildModeBox.add(text);
    buildModeBox.show();

    messageTimeout = setTimeout(() => buildModeBox.infoBox.remove(), 2500);
  }

  // chaves carregadas pelo jogador (canto inferior esquerdo)
  const keysPanel = document.createElement("div");
  Object.assign(keysPanel.style, {
    position: "fixed",
    left: "10px",
    bottom: "10px",
    padding: "8px 12px",
    background: "rgba(0, 0, 0, 0.55)",
    color: "white",
    font: "14px sans-serif",
    borderRadius: "6px",
    pointerEvents: "none"
  });
  document.body.appendChild(keysPanel);

  return {
    setCrosshairVisible(visible) {
      crosshairVisible = visible;
      crosshair.style.display = visible ? "block" : "none";
      if (!visible) reloadBar.style.display = "none";
    },

    // progress: 0 (acabou de disparar) .. 1 (besta carregada)
    setReloadProgress(progress) {
      const reloading = crosshairVisible && progress < 1;
      reloadBar.style.display = reloading ? "block" : "none";
      reloadFill.style.width = `${Math.round(progress * 100)}%`;
    },

    showCameraMode(isOrbiting) {
      controlsBox.infoBox.remove();
      orbitControlsBox.infoBox.remove();
      (isOrbiting ? orbitControlsBox : controlsBox).show();
    },

    showBuildMode(isBuildMode) {
      showMessage(isBuildMode ? "Modo construção ativado" : "Modo construção desativado");
    },

    showMessage,

    // carried: chaves com o jogador; placed: esferas já nos pedestais
    setKeys(carried, placed, total = 4) {
      const slots = Array.from({ length: total }, (_, i) =>
        `<span style="display:inline-block;width:14px;height:14px;margin-left:5px;border-radius:50%;` +
        (i < carried
          ? `background:#ffc94a;box-shadow:0 0 6px #ffc94a;"></span>`
          : `border:2px solid rgba(255,255,255,0.45);box-sizing:border-box;"></span>`)
      ).join("");
      keysPanel.innerHTML = `Chaves:${slots}<div style="font-size:12px;opacity:0.75;margin-top:4px">` +
        `Nos pedestais: ${placed}/${total}</div>`;
    }
  };
}
