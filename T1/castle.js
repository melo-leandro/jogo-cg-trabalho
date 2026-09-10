import * as THREE from 'three';
import {setDefaultMaterial} from "./libs/util/util.js";

let castelo = new THREE.Group();
let material = setDefaultMaterial();

// TORRES

let towerGeometry = new THREE.CylinderGeometry(4.5, 4.5, 18);

let towerNW = new THREE.Mesh(towerGeometry, material);
towerNW.position.set(119.0, 9.0, -20.0);
castelo.add(towerNW);

let towerSW = new THREE.Mesh(towerGeometry, material);
towerSW.position.set(72.0, 9.0, -20.0);
castelo.add(towerSW);

let towerNE = new THREE.Mesh(towerGeometry, material);
towerNE.position.set(119.0, 9.0, 20.0);
castelo.add(towerNE);

let towerSE = new THREE.Mesh(towerGeometry, material);
towerSE.position.set(72.0, 9.0, 20.0);
castelo.add(towerSE);

// MURO

// -> FRENTE E TRÁS
let frontWallsGeometry = new THREE.BoxGeometry(2, 12, 32);

let southWall = new THREE.Mesh(frontWallsGeometry, material);
southWall.position.set(72, 6, 0)
castelo.add(southWall);


let northWall = new THREE.Mesh(frontWallsGeometry, material);
northWall.position.set(119, 6, 0)
castelo.add(northWall);

// -> LADOS
let sideWallsGeometry = new THREE.BoxGeometry(40, 12, 2);

let westWall = new THREE.Mesh(sideWallsGeometry, material);
westWall.position.set(95.5, 6, -20)
castelo.add(westWall);

let eastWall = new THREE.Mesh(sideWallsGeometry, material);
eastWall.position.set(95.5, 6, 20)
castelo.add(eastWall);

// TORRES FRONTAIS

let frontTowerRectangleGeometry = new THREE.BoxGeometry(3, 18, 8);
let frontTowerSquareGeometry = new THREE.BoxGeometry(5, 18, 5);

let eastFrontTowerRectangle = new THREE.Mesh(frontTowerRectangleGeometry, material);
eastFrontTowerRectangle.position.set(71.5, 9, 6)
castelo.add(eastFrontTowerRectangle);

let eastFrontTowerSquare = new THREE.Mesh(frontTowerSquareGeometry, material);
eastFrontTowerSquare.position.set(70.5, 9, 4.5)
castelo.add(eastFrontTowerSquare);

let westFrontTowerRectangle = new THREE.Mesh(frontTowerRectangleGeometry, material);
westFrontTowerRectangle.position.set(71.5, 9, -6)
castelo.add(westFrontTowerRectangle);

let westFrontTowerSquare = new THREE.Mesh(frontTowerSquareGeometry, material);
westFrontTowerSquare.position.set(70.5, 9, -4.5)
castelo.add(westFrontTowerSquare);

// TORRE DA ENTRADA

let entranceTowerGeometry = new THREE.BoxGeometry(8, 18, 5);
let entranceTower = new THREE.Mesh(entranceTowerGeometry, material);
entranceTower.position.set(75, 9, 0)
castelo.add(entranceTower);

// multiplica a escala de todo o castelo por . coloquei isso pq na altura normal
// o castelo ficava meio pequeno. tira esse comentário dps
castelo.scale.setScalar(2);

export { castelo };
