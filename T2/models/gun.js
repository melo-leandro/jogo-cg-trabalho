import * as THREE from 'three';
import { setDefaultMaterial } from "../libs/util/util.js";
import { criarDardo, RAIO_DARDO } from "./bolt.js";

export const ESCALA_ARMA = 2.5;

export const CAMADA_ARMA = 1;

const POSICAO_NA_TELA = new THREE.Vector3(0.72, -0.85, -2.4);
const ROTACAO_NA_TELA = new THREE.Euler(0.12, 0.1, -0.03);

// geometria do arco
const Z_ARCO = -0.3;
const Y_ARCO = -0.012;
const MEIA_ENVERGADURA = 0.34;
const Z_PONTAS_ARMADO = -0.205;
const FLEXAO_REPOUSO = 0.5;

// corda
const RAIO_CORDA = 0.0028;
const Y_CORDA = 0.006;
const Z_CORDA_ARMADA = -0.006;

const materiais = {
    madeira: setDefaultMaterial("#6e4527"),
    madeiraEscura: setDefaultMaterial("#4a2d18"),
    osso: setDefaultMaterial("#e4d8bc"),
    ferro: setDefaultMaterial("#555a61"),
    ferroEscuro: setDefaultMaterial("#2f3236"),
    arco: setDefaultMaterial("#3b2a20"),
    corda: setDefaultMaterial("#d9caa0"),
    amarracao: setDefaultMaterial("#7a6345")
};

export function criarArma(camera) {
    const pivo = new THREE.Group();// posição/rotação de repouso na tela + animações
    const modelo = new THREE.Group(); // a besta propriamente dita, em metros
    modelo.scale.setScalar(ESCALA_ARMA);
    pivo.add(modelo);

    modelo.add(criarCoronha());
    modelo.add(criarNozEPlacas());
    modelo.add(criarGatilho());
    const arco = criarArco();
    modelo.add(arco);
    modelo.add(criarEstribo());

    const corda = criarCorda();
    modelo.add(corda.grupo);

    function setTensaoCorda(t) {
        const flexao = THREE.MathUtils.lerp(FLEXAO_REPOUSO, 1, t);
        arco.scale.z = flexao;
        corda.atualizar(flexao, t);
    }
    setTensaoCorda(1);

    const dardoCarregado = criarDardo();
    const posicaoDardo = new THREE.Vector3(0, Y_CORDA + RAIO_DARDO * 0.6, Z_CORDA_ARMADA - RAIO_CORDA - 0.002);
    dardoCarregado.position.copy(posicaoDardo);
    dardoCarregado.rotation.y = Math.PI;
    modelo.add(dardoCarregado);

    pivo.position.copy(POSICAO_NA_TELA);
    pivo.rotation.copy(ROTACAO_NA_TELA);
    camera.add(pivo);

    pivo.traverse((objeto) => {
        objeto.layers.set(CAMADA_ARMA);
        if (objeto.isMesh) {
            objeto.receiveShadow = true;
            objeto.castShadow = false;
        }
    });

    return {
        arma: pivo,
        modelo,
        dardoCarregado,
        setTensaoCorda
    };
}

function criarCoronha() {
    const grupo = new THREE.Group();
    const largura = 0.05;

    const perfil = new THREE.Shape();
    perfil.moveTo(-0.37, 0);
    perfil.lineTo(0.12, 0);
    perfil.quadraticCurveTo(0.3, -0.006, 0.43, -0.03);
    perfil.lineTo(0.44, -0.075);
    perfil.lineTo(0.425, -0.128);
    perfil.quadraticCurveTo(0.3, -0.1, 0.16, -0.075);
    perfil.quadraticCurveTo(0.08, -0.058, 0.0, -0.056);
    perfil.lineTo(-0.37, -0.05);
    perfil.lineTo(-0.37, 0);

    const geometria = new THREE.ExtrudeGeometry(perfil, {
        depth: largura - 0.008,
        bevelEnabled: true,
        bevelThickness: 0.004,
        bevelSize: 0.004,
        bevelSegments: 2,
        curveSegments: 10
    });
    geometria.rotateY(-Math.PI / 2);
    geometria.translate((largura - 0.008) / 2, 0, 0);
    geometria.translate(0, -0.004, 0);
    grupo.add(new THREE.Mesh(geometria, materiais.madeira));

    const sulco = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.0015, 0.36), materiais.madeiraEscura);
    sulco.position.set(0, 0.0004, -0.19);
    grupo.add(sulco);

    for (const lado of [-1, 1]) {
        const placa = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.026, 0.22), materiais.osso);
        placa.position.set(lado * (largura / 2 + 0.001), -0.026, 0.19);
        placa.rotation.x = 0.07;
        grupo.add(placa);
    }

    const chapa = new THREE.Mesh(new THREE.BoxGeometry(largura + 0.006, 0.1, 0.008), materiais.ferroEscuro);
    chapa.position.set(0, -0.078, 0.437);
    chapa.rotation.x = -0.05;
    grupo.add(chapa);

    for (const z of [Z_ARCO - 0.04, Z_ARCO + 0.035]) {
        const abracadeira = new THREE.Mesh(new THREE.BoxGeometry(largura + 0.008, 0.06, 0.012), materiais.ferroEscuro);
        abracadeira.position.set(0, -0.026, z);
        grupo.add(abracadeira);
    }

    const ponteira = new THREE.Mesh(new THREE.BoxGeometry(largura + 0.004, 0.054, 0.012), materiais.ferro);
    ponteira.position.set(0, -0.026, -0.368);
    grupo.add(ponteira);

    return grupo;
}

function criarNozEPlacas() {
    const grupo = new THREE.Group();

    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.034, 16), materiais.osso);
    noz.rotation.z = Math.PI / 2;
    noz.position.set(0, -0.004, 0.006);
    grupo.add(noz);

    for (const lado of [-1, 1]) {
        const dente = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.016, 0.01), materiais.osso);
        dente.position.set(lado * 0.011, 0.012, 0.0);
        grupo.add(dente);
    }

    const geometriaRebite = new THREE.SphereGeometry(0.0035, 8, 6);
    for (const lado of [-1, 1]) {
        const placa = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.038, 0.075), materiais.ferro);
        placa.position.set(lado * 0.0265, -0.022, 0.006);
        grupo.add(placa);

        for (const z of [-0.025, 0.037]) {
            const rebite = new THREE.Mesh(geometriaRebite, materiais.ferroEscuro);
            rebite.position.set(lado * 0.028, -0.022, z);
            grupo.add(rebite);
        }
    }

    return grupo;
}

function criarGatilho() {
    const curva = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.05, 0.0),
        new THREE.Vector3(0, -0.075, 0.07),
        new THREE.Vector3(0, -0.108, 0.19),
        new THREE.Vector3(0, -0.132, 0.3)
    ]);
    const grupo = new THREE.Group();
    grupo.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 24, 0.0045, 8), materiais.ferroEscuro));

    const pinoGeometria = new THREE.CylinderGeometry(0.004, 0.004, 0.058, 8);
    pinoGeometria.rotateZ(Math.PI / 2);
    const pino = new THREE.Mesh(pinoGeometria, materiais.ferro);
    pino.position.set(0, -0.045, 0.012);
    grupo.add(pino);

    const ponta = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 8), materiais.ferroEscuro);
    ponta.position.copy(curva.points[curva.points.length - 1]);
    grupo.add(ponta);

    return grupo;
}

function curvaDoArco() {
    const pontos = [];
    const pontosPorLado = 6;
    for (let i = -pontosPorLado; i <= pontosPorLado; i++) {
        const u = i / pontosPorLado; 
        const x = u * MEIA_ENVERGADURA;
        const curvatura = Math.pow(Math.abs(u), 1.8);
        const z = (Z_PONTAS_ARMADO - Z_ARCO) * curvatura;
        pontos.push(new THREE.Vector3(x, Y_ARCO, z));
    }
    return new THREE.CatmullRomCurve3(pontos);
}

function criarArco() {
    const grupo = new THREE.Group();
    grupo.position.z = Z_ARCO;
    const curva = curvaDoArco();
    const segmentos = 64;
    const segmentosRadiais = 10;
    const raio = 0.0085;
    const geometria = new THREE.TubeGeometry(curva, segmentos, raio, segmentosRadiais);

    const posicoes = geometria.attributes.position;
    const centro = new THREE.Vector3();
    const vertice = new THREE.Vector3();
    for (let i = 0; i <= segmentos; i++) {
        const t = i / segmentos;
        curva.getPointAt(t, centro);
        const afinamento = 1 - 0.5 * Math.pow(Math.abs(2 * t - 1), 2);
        for (let j = 0; j <= segmentosRadiais; j++) {
            const indice = i * (segmentosRadiais + 1) + j;
            vertice.fromBufferAttribute(posicoes, indice).sub(centro);
            vertice.multiplyScalar(afinamento);
            vertice.y *= 2.1;
            vertice.add(centro);
            posicoes.setXYZ(indice, vertice.x, vertice.y, vertice.z);
        }
    }
    geometria.computeVertexNormals();
    grupo.add(new THREE.Mesh(geometria, materiais.arco));

    const geometriaVolta = new THREE.TorusGeometry(0.0215, 0.003, 6, 16);
    geometriaVolta.rotateY(Math.PI / 2);
    for (const lado of [-1, 1]) {
        for (let k = 0; k < 4; k++) {
            const volta = new THREE.Mesh(geometriaVolta, materiais.amarracao);
            const x = lado * (0.031 + k * 0.0055);
            volta.position.set(x, Y_ARCO, 0);
            grupo.add(volta);
        }
    }

    const geometriaPonteira = new THREE.CylinderGeometry(0.0075, 0.0075, 0.038, 10);
    for (const lado of [-1, 1]) {
        const ponteira = new THREE.Mesh(geometriaPonteira, materiais.ferro);
        ponteira.position.set(lado * MEIA_ENVERGADURA, Y_ARCO, Z_PONTAS_ARMADO - Z_ARCO);
        grupo.add(ponteira);
    }

    return grupo;
}

function criarEstribo() {
    const geometria = new THREE.TorusGeometry(0.06, 0.0045, 8, 24, Math.PI);
    geometria.rotateX(-Math.PI / 2);
    const estribo = new THREE.Mesh(geometria, materiais.ferroEscuro);
    estribo.position.set(0, -0.03, -0.372);
    estribo.rotation.x = 0.55; // inclina para baixo
    return estribo;
}

function criarCorda() {
    const grupo = new THREE.Group();
    const geometria = new THREE.CylinderGeometry(RAIO_CORDA, RAIO_CORDA, 1, 6);
    geometria.rotateX(Math.PI / 2);
    geometria.translate(0, 0, 0.5);

    const metades = [-1, 1].map((lado) => {
        const mesh = new THREE.Mesh(geometria, materiais.corda);
        grupo.add(mesh);
        return { lado, mesh };
    });

    const eixoZ = new THREE.Vector3(0, 0, 1);
    const centroArmado = new THREE.Vector3(0, Y_CORDA, Z_CORDA_ARMADA);
    const centro = new THREE.Vector3();
    const centroSolto = new THREE.Vector3();
    const ponta = new THREE.Vector3();
    const direcao = new THREE.Vector3();

    function atualizar(flexao, t) {
        const zPontas = Z_ARCO + (Z_PONTAS_ARMADO - Z_ARCO) * flexao;
        centroSolto.set(0, Y_ARCO, zPontas);
        centro.lerpVectors(centroSolto, centroArmado, t);

        for (const { lado, mesh } of metades) {
            ponta.set(lado * MEIA_ENVERGADURA, Y_ARCO, zPontas);
            direcao.subVectors(centro, ponta);
            mesh.position.copy(ponta);
            mesh.quaternion.setFromUnitVectors(eixoZ, direcao.clone().normalize());
            mesh.scale.set(1, 1, direcao.length());
        }
    }

    return { grupo, atualizar };
}
