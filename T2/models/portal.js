import * as THREE from "three";
import { setDefaultMaterial } from "../libs/util/util.js";
import { criarChave, RAIO_CHAVE } from "./key.js";
import {
  SIMBOLOS,
  texturaSimbolo,
  texturaTampa,
  texturaRunas,
  texturaRedemoinho,
  texturaDegrade
} from "./portalTextures.js";

export const RAIO_ESCOTILHA = 4.5;
const RAIO_MOLDURA = 5.8;
const ALTURA_MOLDURA = 0.3;
const BEVEL_MOLDURA = 0.05;
const ESPESSURA_TAMPA = 0.22;
const DISTANCIA_PEDESTAL = 8.5;

// sol, gota, montanha e espiral
const CORES = ["#ffb43a", "#3fa9ff", "#3ddc6b", "#b35cff"];
const CANTOS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

const pedra = setDefaultMaterial("#6d6a63");
const pedraEscura = setDefaultMaterial("#4f4c46");
const ferro = setDefaultMaterial("#3a3c40");

export function criarPortal() {
  const grupo = new THREE.Group();
  grupo.name = "salaDoPortal";

  const moldura = criarMoldura();
  const runas = criarRunas();
  const { folhas, grupo: tampa } = criarTampa();
  const vortice = criarVortice();
  const coluna = criarColuna();

  const luzPortal = new THREE.PointLight("#6a9cff", 0, 35, 2);
  luzPortal.position.y = 2.5;

  grupo.add(moldura, runas, tampa, vortice, coluna, luzPortal);

  const pedestais = SIMBOLOS.map((simbolo, i) => {
    const pedestal = criarPedestal(simbolo, CORES[i]);
    const [sx, sz] = CANTOS[i];
    pedestal.grupo.position.set(sx * DISTANCIA_PEDESTAL, 0, sz * DISTANCIA_PEDESTAL);
    grupo.add(pedestal.grupo);
    return pedestal;
  });

  grupo.traverse((objeto) => {
    if (!objeto.isMesh) return;
    const efeito = objeto.userData.ignoreCollision || objeto === vortice;
    objeto.castShadow = !efeito;
    objeto.receiveShadow = !efeito;
  });

  return { grupo, pedestais, folhas, vortice, coluna, runas, luzPortal };
}

function criarMoldura() {
  const forma = new THREE.Shape().absarc(0, 0, RAIO_MOLDURA, 0, Math.PI * 2);
  forma.holes.push(new THREE.Path().absarc(0, 0, RAIO_ESCOTILHA, 0, Math.PI * 2, true));
  const geometria = new THREE.ExtrudeGeometry(forma, {
    depth: ALTURA_MOLDURA - BEVEL_MOLDURA,
    bevelEnabled: true,
    bevelThickness: BEVEL_MOLDURA,
    bevelSize: BEVEL_MOLDURA,
    bevelSegments: 2,
    curveSegments: 64
  });
  geometria.rotateX(-Math.PI / 2);
  geometria.translate(0, BEVEL_MOLDURA, 0);
  return new THREE.Mesh(geometria, pedraEscura);
}

function criarRunas() {
  const interno = RAIO_ESCOTILHA + 0.08;
  const externo = RAIO_MOLDURA - 0.08;
  const { mapa, brilho } = texturaRunas(interno, externo);
  const geometria = new THREE.RingGeometry(interno, externo, 96);
  geometria.rotateX(-Math.PI / 2);
  const runas = new THREE.Mesh(
    geometria,
    new THREE.MeshLambertMaterial({ map: mapa, emissive: "#6fb6ff", emissiveMap: brilho, emissiveIntensity: 0 })
  );
  runas.position.y = ALTURA_MOLDURA + 0.01;
  return runas;
}

function criarTampa() {
  const grupo = new THREE.Group();
  const raio = RAIO_ESCOTILHA - 0.05;
  const materiais = [
    setDefaultMaterial("#5a4d3f"),                                     // lateral
    new THREE.MeshLambertMaterial({ map: texturaTampa() }),          // face de cima
    pedraEscura                                                        // face de baixo
  ];

  const folhas = [1, -1].map((lado) => {
    const geometria = new THREE.CylinderGeometry(raio, raio, ESPESSURA_TAMPA, 48, 1, false, lado > 0 ? 0 : Math.PI, Math.PI);
    const folha = new THREE.Mesh(geometria, materiais);
    folha.userData.dynamicCollider = true;

    const pivo = new THREE.Group();
    pivo.position.set(lado * raio, ALTURA_MOLDURA, 0);
    folha.position.set(-lado * raio, -ESPESSURA_TAMPA / 2, 0);
    pivo.add(folha);

    const geometriaDobradica = new THREE.CylinderGeometry(0.16, 0.16, 0.9, 12);
    geometriaDobradica.rotateX(Math.PI / 2);
    for (const z of [-1.6, 1.6]) {
      const dobradica = new THREE.Mesh(geometriaDobradica, ferro);
      dobradica.position.set(0, -0.02, z);
      pivo.add(dobradica);
    }

    pivo.userData.lado = lado;
    grupo.add(pivo);
    return pivo;
  });

  return { grupo, folhas };
}

function criarVortice() {
  const geometria = new THREE.CircleGeometry(RAIO_ESCOTILHA, 64);
  geometria.rotateX(-Math.PI / 2);
  const vortice = new THREE.Mesh(
    geometria,
    new THREE.MeshLambertMaterial({
      color: "black",
      emissive: "white",
      emissiveMap: texturaRedemoinho(),
      emissiveIntensity: 0
    })
  );
  vortice.position.y = 0.04;
  vortice.visible = false;
  return vortice;
}

function criarColuna() {
  const altura = 14;
  const geometria = new THREE.CylinderGeometry(RAIO_ESCOTILHA * 0.92, RAIO_ESCOTILHA, altura, 48, 1, true);
  geometria.translate(0, altura / 2, 0);
  const coluna = new THREE.Mesh(
    geometria,
    new THREE.MeshLambertMaterial({
      color: "black",
      emissive: "#6aa8ff",
      alphaMap: texturaDegrade(),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
  );
  coluna.userData.ignoreCollision = true;
  coluna.visible = false;
  return coluna;
}

function criarPedestal(simbolo, cor) {
  const grupo = new THREE.Group();

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.4, 2.8), pedraEscura);
  base.position.y = 0.2;
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.9, 2.1), pedra);
  corpo.position.y = 1.35;
  const capitel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 2.6), pedraEscura);
  capitel.position.y = 2.475;
  grupo.add(base, corpo, capitel);

  const alturaBorda = 2.65 + 0.125;
  for (const [x, z, largura, profundidade] of [
    [0, -0.925, 2.2, 0.35], [0, 0.925, 2.2, 0.35], [-0.925, 0, 0.35, 1.5], [0.925, 0, 0.35, 1.5]
  ]) {
    const borda = new THREE.Mesh(new THREE.BoxGeometry(largura, 0.25, profundidade), pedra);
    borda.position.set(x, alturaBorda, z);
    grupo.add(borda);
  }

  const { mapa, brilho } = texturaSimbolo(simbolo);
  const materialSimbolo = new THREE.MeshLambertMaterial({
    map: mapa,
    emissive: cor,
    emissiveMap: brilho,
    emissiveIntensity: 0
  });
  const geometriaPlaca = new THREE.PlaneGeometry(1.4, 1.4);
  for (let i = 0; i < 4; i++) {
    const angulo = (i * Math.PI) / 2;
    const placa = new THREE.Mesh(geometriaPlaca, materialSimbolo);
    placa.position.set(Math.sin(angulo) * 1.056, 1.35, Math.cos(angulo) * 1.056);
    placa.rotation.y = angulo;
    grupo.add(placa);
  }

  const alturaEsfera = 2.65 + RAIO_CHAVE * 0.85;
  const esfera = criarChave(cor);
  esfera.position.y = alturaEsfera;
  esfera.visible = false;

  const luz = new THREE.PointLight(cor, 0, 12, 2);
  luz.position.y = alturaEsfera + 0.2;
  grupo.add(esfera, luz);

  return { grupo, cor, simbolo, esfera, luz, materialSimbolo, alturaEsfera };
}
