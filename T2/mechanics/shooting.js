import * as THREE from 'three';
import { setDefaultMaterial } from "../libs/util/util.js";
import { rayIntersectsColliders } from "./collision.js";

const VEL_PROJETIL = 100;
const DIST_MAX = 100;
const CAD_MAX = 0.25;

let projeteis = [];
let ultimoTiro = -Infinity;
let tempoDecorrido = 0;

const materialProjetil = setDefaultMaterial("red");
const geometriaProjetil = new THREE.SphereGeometry (0.08);

export function atirar(scene, camera, ponta){
    if (tempoDecorrido - ultimoTiro < CAD_MAX) return;
    ultimoTiro = tempoDecorrido;

    let direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    let armaPosition = new THREE.Vector3();
    ponta.getWorldPosition(armaPosition);

    const bala = new THREE.Mesh(geometriaProjetil, materialProjetil);
    bala.position.copy(armaPosition);
    scene.add(bala);

    projeteis.push({ mesh: bala, direcao: direction, distanciaPercorrida: 0 });
}

export function atualizarProjeteis(delta, scene, wallCollisions) {
    tempoDecorrido += delta;

    for (let i = projeteis.length - 1; i >= 0; i--) {
        const p = projeteis[i];

        const passo = VEL_PROJETIL * delta;

        const bateuNaParede = rayIntersectsColliders(
            p.mesh.position,
            p.direcao,
            passo,
            wallCollisions
        );
        p.mesh.position.addScaledVector(p.direcao, passo);
        p.distanciaPercorrida += passo;
        const passouDistancia = p.distanciaPercorrida > DIST_MAX;

        if (bateuNaParede || passouDistancia) {
            scene.remove(p.mesh);
            projeteis.splice(i, 1);
        }
    }
}

