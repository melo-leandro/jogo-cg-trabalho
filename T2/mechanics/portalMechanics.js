import * as THREE from "three";
import { usarChave, quantidadeChaves } from "./keys.js";

const DISTANCIA_INTERACAO = 3.4; // distância horizontal até o centro do pedestal
const ALTURA_OLHO = 4;
const INTENSIDADE_LUZ_ESFERA = 25;
const DURACAO_ABERTURA = 2.6;
const ANGULO_ABERTA = THREE.MathUtils.degToRad(105);
const INTENSIDADE_LUZ_PORTAL = 90;

// estado: "fechado" -> "abrindo" -> "aberto"
export function criarMecanicaPortal(portal, { aoColocarEsfera, aoAbrir } = {}) {
  const pedestais = portal.pedestais.map((modelo) => ({ modelo, ocupado: false }));
  const posicao = new THREE.Vector3();
  let estado = "fechado";
  let tempoAbrindo = 0;

  function tentarColocarEsferas(camera) {
    for (const pedestal of pedestais) {
      if (pedestal.ocupado || quantidadeChaves() === 0) continue;

      pedestal.modelo.grupo.getWorldPosition(posicao);
      const distancia = Math.hypot(camera.position.x - posicao.x, camera.position.z - posicao.z);
      const noMesmoNivel = Math.abs(camera.position.y - ALTURA_OLHO - posicao.y) < 1.5;
      if (distancia > DISTANCIA_INTERACAO || !noMesmoNivel || !usarChave()) continue;

      // a esfera aparece sobre o pedestal com a sua luz pontual
      pedestal.ocupado = true;
      pedestal.modelo.esfera.material.color.set(pedestal.modelo.cor);
      pedestal.modelo.esfera.material.emissive.set(pedestal.modelo.cor);
      pedestal.modelo.esfera.material.emissiveIntensity = 2;
      pedestal.modelo.esfera.visible = true;
      pedestal.modelo.luz.intensity = INTENSIDADE_LUZ_ESFERA;
      aoColocarEsfera?.(pedestais.filter((p) => p.ocupado).length, pedestais.length);
    }

    if (pedestais.every((p) => p.ocupado)) {
      estado = "abrindo";
      portal.vortice.visible = true;
      portal.luzPortal.intensity = INTENSIDADE_LUZ_PORTAL;
      aoAbrir?.();
    }
  }

  // as duas folhas da tampa giram em torno das dobradiças, para fora
  function abrirTampa(delta) {
    tempoAbrindo += delta;
    const p = THREE.MathUtils.smoothstep(tempoAbrindo, 0, DURACAO_ABERTURA);
    for (const folha of portal.folhas) {
      folha.rotation.z = -folha.userData.lado * ANGULO_ABERTA * p;
    }
    if (p >= 1) estado = "aberto";
  }

  return {
    atualizar(delta, camera, podeInteragir) {
      if (estado === "fechado" && podeInteragir) tentarColocarEsferas(camera);
      if (estado === "abrindo") abrirTampa(delta);
    },
    estaAberto: () => estado === "aberto"
  };
}
