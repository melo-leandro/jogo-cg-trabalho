import * as THREE from "three";
import { usarChave, quantidadeChaves } from "./keys.js";

const DISTANCIA_INTERACAO = 3.4; // distância horizontal até o centro do pedestal
const ALTURA_OLHO = 4;
const TEMPO_SURGIR_ESFERA = 0.5;
const INTENSIDADE_LUZ_ESFERA = 25;
const BRILHO_SIMBOLO = 1.4;
const ATRASO_ABERTURA = 0.8;     // pausa entre a 4ª esfera e a tampa começar a abrir
const DURACAO_ABERTURA = 2.6;
const ANGULO_ABERTA = THREE.MathUtils.degToRad(105);
const INTENSIDADE_LUZ_PORTAL = 90;

// estado: "fechado" -> "aguardando" -> "abrindo" -> "aberto"
export function criarMecanicaPortal(portal, { aoColocarEsfera, aoAbrir } = {}) {
  const pedestais = portal.pedestais.map((modelo) => ({ modelo, ocupado: false, tempo: 0 }));
  const posicao = new THREE.Vector3();
  let estado = "fechado";
  let tempoEstado = 0;
  let relogio = 0;

  function tentarColocarEsferas(camera) {
    for (const pedestal of pedestais) {
      if (pedestal.ocupado || quantidadeChaves() === 0) continue;

      pedestal.modelo.grupo.getWorldPosition(posicao);
      const distancia = Math.hypot(camera.position.x - posicao.x, camera.position.z - posicao.z);
      const noMesmoNivel = Math.abs(camera.position.y - ALTURA_OLHO - posicao.y) < 1.5;
      if (distancia > DISTANCIA_INTERACAO || !noMesmoNivel || !usarChave()) continue;

      pedestal.ocupado = true;
      pedestal.tempo = 0;
      pedestal.modelo.esfera.visible = true;
      aoColocarEsfera?.(pedestais.filter((p) => p.ocupado).length, pedestais.length);
    }
  }

  function animarPedestais(delta) {
    pedestais.forEach((pedestal, i) => {
      if (!pedestal.ocupado) return;
      pedestal.tempo += delta;

      const { esfera, luz, materialSimbolo, alturaEsfera } = pedestal.modelo;
      const k = THREE.MathUtils.smoothstep(pedestal.tempo, 0, TEMPO_SURGIR_ESFERA);
      esfera.scale.setScalar(Math.max(k, 0.001));
      esfera.position.y = alturaEsfera + Math.sin(relogio * 2 + i) * 0.07;
      luz.intensity = INTENSIDADE_LUZ_ESFERA * k;
      materialSimbolo.emissiveIntensity = BRILHO_SIMBOLO * k;
    });
  }

  function animarAbertura(delta) {
    tempoEstado += delta;

    if (estado === "fechado" && pedestais.every((p) => p.ocupado)) {
      estado = "aguardando";
      tempoEstado = 0;
    }
    if (estado === "aguardando" && tempoEstado >= ATRASO_ABERTURA) {
      estado = "abrindo";
      tempoEstado = 0;
      portal.vortice.visible = true;
      portal.coluna.visible = true;
      aoAbrir?.();
    }
    if (estado !== "abrindo" && estado !== "aberto") return;

    const p = THREE.MathUtils.clamp(tempoEstado / DURACAO_ABERTURA, 0, 1);
    const suave = p * p * (3 - 2 * p);
    if (p >= 1) estado = "aberto";

    // as folhas giram em torno das dobradiças, para fora
    for (const folha of portal.folhas) {
      folha.rotation.z = -folha.userData.lado * ANGULO_ABERTA * suave;
    }

    const pulso = 0.9 + 0.1 * Math.sin(relogio * 3);
    portal.vortice.material.emissiveIntensity = 1.6 * suave;
    portal.vortice.material.emissiveMap.rotation -= delta * 0.7;
    portal.runas.material.emissiveIntensity = 1.5 * suave * pulso;
    portal.coluna.material.opacity = 0.5 * suave * pulso;
    portal.luzPortal.intensity = INTENSIDADE_LUZ_PORTAL * suave * pulso;
  }

  return {
    atualizar(delta, camera, podeInteragir) {
      relogio += delta;
      if (podeInteragir && estado === "fechado") tentarColocarEsferas(camera);
      animarPedestais(delta);
      animarAbertura(delta);
    },
    estaAberto: () => estado === "aberto"
  };
}
