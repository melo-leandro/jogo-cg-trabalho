import * as THREE from 'three';
import { setDefaultMaterial } from "../libs/util/util.js";

export function criarArma(camera) {
  const material = setDefaultMaterial("brown");

  const geometria = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
  const arma = new THREE.Mesh(geometria, material);

  arma.rotation.x = Math.PI / 2;

  arma.position.set(0.3, -0.3, -0.9);

  camera.add(arma);

  return arma;
}