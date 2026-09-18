import * as THREE from 'three';
import {setDefaultMaterial, degreesToRadians} from "../libs/util/util.js";

let smallHouse = new THREE.Group();
let material = setDefaultMaterial("gray");


// -> PAREDES
function wall(x, y, z, width, height, depth, rotationY, color) {
    let wallGeometry = new THREE.BoxGeometry(width, height, depth);
    let material = setDefaultMaterial(color);
    let wallMesh = new THREE.Mesh(wallGeometry, material);
    wallMesh.position.set(x, y, z);
    wallMesh.rotation.y = rotationY;
    smallHouse.add(wallMesh);
}

// PAREDES LATERAIS
wall(162.297, 9, 25, 1, 18, 20, degreesToRadians(76), "beige"); // LADO DIREITO
wall(166.037, 9, 10, 1, 18, 20, degreesToRadians(76), "beige");

// PAREDE DE TRÁS
wall(173.335, 9, 20, 1, 18, 15, degreesToRadians(166), "beige");

// PAREDE DA FRENTE
// direita
wall(153.91, 9, 19.37, 1, 18, 6, degreesToRadians(166), "beige");

// esquerda
wall(156.09, 9, 10.63, 1, 18, 6, degreesToRadians(166), "beige");

// parede em cima da porta + parede em cima da janela
wall(155, 7.5, 15, 1, 7, 4, degreesToRadians(166), "beige");
wall(155, 16, 15, 1, 4, 4, degreesToRadians(166), "beige");

// PISOS + TELHADO

function createFloor(x, y, z, width, height, depth) {
    let floorGeometry = new THREE.BoxGeometry(width, height, depth);
    let floor = new THREE.Mesh(floorGeometry, material);
    floor.position.set(x, y, z);
    floor.rotation.y = degreesToRadians(166);
    smallHouse.add(floor);
}

createFloor(164.17, 0.25, 17.5, 20, 0.5, 16); // chao
createFloor(162.25, 8.75, 17.01, 17, 0.5, 17); // primeiro andar
createFloor(164.17, 18.25, 17.5, 21, 0.5, 17); // telhado


// RAMPAS/ESCADAS

function createRamp(x, y, z, length, height, width, rotationY, color) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(length, 0);
  shape.lineTo(length, height);
  shape.closePath();

  const rampGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: false
  });

  let material = setDefaultMaterial(color);
  let ramp = new THREE.Mesh(rampGeometry, material);
  ramp.userData.walkable = true;

  ramp.position.set(x, y, z);
  ramp.rotation.y = rotationY;

  smallHouse.add(ramp);
  return ramp;
}

createRamp(161.528, 0.5, 21.95, 8, 4.249, 2.5, degreesToRadians(346), "sienna"); // primeira rampa
wall(170.2, 2.5, 25.4, 2.5, 4.5, 2.5, degreesToRadians(76), "brown"); // bloco entre as rampas
createRamp(169.28, 4.75, 23.91, 9.71, 4.25, 2.5, degreesToRadians(76), "sienna"); // segunda rampa
wall(173.14, 6.75, 13.58, 2.5, 4.5, 2.5, degreesToRadians(166), "brown"); // bloco no fim da escada

wall(170.01, 2.5, 21.44, 0.2, 4.5, 5.09, degreesToRadians(166), "brown"); // parede fina da direita
wall(171.72, 2.5, 14.55, 0.2, 4.5, 5.09, degreesToRadians(166), "brown"); // parede fina da esquerda


createRamp(152.94, 0, 12.94, 2, 0.5, 3, degreesToRadians(346), "sienna"); // rampa da porta

smallHouse.scale.setScalar(2);
export { smallHouse };


// https://www.youtube.com/watch?v=dQw4w9WgXcQ
let coolGeometry = new THREE.TorusKnotGeometry(0.5, 0.1, 128, 8, 2, 5);
let coolMaterial = setDefaultMaterial("cyan");
let easterEgg = new THREE.Mesh(coolGeometry, coolMaterial);
easterEgg.position.set(173.2, 2, 13.5);
smallHouse.add(easterEgg);
