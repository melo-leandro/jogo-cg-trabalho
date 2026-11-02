import * as THREE from "three";
import { criarChave, CORES_CHAVES } from "../models/key.js";

// Chaves que o jogador carrega.
// Inimigos chamam adicionarChave() quando a chave é coletada;
// o portal chama usarChave() quando uma esfera é colocada num pedestal.

let carregadas = new Set();
const colocadas = new Set();
let antesDoAtalho = null; // cores guardadas ao apertar K (null: atalho desligado)
const ouvintes = new Set();
const chavesSoltas = [];
const DISTANCIA_COLETA = 3.4;
const ALTURA_CENTRO_JOGADOR = 2;
const chavesPreparadas = [];
const dropsPendentes = new Map();

export function quantidadeChaves() {
  return carregadas.size;
}

export function adicionarChave(cor) {
  if (!CORES_CHAVES.includes(cor) || carregadas.has(cor) || colocadas.has(cor)) return false;
  carregadas.add(cor);
  avisar();
  return true;
}

export function prepararChavesSoltas(scene, colors) {
  for (const color of colors) {
    const chave = criarChave(color);
    const luz = new THREE.PointLight(color, 0, 10, 2);
    const grupo = new THREE.Group();
    chave.position.y = 0;
    luz.position.y = 0.2;
    grupo.add(chave, luz);
    grupo.visible = false;
    scene.add(grupo);
    chavesPreparadas.push({ grupo, luz, color, usada: false });
  }
}

export function registrarChaveDrop(position, color) {
  if (antesDoAtalho !== null) {
    dropsPendentes.set(color, position.clone());
    return;
  }
  if (carregadas.has(color) || colocadas.has(color)) return;

  const chavePreparada = chavesPreparadas.find((chave) =>
    !chave.usada && chave.color === color
  );
  if (!chavePreparada) return;

  chavePreparada.usada = true;
  chavePreparada.grupo.position.copy(position);
  chavePreparada.grupo.visible = true;
  chavePreparada.luz.intensity = 3;
  chavesSoltas.push(chavePreparada);
}

export function atualizarChavesSoltas(camera) {
  for (let i = chavesSoltas.length - 1; i >= 0; i--) {
    const chaveSolta = chavesSoltas[i];
    const dx = camera.position.x - chaveSolta.grupo.position.x;
    const dy = camera.position.y - ALTURA_CENTRO_JOGADOR - chaveSolta.grupo.position.y;
    const dz = camera.position.z - chaveSolta.grupo.position.z;
    if (Math.hypot(dx, dy, dz) > DISTANCIA_COLETA || !adicionarChave(chaveSolta.color)) continue;

    chaveSolta.grupo.visible = false;
    chaveSolta.luz.intensity = 0;
    chavesSoltas.splice(i, 1);
  }
}

export function usarChave(cor) {
  if (!carregadas.delete(cor)) return false;
  colocadas.add(cor);
  avisar();
  return true;
}

// Tecla K: recebe todas as chaves que ainda não estão nos pedestais;
// apertando de novo, restaura as cores anteriores que ainda não foram usadas.
export function alternarTodasAsChaves() {
  if (antesDoAtalho === null) {
    antesDoAtalho = new Set(carregadas);
    carregadas = new Set(CORES_CHAVES.filter((cor) => !colocadas.has(cor)));
  } else {
    carregadas = new Set([...antesDoAtalho].filter((cor) => !colocadas.has(cor)));
    antesDoAtalho = null;
    for (const [cor, position] of dropsPendentes) registrarChaveDrop(position, cor);
    dropsPendentes.clear();
  }
  avisar();
  return antesDoAtalho !== null;
}

export function aoMudarChaves(funcao) {
  ouvintes.add(funcao);
  funcao([...carregadas], [...colocadas]);
}

function avisar() {
  for (const funcao of ouvintes) funcao([...carregadas], [...colocadas]);
}
