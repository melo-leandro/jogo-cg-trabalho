import * as THREE from 'three';
import { setDefaultMaterial } from "../libs/util/util.js";

// Dardo de besta (virote / quadrelo).
// Modelado em metros, com a origem na traseira do dardo (onde a corda empurra)
// e a ponta apontando para +Z. Assim, um lookAt() na direção do voo
// já deixa o dardo orientado corretamente.
//
// Formato pesquisado: o virote medieval é mais curto e grosso que uma flecha,
// com haste levemente abaulada (mais grossa na frente), ponta piramidal de
// seção quadrada (quadrelo, feita para perfurar armadura), alvado metálico
// que prende a ponta na haste e 3 empenas curtas presas com fio.

const COMPRIMENTO_HASTE = 0.34;
const RAIO_HASTE_TRAS = 0.0055;
const RAIO_HASTE_FRENTE = 0.0075;
const COMPRIMENTO_ALVADO = 0.026;
const COMPRIMENTO_PONTA = 0.055;

export const COMPRIMENTO_DARDO = COMPRIMENTO_HASTE + COMPRIMENTO_ALVADO + COMPRIMENTO_PONTA;
export const RAIO_DARDO = RAIO_HASTE_FRENTE;

// materiais e geometrias são compartilhados por todos os dardos
// (cada disparo cria um dardo novo, então isso evita alocar tudo de novo)
const materiais = {
    madeira: setDefaultMaterial("#b58a57"),
    ferro: setDefaultMaterial("#5d6168"),
    ferroEscuro: setDefaultMaterial("#3a3d42"),
    linha: setDefaultMaterial("#3b2616"),
    empenaClara: setDefaultMaterial("#ebe0c5"),
    empenaVermelha: setDefaultMaterial("#9c2b22")
};
materiais.empenaClara.side = THREE.DoubleSide;
materiais.empenaVermelha.side = THREE.DoubleSide;

const geometrias = criarGeometrias();

function criarGeometrias() {
    // CylinderGeometry/ConeGeometry nascem no eixo Y; giramos para o eixo Z
    // (rotateX(PI/2) leva +Y para +Z, então o "topo" fica na frente)
    const haste = new THREE.CylinderGeometry(RAIO_HASTE_FRENTE, RAIO_HASTE_TRAS, COMPRIMENTO_HASTE, 10);
    haste.rotateX(Math.PI / 2);
    haste.translate(0, 0, COMPRIMENTO_HASTE / 2);

    const alvado = new THREE.CylinderGeometry(0.0072, 0.0086, COMPRIMENTO_ALVADO, 10);
    alvado.rotateX(Math.PI / 2);
    alvado.translate(0, 0, COMPRIMENTO_HASTE + COMPRIMENTO_ALVADO / 2 - 0.004);

    // pirâmide de base quadrada: cone com 4 segmentos radiais
    const ponta = new THREE.ConeGeometry(0.0115, COMPRIMENTO_PONTA, 4);
    ponta.rotateY(Math.PI / 4);
    ponta.rotateX(Math.PI / 2);
    ponta.translate(0, 0, COMPRIMENTO_HASTE + COMPRIMENTO_ALVADO + COMPRIMENTO_PONTA / 2 - 0.004);

    // perfil da empena: alta atrás e afinando para a frente, com a traseira recortada
    const perfil = new THREE.Shape();
    perfil.moveTo(0.012, 0);
    perfil.lineTo(0.008, 0.017);
    perfil.quadraticCurveTo(0.03, 0.022, 0.06, 0.012);
    perfil.quadraticCurveTo(0.085, 0.004, 0.105, 0);
    perfil.lineTo(0.012, 0);
    const empena = new THREE.ShapeGeometry(perfil, 6);
    // o perfil foi desenhado no plano XY (x = comprimento, y = altura);
    // rotateY(-PI/2) leva o X para o eixo +Z do dardo
    empena.rotateY(-Math.PI / 2);
    empena.translate(0, RAIO_HASTE_TRAS * 0.8, 0);

    const amarracao = new THREE.TorusGeometry(RAIO_HASTE_TRAS + 0.0008, 0.0014, 6, 14);

    const tampaTraseira = new THREE.CylinderGeometry(RAIO_HASTE_TRAS + 0.0006, RAIO_HASTE_TRAS + 0.0006, 0.006, 10);
    tampaTraseira.rotateX(Math.PI / 2);
    tampaTraseira.translate(0, 0, 0.003);

    return { haste, alvado, ponta, empena, amarracao, tampaTraseira };
}

export function criarDardo() {
    const dardo = new THREE.Group();
    dardo.name = "dardo";

    dardo.add(new THREE.Mesh(geometrias.haste, materiais.madeira));
    dardo.add(new THREE.Mesh(geometrias.alvado, materiais.ferroEscuro));
    dardo.add(new THREE.Mesh(geometrias.ponta, materiais.ferro));
    dardo.add(new THREE.Mesh(geometrias.tampaTraseira, materiais.linha));

    // 3 empenas a 120°; a primeira (empena-guia) é vermelha
    for (let i = 0; i < 3; i++) {
        const material = i === 0 ? materiais.empenaVermelha : materiais.empenaClara;
        const empena = new THREE.Mesh(geometrias.empena, material);
        empena.rotation.z = i * (2 * Math.PI / 3);
        dardo.add(empena);
    }

    // fio que amarra as empenas na haste (na frente e atrás delas)
    for (const z of [0.014, 0.1]) {
        const anel = new THREE.Mesh(geometrias.amarracao, materiais.linha);
        anel.position.z = z;
        dardo.add(anel);
    }

    return dardo;
}
