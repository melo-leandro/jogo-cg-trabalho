import { CORES_CHAVES } from "../models/key.js";

const nomesChaves = ["Laranja", "Azul", "Verde", "Roxa"];

export function createKeyPanel() {
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

  // carried e placed: cores com o jogador e nos pedestais.
  return (carried, placed) => {
    const slots = CORES_CHAVES.map((cor, i) => {
      const owned = carried.includes(cor);
      const used = placed.includes(cor);
      const label = `Chave ${nomesChaves[i]}: ${used ? "no pedestal" : owned ? "com você" : "ausente"}`;
      return `<span role="img" aria-label="${label}" title="${label}" ` +
        `style="display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;` +
        `width:14px;height:14px;margin-left:5px;border-radius:50%;color:${cor};font:bold 12px/1 sans-serif;` +
        `border:2px solid ${cor};box-sizing:border-box;` +
        (owned ? `background:${cor};box-shadow:0 0 6px ${cor};` : used ? "" : "opacity:0.4;") +
        `">${used ? "X" : ""}</span>`;
    }).join("");
    keysPanel.innerHTML = `Chaves:${slots}`;
  };
}
