import * as THREE from "three";
import { criarChave } from "../models/key.js";

// Chaves que o jogador carrega.
// Inimigos chamam adicionarChave() quando a chave é coletada;
// o portal chama usarChave() quando uma esfera é colocada num pedestal.

export const TOTAL_CHAVES = 4;

let carregadas = 0;
let colocadas = 0;
let antesDoAtalho = null; // quantidade guardada ao apertar K (null: atalho desligado)
const ouvintes = new Set();
const chavesSoltas = [];
const DISTANCIA_COLETA = 3.4;
const chavesPreparadas = [];

export function quantidadeChaves() {
  return carregadas;
}

export function adicionarChave() {
  if (carregadas >= TOTAL_CHAVES - colocadas) return false;
  carregadas = Math.min(carregadas + 1, TOTAL_CHAVES - colocadas);
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
    const dz = camera.position.z - chaveSolta.grupo.position.z;
    if (Math.hypot(dx, dz) > DISTANCIA_COLETA || !adicionarChave()) continue;

    chaveSolta.grupo.visible = false;
    chaveSolta.luz.intensity = 0;
    chavesSoltas.splice(i, 1);
  }
}

export function usarChave() {
  if (carregadas <= 0) return false;
  carregadas--;
  colocadas++;
  avisar();
  return true;
}

// Tecla K: recebe todas as chaves que ainda não estão nos pedestais;
// apertando de novo, volta à quantidade anterior. Retorna true se o atalho ficou ativo.
export function alternarTodasAsChaves() {
  if (antesDoAtalho === null) {
    antesDoAtalho = carregadas;
    carregadas = TOTAL_CHAVES - colocadas;
  } else {
    carregadas = Math.min(antesDoAtalho, TOTAL_CHAVES - colocadas);
    antesDoAtalho = null;
  }
  avisar();
  return antesDoAtalho !== null;
}

export function aoMudarChaves(funcao) {
  ouvintes.add(funcao);
  funcao(carregadas, colocadas);
}

function avisar() {
  for (const funcao of ouvintes) funcao(carregadas, colocadas);
}
