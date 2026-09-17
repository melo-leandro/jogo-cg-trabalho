import * as THREE from 'three';
import { setDefaultMaterial } from "../libs/util/util.js";

export function criarArma(camera) {
    const armaGroup = new THREE.Group();

    const materialMetal = setDefaultMaterial("darkgrey");
    const materialCabo = setDefaultMaterial("saddlebrown");

    //cano
    const canoGeometria = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
    const cano = new THREE.Mesh(canoGeometria, materialMetal);
    cano.rotation.x = Math.PI / 2;
    armaGroup.add(cano);

    //mira
    const miraGeometria = new THREE.BoxGeometry(0.015, 0.03, 0.015);
    const mira = new THREE.Mesh(miraGeometria, materialMetal);
    mira.position.set(0, 0.05, -0.18);
    armaGroup.add(mira);

    //gatilho
    const gatilhoGeometria = new THREE.BoxGeometry(0.015, 0.05, 0.015);
    const gatilho = new THREE.Mesh(gatilhoGeometria, materialMetal);
    gatilho.position.set(0, -0.06, 0.15);
    armaGroup.add(gatilho);

    //guarda-mato (o circulo)
    const guardaMatoGeometria = new THREE.TorusGeometry(0.04, 0.008, 8, 16);
    const guardaMato = new THREE.Mesh(guardaMatoGeometria, materialMetal);
    guardaMato.position.set(0, -0.06, 0.05);
    armaGroup.add(guardaMato);

    //culatra
    const corpoGeometria = new THREE.BoxGeometry(0.09, 0.09, 0.2);
    const corpo = new THREE.Mesh(corpoGeometria, materialMetal);
    corpo.position.set(0, -0.02, 0.1);
    armaGroup.add(corpo);
    
    //cabo
    const caboGeometria = new THREE.BoxGeometry(0.07, 0.22, 0.08);
    const cabo = new THREE.Mesh(caboGeometria, materialCabo);
    cabo.position.set(0, -0.16, 0.15);
    cabo.rotation.x = Math.PI / 10;
    armaGroup.add(cabo);

    //boca do cano
    const bocaGeometria = new THREE.CylinderGeometry(0.045, 0.045, 0.1);
    const boca = new THREE.Mesh(bocaGeometria, materialMetal);
    boca.rotation.x = Math.PI / 2;
    boca.position.set(0, 0, -0.2);
    armaGroup.add(boca);

    armaGroup.position.set(0.3, -0.3, -1);
    camera.add(armaGroup);

    const ponta = new THREE.Object3D();
    ponta.position.set(0, 0, -0.25);
    armaGroup.add(ponta);

    return { arma: armaGroup, ponta };
}