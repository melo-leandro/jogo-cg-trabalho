import * as THREE from 'three';
import { criarDardo, COMPRIMENTO_DARDO } from "../models/bolt.js";
import { ESCALA_ARMA } from "../models/gun.js";
import { firstColliderHit } from "./collision.js";

// ---- parâmetros do disparo ----
const VELOCIDADE_DARDO = 80; // unidades/s
const GRAVIDADE_DARDO = 6; // queda leve; a mira compensa
const ALCANCE_MAXIMO = 260;
const TEMPO_RECARGA = 1.1; // segundos entre um disparo e o próximo
const GIRO_DARDO = 14; // rad/s em torno do próprio eixo 
const TEMPO_CRAVADO = 12; // segundos que o dardo fica cravado na parede
const MAX_CRAVADOS = 30;
const DANO_DARDO = 1;

const comprimentoDardo = COMPRIMENTO_DARDO * ESCALA_ARMA;

let tempoDecorrido = 0;
let ultimoTiro = -Infinity;
let recuo = 0; // 1 logo após o disparo, decai até 0
let faseBalanco = 0; //balanço da arma ao andar.
let amplitudeBalanco = 0;
const posicaoAnteriorCamera = new THREE.Vector3();

const voando = []; //{dardo, velocidade, distancia, giro }
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
    recuo = 1;

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

    const velocidade = acertoMira && acertoMira.distance <= 4
        ? direcaoCamera.clone().multiplyScalar(VELOCIDADE_DARDO)
        : velocidadeParaAcertar(dardo.position, pontoMirado, Boolean(acertoMira));
    const direcao = velocidade.clone().normalize();

    orientar(dardo, direcao, 0);
    scene.add(dardo);

    const projetil = { dardo, velocidade, distancia: 0, giro: 0 };

    // se o jogador estiver colado numa parede, a ponta do dardo já nasce do outro lado dela
    pontaDoDardo(dardo, direcao, auxPonta);
    auxDirecao.subVectors(auxPonta, camera.position);
    const distanciaAtePonta = auxDirecao.length();
    const obstaculo = firstColliderHit(camera.position, auxDirecao.normalize(), distanciaAtePonta, colisores);
    if (obstaculo) {
        cravar(projetil, obstaculo, direcao);
    } else {
        voando.push(projetil);
    }

    return true;
}

export function atualizarProjeteis(delta, scene, colisores, alvos = []) {
    for (let i = voando.length - 1; i >= 0; i--) {
        const p = voando[i];

        p.velocidade.y -= GRAVIDADE_DARDO * delta;
        const passo = p.velocidade.length() * delta;
        auxDirecao.copy(p.velocidade).normalize();

        // o raio sai da ponta do dardo, na direção do movimento
        pontaDoDardo(p.dardo, auxDirecao, auxPonta);
        const acertoParede = firstColliderHit(auxPonta, auxDirecao, passo, colisores);
        const acertoAlvo = alvos.length > 0 ? acertoEmAlvos(auxPonta, auxDirecao, passo, alvos) : null;

        if (acertoAlvo && (!acertoParede || acertoAlvo.distance < acertoParede.distance)) {
            acertoAlvo.receptor.userData.aoSerAtingido(DANO_DARDO, acertoAlvo.point);
            p.dardo.removeFromParent();
            voando.splice(i, 1);
            continue;
        }

        if (acertoParede) {
            cravar(p, acertoParede, auxDirecao);
            voando.splice(i, 1);
            continue;
        }

        p.dardo.position.addScaledVector(auxDirecao, passo);
        p.distancia += passo;
        p.giro += GIRO_DARDO * delta;
        orientar(p.dardo, auxDirecao, p.giro);

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

export function atualizarBesta(delta, besta, camera) {
    tempoDecorrido += delta;
    const p = progressoRecarga();

    // solta carga logo apos o tiro, volta a ser armada no meio da recarga.
    besta.setTensaoCorda(THREE.MathUtils.smoothstep(p, 0.25, 0.7));

    // novo dardo: aparece acima do sulco e desce até encaixar na corda
    const encaixe = THREE.MathUtils.smoothstep(p, 0.72, 0.97);
    besta.dardoCarregado.visible = p >= 0.72;
    besta.dardoCarregado.position.copy(besta.posicaoDardo);
    besta.dardoCarregado.position.y += 0.05 * (1 - encaixe);
    besta.dardoCarregado.position.z += 0.07 * (1 - encaixe);

    //recuo amortecido
    recuo *= Math.exp(-9 * delta);

    // ao recarregar, a besta abaixa e inclina (o jogador puxa a corda)
    const armando = Math.sin(Math.PI * THREE.MathUtils.smoothstep(p, 0.12, 0.85));

    //balanço proporcional à velocidade horizontal do jogador
    const dx = camera.position.x - posicaoAnteriorCamera.x;
    const dz = camera.position.z - posicaoAnteriorCamera.z;
    const velocidade = delta > 0 ? Math.hypot(dx, dz) / delta : 0;
    posicaoAnteriorCamera.copy(camera.position);
    const alvoAmplitude = Math.min(velocidade / 15, 1.6);
    amplitudeBalanco += (alvoAmplitude - amplitudeBalanco) * Math.min(1, 8 * delta);
    faseBalanco += delta * (4 + velocidade * 0.35);

    const pivo = besta.arma;
    pivo.position.set(
        besta.posicaoBase.x + Math.cos(faseBalanco) * 0.025 * amplitudeBalanco,
        besta.posicaoBase.y - Math.abs(Math.sin(faseBalanco)) * 0.03 * amplitudeBalanco - 0.22 * armando,
        besta.posicaoBase.z + 0.2 * recuo
    );
    pivo.rotation.set(
        besta.rotacaoBase.x + 0.14 * recuo - 0.45 * armando,
        besta.rotacaoBase.y,
        besta.rotacaoBase.z + 0.25 * armando
    );

    return p;
}

// ---- auxiliares ----
function velocidadeParaAcertar(origem, alvo, compensarQueda) {
    const velocidade = alvo.clone().sub(origem).normalize().multiplyScalar(VELOCIDADE_DARDO);
    if (compensarQueda) {
        const tempoDeVoo = origem.distanceTo(alvo) / VELOCIDADE_DARDO;
        velocidade.y += GRAVIDADE_DARDO * tempoDeVoo / 2;
    }
    return velocidade;
}

function orientar(dardo, direcao, giro) {
    // o dardo foi modelado com a ponta em +Z; lookAt aponta +Z para o alvo
    auxAlvo.copy(dardo.position).add(direcao);
    dardo.lookAt(auxAlvo);
    dardo.rotateZ(giro);
}

function pontaDoDardo(dardo, direcao, destino) {
    return destino.copy(dardo.position).addScaledVector(direcao, comprimentoDardo);
}

function cravar(projetil, acerto, direcao) {
    const { dardo } = projetil;
    // a ponta e parte da haste entram na superfície
    const penetracao = comprimentoDardo * 0.22;
    dardo.position.copy(acerto.point).addScaledVector(direcao, penetracao - comprimentoDardo);
    orientar(dardo, direcao, projetil.giro);

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
