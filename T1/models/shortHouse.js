import * as THREE from 'three';
import { setDefaultMaterial, degreesToRadians } from "../libs/util/util.js";
import { wall, floor, ramp, ZF } from "./tools.js";
import { createDoubleDoor } from "./doors.js";


const shortHouse = new THREE.Group();

const wallMaterial = setDefaultMaterial("wheat");
const floorMaterial = setDefaultMaterial("slategray");
const roofMaterial = setDefaultMaterial("sienna");
const woodMaterial = setDefaultMaterial("saddlebrown");

// BASE
floor(154, 0.25 - ZF, -15, 36, 0.5, 26, degreesToRadians(0), shortHouse, floorMaterial); // fundação
floor(154, 0.5, -15.5, 35, 1, 26, degreesToRadians(0), shortHouse, floorMaterial); // piso térreo

// TÉRREO
wall(154, 5.5, -28, 35, 11, 1, degreesToRadians(0), shortHouse, wallMaterial); // parede junto ao muro
wall(146.5, 5, -13, 20, 10, 1, degreesToRadians(0), shortHouse, wallMaterial); // parede ao lado da porta
wall(164, 5.5, -3, 15, 11, 1, degreesToRadians(0), shortHouse, wallMaterial); // parede da esquerda ao entrar
wall(137, 5, -20, 15, 10, 1, degreesToRadians(90), shortHouse, wallMaterial); // parede menor da frente
wall(137, 5.5, -3, 1, 11, 1, degreesToRadians(0), shortHouse, woodMaterial); // pilar
wall(171, 8.5, -15, 25, 17, 1, degreesToRadians(90), shortHouse, wallMaterial); // parede grande do fundo

// PAREDE COM ABERTURA DA PORTA
const doorFrameShape = new THREE.Shape();
doorFrameShape.moveTo(-5, 0);
doorFrameShape.lineTo(-5, 10);
doorFrameShape.lineTo(5, 10);
doorFrameShape.lineTo(5, 0);
doorFrameShape.lineTo(2, 0);
doorFrameShape.lineTo(2, 5.5);
doorFrameShape.lineTo(-2, 5.5);
doorFrameShape.lineTo(-2, 0);
doorFrameShape.closePath();

const doorFrameGeometry = new THREE.ExtrudeGeometry(doorFrameShape, {
  depth: 1,
  bevelEnabled: false
});
doorFrameGeometry.translate(0, 0, -0.5);

const doorFrame = new THREE.Mesh(doorFrameGeometry, wallMaterial);
doorFrame.position.set(156, 0, -7.5);
doorFrame.rotation.y = degreesToRadians(90);
shortHouse.add(doorFrame);

const { group: shortHouseDoor, doors: shortHouseDoors } = createDoubleDoor(4, 5.5, -1);
shortHouseDoor.position.set(156, 0, -7.5);
shortHouse.add(shortHouseDoor);

// ACESSO AO ANDAR SUPERIOR
ramp(166.5, 1, -7, 16, 10, 4, degreesToRadians(90), "saddlebrown", shortHouse, woodMaterial); // rampa de acesso
floor(168.5, 5.5, -25.25, 4, 11, 4.5, degreesToRadians(0), shortHouse, woodMaterial); // apoio

// ANDAR SUPERIOR
floor(151.5, 10.501, -15.5, 30, 1, 26, degreesToRadians(0), shortHouse, floorMaterial); // piso do andar superior/teto do térreo

// COBERTURA DA ESCADA
const coverSmallWallGeometry = new THREE.BoxGeometry(6, 7, 1);
wall(168.5, 13.5, -3, null, null, null, degreesToRadians(0), shortHouse, wallMaterial, coverSmallWallGeometry); // parede pequena longe do topo da escada
wall(168.5, 13.5, -28, null, null, null, degreesToRadians(0), shortHouse, wallMaterial, coverSmallWallGeometry); // parede pequena perto do topo da escada
wall(166, 13.5, -12.75, 20.5, 7, 1, degreesToRadians(90), shortHouse, wallMaterial); // parede do lado de dentro
floor(168.5, 16.5, -15.5, 6, 1, 26, degreesToRadians(0), shortHouse, roofMaterial); // laje

// RAMPA DE ACESSO A PLATAFORMA SUPERIOR
ramp(153.76, 11, -24.5, 10.5, 7, 4, degreesToRadians(180), "saddlebrown", shortHouse, woodMaterial);


shortHouse.scale.setScalar(2);

export { shortHouse, shortHouseDoors };
