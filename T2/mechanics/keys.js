// Chaves que o jogador carrega.
// Inimigos chamam adicionarChave() quando a chave é coletada;
// o portal chama usarChave() quando uma esfera é colocada num pedestal.

export const TOTAL_CHAVES = 4;

let carregadas = 0;
let colocadas = 0;
let antesDoAtalho = null; // quantidade guardada ao apertar K (null: atalho desligado)
const ouvintes = new Set();

export function quantidadeChaves() {
  return carregadas;
}

export function adicionarChave() {
  carregadas = Math.min(carregadas + 1, TOTAL_CHAVES - colocadas);
  avisar();
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
