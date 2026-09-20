import * as THREE from 'three';
import {setDefaultMaterial, degreesToRadians} from "../libs/util/util.js";
import { ZF, wall, floor, ramp } from "./tools.js";

let tallHouse = new THREE.Group();

const wallMaterial = setDefaultMaterial("beige");
const floorMaterial = setDefaultMaterial("gray");
const rampMaterial = setDefaultMaterial("sienna");
const supportMaterial = setDefaultMaterial("brown");

const sideWallGeometry = new THREE.BoxGeometry(1, 18, 20);
const frontWallGeometry = new THREE.BoxGeometry(1, 18, 6);
const insideRampGeometry = new THREE.BoxGeometry(2.5, 4.5, 2.5);
const thinWallGeometry = new THREE.BoxGeometry(0.2, 4.5, 5.09);

// -> PAREDES

// PAREDES LATERAIS
wall(162.297, 9, 25, null, null, null, degreesToRadians(76), tallHouse, wallMaterial, sideWallGeometry); // LADO DIREITO
wall(166.037, 9, 10, null, null, null, degreesToRadians(76), tallHouse, wallMaterial, sideWallGeometry);

// PAREDE DE TRÁS
wall(173.335, 9, 20, 1, 18, 15, degreesToRadians(166), tallHouse, wallMaterial);

// PAREDE DA FRENTE
// direita
wall(153.91, 9, 19.37, null, null, null, degreesToRadians(166), tallHouse, wallMaterial, frontWallGeometry);

// esquerda
wall(156.09, 9, 10.63, null, null, null, degreesToRadians(166), tallHouse, wallMaterial, frontWallGeometry);

// parede em cima da porta + parede em cima da janela
wall(155, 7.5, 15, 1, 7, 4, degreesToRadians(166), tallHouse, wallMaterial);
wall(155, 16, 15, 1, 4, 4, degreesToRadians(166), tallHouse, wallMaterial);

// PISOS + TELHADO

floor(164.17, 0.25, 17.5, 20, 0.5, 16, degreesToRadians(166), tallHouse, floorMaterial); // chao
floor(162.25, 8.75, 17.01, 17, 0.5, 17, degreesToRadians(166), tallHouse, floorMaterial); // primeiro andar
floor(164.17, 18.25, 17.5, 21, 0.5, 17, degreesToRadians(166), tallHouse, floorMaterial); // telhado

// RAMPAS/ESCADAS

ramp(161.528, 0.5, 21.95, 8, 4.249, 2.5, degreesToRadians(346), "sienna", tallHouse, rampMaterial); // primeira rampa
wall(170.2, 2.5, 25.4, null, null, null, degreesToRadians(76), tallHouse, supportMaterial, insideRampGeometry); // bloco entre as rampas
ramp(169.28, 4.75, 23.91, 9.71, 4.25, 2.5, degreesToRadians(76), "sienna", tallHouse, rampMaterial); // segunda rampa
wall(173.14, 6.75, 13.58, null, null, null, degreesToRadians(166), tallHouse, supportMaterial, insideRampGeometry); // bloco no fim da escada

wall(170.01, 2.5, 21.44, null, null, null, degreesToRadians(166), tallHouse, supportMaterial, thinWallGeometry); // parede fina da direita
wall(171.72, 2.5, 14.55, null, null, null, degreesToRadians(166), tallHouse, supportMaterial, thinWallGeometry); // parede fina da esquerda

ramp(152.94, 0, 12.94, 2, 0.5, 3, degreesToRadians(346), "sienna", tallHouse, rampMaterial); // rampa da porta

tallHouse.scale.setScalar(2);

export { tallHouse };


// https://www.youtube.com/watch?v=dQw4w9WgXcQ
let coolGeometry = new THREE.TorusKnotGeometry(0.5, 0.1, 128, 8, 2, 5);
let coolMaterial = setDefaultMaterial("cyan");
let easterEgg = new THREE.Mesh(coolGeometry, coolMaterial);
easterEgg.position.set(173.2, 2, 13.5);
tallHouse.add(easterEgg);
