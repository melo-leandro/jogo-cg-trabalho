import * as THREE from 'three';
import { setDefaultMaterial, degreesToRadians } from "../libs/util/util.js";
import { wall, createFloor, createRamp, ZF } from "./tools.js";


let shortHouse = new THREE.Group();

// PAREDE COM ABERTURA DA PORTA
const doorFrameWidth = 10;
const doorFrameHeight = 10;
const doorOpeningWidth = 4;
const doorOpeningHeight = 5.5;
const doorFrameShape = new THREE.Shape();

doorFrameShape.moveTo(-doorFrameWidth / 2, 0);
doorFrameShape.lineTo(-doorFrameWidth / 2, doorFrameHeight);
doorFrameShape.lineTo(doorFrameWidth / 2, doorFrameHeight);
doorFrameShape.lineTo(doorFrameWidth / 2, 0);
doorFrameShape.lineTo(doorOpeningWidth / 2, 0);
doorFrameShape.lineTo(doorOpeningWidth / 2, doorOpeningHeight);
doorFrameShape.lineTo(-doorOpeningWidth / 2, doorOpeningHeight);
doorFrameShape.lineTo(-doorOpeningWidth / 2, 0);
doorFrameShape.closePath();

const doorFrameGeometry = new THREE.ExtrudeGeometry(doorFrameShape, {
  depth: 1,
  bevelEnabled: false
});
doorFrameGeometry.translate(0, 0, -0.5);

const doorFrame = new THREE.Mesh(
  doorFrameGeometry,
  setDefaultMaterial("beige")
);
doorFrame.position.set(156, 0, -7.5);
doorFrame.rotation.y = degreesToRadians(90);
shortHouse.add(doorFrame);

// PAREDES
wall(154, 5.5, -28, 35, 11, 1, degreesToRadians(0), "red", shortHouse); // parede encostada no muro
wall(146.5, 5, -13, 20, 10, 1, degreesToRadians(0), "blue", shortHouse); // 
wall(164, 5.5, -3, 15, 11, 1, degreesToRadians(0), "green", shortHouse);
wall(171, 8.5, -15, 25, 17, 1, degreesToRadians(90), "yellow", shortHouse);
wall(168.5, 13.5, -3, 6, 7, 1, degreesToRadians(0), "cadetblue", shortHouse);
wall(168.5, 13.5, -28, 6, 7, 1, degreesToRadians(0), "cadetblue", shortHouse);
wall(166, 13.5, -12.75, 20.5, 7, 1, degreesToRadians(90), "orchid", shortHouse);
wall(137, 5, -20, 15, 10, 1, degreesToRadians(90), "hotpink", shortHouse);

// PISOS
createFloor(154, 0.5, -15.5, 35, 1, 26, degreesToRadians(0), "gray", shortHouse);
createFloor(151.5, 10.501, -15.5, 30, 1, 26, degreesToRadians(0), "blue", shortHouse); // teto
createFloor(168.5, 16.5, -15.5, 6, 1, 26, degreesToRadians(0), "yellow", shortHouse); // teto da cobertura
createFloor(154, 0.25 - ZF, -15, 36, 0.5, 26, degreesToRadians(0), "gray", shortHouse);

// RAMPAS/APOIOS
createRamp(166.5, 1, -7, 16, 10, 4, degreesToRadians(90), "sienna", shortHouse);
wall(168.5, 5.5, -25.25, 4, 11, 4.5, degreesToRadians(0), "brown", shortHouse);
createRamp(153.76, 11, -24.5, 10.5, 7, 4, degreesToRadians(180), "sienna", shortHouse);


// PILAR
wall(137, 5.5, -3, 1, 11, 1, degreesToRadians(0), "brown", shortHouse);

shortHouse.scale.setScalar(2);

export { shortHouse };
