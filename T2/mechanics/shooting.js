import * as THREE from 'three';
import { criarDardo, COMPRIMENTO_DARDO } from "../models/bolt.js";
import { ESCALA_ARMA } from "../models/gun.js";
import { firstColliderHit } from "./collision.js";

// ---- parâmetros do disparo ----
const VELOCIDADE_DARDO = 80; // unidades/s
const ALCANCE_MAXIMO = 260;
const TEMPO_RECARGA = 1.1; // segundos entre um disparo e o próximo
const TEMPO_CRAVADO = 12; // segundos que o dardo fica cravado na parede
const MAX_CRAVADOS = 30;
const DANO_DARDO = 1;

const comprimentoDardo = COMPRIMENTO_DARDO * ESCALA_ARMA;

let tempoDecorrido = 0;
let ultimoTiro = -Infinity;

const voando = []; //{dardo, direcao, distancia }
const cravados = []; //{dardo, tempo }

const raycaster = new THREE.Raycaster();
const auxDirecao = new THREE.Vector3();
const auxPonta = new THREE.Vector3();
const auxAlvo = new THREE.Vector3();
const auxEscala = new THREE.Vector3();

export function progressoRecarga() {
    return THREE.MathUtils.clamp((tempoDecorrido - ultimoTiro) / TEMPO_RECARGA, 0, 1);
}

export function atirar(scene, camera, besta, colisores) {
    if (progressoRecarga() < 1) return false;
    ultimoTiro = tempoDecorrido;

    const dardo = criarDardo();
    dardo.scale.setScalar(ESCALA_ARMA);
    besta.dardoCarregado.getWorldPosition(dardo.position);
    dardo.traverse((objeto) => {
        if (!objeto.isMesh) return;
        objeto.castShadow = true;
        objeto.userData.ignoreCollision = true;
    });
    besta.dardoCarregado.visible = false;

    const direcaoCamera = camera.getWorldDirection(new THREE.Vector3());
    const pontoMirado = camera.position.clone().addScaledVector(direcaoCamera, ALCANCE_MAXIMO);
    const acertoMira = firstColliderHit(camera.position, direcaoCamera, ALCANCE_MAXIMO, colisores);
    if (acertoMira && acertoMira.distance > 4) pontoMirado.copy(acertoMira.point);

    // o dardo sai da besta (à direita) em linha reta até o ponto sob a mira
    const direcao = acertoMira && acertoMira.distance <= 4
        ? direcaoCamera
        : pontoMirado.clone().sub(dardo.position).normalize();

    orientar(dardo, direcao);
    scene.add(dardo);

    const projetil = { dardo, direcao, distancia: 0 };

    // se o jogador estiver colado numa parede, a ponta do dardo já nasce do outro lado dela
    pontaDoDardo(dardo, direcao, auxPonta);
    auxDirecao.subVectors(auxPonta, camera.position);
    const distanciaAtePonta = auxDirecao.length();
    const obstaculo = firstColliderHit(camera.position, auxDirecao.normalize(), distanciaAtePonta, colisores);
    if (obstaculo) {
        cravar(projetil, obstaculo);
    } else {
        voando.push(projetil);
    }

    return true;
}

export function atualizarProjeteis(delta, scene, colisores, alvos = []) {
    for (let i = voando.length - 1; i >= 0; i--) {
        const p = voando[i];

        const passo = VELOCIDADE_DARDO * delta;

        // o raio sai da ponta do dardo, na direção do movimento
        pontaDoDardo(p.dardo, p.direcao, auxPonta);
        const acertoParede = firstColliderHit(auxPonta, p.direcao, passo, colisores);
        const acertoAlvo = alvos.length > 0 ? acertoEmAlvos(auxPonta, p.direcao, passo, alvos) : null;

        if (acertoAlvo && (!acertoParede || acertoAlvo.distance < acertoParede.distance)) {
            acertoAlvo.receptor.userData.aoSerAtingido(DANO_DARDO, acertoAlvo.point);
            p.dardo.removeFromParent();
            voando.splice(i, 1);
            continue;
        }

        if (acertoParede) {
            cravar(p, acertoParede);
            voando.splice(i, 1);
            continue;
        }

        p.dardo.position.addScaledVector(p.direcao, passo);
        p.distancia += passo;

        if (p.distancia > ALCANCE_MAXIMO) {
            p.dardo.removeFromParent();
            voando.splice(i, 1);
        }
    }

    for (let i = cravados.length - 1; i >= 0; i--) {
        cravados[i].tempo += delta;
        if (cravados[i].tempo > TEMPO_CRAVADO) {
            cravados[i].dardo.removeFromParent();
            cravados.splice(i, 1);
        }
    }
}

export function atualizarBesta(delta, besta) {
    tempoDecorrido += delta;
    const p = progressoRecarga();

    // corda solta logo após o tiro, volta a ser armada durante a recarga
    besta.setTensaoCorda(THREE.MathUtils.smoothstep(p, 0.25, 0.7));

    // o novo dardo aparece quando a recarga termina
    besta.dardoCarregado.visible = p >= 1;

    return p;
}

// ---- auxiliares ----
function orientar(dardo, direcao) {
    // o dardo foi modelado com a ponta em +Z; lookAt aponta +Z para o alvo
    auxAlvo.copy(dardo.position).add(direcao);
    dardo.lookAt(auxAlvo);
}

function pontaDoDardo(dardo, direcao, destino) {
    return destino.copy(dardo.position).addScaledVector(direcao, comprimentoDardo);
}

function cravar(projetil, acerto) {
    const { dardo, direcao } = projetil;
    // a ponta e parte da haste entram na superfície
    const penetracao = comprimentoDardo * 0.22;
    dardo.position.copy(acerto.point).addScaledVector(direcao, penetracao - comprimentoDardo);
    orientar(dardo, direcao);

    // preso ao objeto atingido: se for uma porta, o dardo acompanha a porta
    acerto.object.getWorldScale(auxEscala);
    const escalaUniforme = Math.abs(auxEscala.x - auxEscala.y) < 1e-3 && Math.abs(auxEscala.y - auxEscala.z) < 1e-3;
    if (escalaUniforme) acerto.object.attach(dardo);

    cravados.push({ dardo, tempo: 0 });
    if (cravados.length > MAX_CRAVADOS) cravados.shift().dardo.removeFromParent();
}

function acertoEmAlvos(origem, direcao, distancia, alvos) {
    raycaster.set(origem, direcao);
    raycaster.far = distancia;
    for (const acerto of raycaster.intersectObjects(alvos, true)) {
        let objeto = acerto.object;
        while (objeto && !objeto.userData.aoSerAtingido) objeto = objeto.parent;
        if (objeto) return { ...acerto, receptor: objeto };
    }
    return null;
}
