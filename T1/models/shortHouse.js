import * as THREE from 'three';
import { setDefaultMaterial, degreesToRadians } from "../libs/util/util.js";
import { wall, floor, ramp, ZF } from "./tools.js";


const shortHouse = new THREE.Group();

// BASE
floor(154, 0.25 - ZF, -15, 36, 0.5, 26, degreesToRadians(0), "#ff6d00", shortHouse); // fundação
floor(154, 0.5, -15.5, 35, 1, 26, degreesToRadians(0), "#d500f9", shortHouse); // piso térreo

// TÉRREO
wall(154, 5.5, -28, 35, 11, 1, degreesToRadians(0), "#ff9100", shortHouse); // parede junto ao muro
wall(146.5, 5, -13, 20, 10, 1, degreesToRadians(0), "#ffea00", shortHouse); // parede ao lado da porta
wall(164, 5.5, -3, 15, 11, 1, degreesToRadians(0), "#76ff03", shortHouse); // parede da esquerda ao entrar
wall(137, 5, -20, 15, 10, 1, degreesToRadians(90), "#651fff", shortHouse); // parede menor da frente
wall(137, 5.5, -3, 1, 11, 1, degreesToRadians(0), "#ff3d00", shortHouse); // pilar
wall(171, 8.5, -15, 25, 17, 1, degreesToRadians(90), "#00e676", shortHouse); // parede grande do fundo

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

const doorFrame = new THREE.Mesh(doorFrameGeometry, setDefaultMaterial("#ff1744"));
doorFrame.position.set(156, 0, -7.5);
doorFrame.rotation.y = degreesToRadians(90);
shortHouse.add(doorFrame);

// ACESSO AO ANDAR SUPERIOR
ramp(166.5, 1, -7, 16, 10, 4, degreesToRadians(90), "#c6ff00", shortHouse); // rampa de acesso
wall(168.5, 5.5, -25.25, 4, 11, 4.5, degreesToRadians(0), "#00b0ff", shortHouse); // apoio

// ANDAR SUPERIOR
floor(151.5, 10.501, -15.5, 30, 1, 26, degreesToRadians(0), "#f500c7", shortHouse); // piso do andar superior/teto do térreo

// COBERTURA DA ESCADA
wall(168.5, 13.5, -3, 6, 7, 1, degreesToRadians(0), "#1de9b6", shortHouse); // parede pequena longe do topo da escada
wall(168.5, 13.5, -28, 6, 7, 1, degreesToRadians(0), "#00e5ff", shortHouse); // parede pequena perto do topo da escada
wall(166, 13.5, -12.75, 20.5, 7, 1, degreesToRadians(90), "#2979ff", shortHouse); // parede do lado de dentro
floor(168.5, 16.5, -15.5, 6, 1, 26, degreesToRadians(0), "#ff4081", shortHouse); // laje

// RAMPA DE ACESSO A PLATAFORMA SUPERIOR
ramp(153.76, 11, -24.5, 10.5, 7, 4, degreesToRadians(180), "#7c4dff", shortHouse);


shortHouse.scale.setScalar(2);

export { shortHouse };
