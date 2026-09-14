import * as THREE from 'three';
import {setDefaultMaterial} from "./libs/util/util.js";

let castelo = new THREE.Group();
let material = setDefaultMaterial('#82796A');

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

//COROAS DAS TORRES CILINDRICAS
let crownGeometry = new THREE.CylinderGeometry(5, 5, 1.8, 32, 1, true);

function createCrown(x, z) {
    let crown = new THREE.Mesh(crownGeometry, material);
    crown.position.set(x, 18.5, z);
    castelo.add(crown);
}

createCrown(119.0, -20.0); // NW
createCrown(119.0, 20.0);  // NE
createCrown(72.0, -20.0);  // SW
createCrown(72.0, 20.0);   // SE

// MURO

// -> FRENTE E TRÁS
let frontWallsGeometry = new THREE.BoxGeometry(2, 12, 32);

let southWall = new THREE.Mesh(frontWallsGeometry, material);
southWall.position.set(72, 6, 0)
castelo.add(southWall);


let northWall = new THREE.Mesh(frontWallsGeometry, material);
northWall.position.set(119, 6, 0)
castelo.add(northWall);

// -> LADO DIREITO
let eastWallsGeometry = new THREE.BoxGeometry(40, 12, 2);

let eastWall = new THREE.Mesh(eastWallsGeometry, material);
eastWall.position.set(95.5, 6, 20)
castelo.add(eastWall);

// -> LADO ESQUERDO (considerando curva em L) 
let westWalls = new THREE.Group();
let firstWestWallGeometry = new THREE.BoxGeometry(4, 12, 2);
let firstwestWall = new THREE.Mesh(firstWestWallGeometry, material);
firstwestWall.position.set(78, 6, -20)
westWalls.add(firstwestWall);

let secondWestWallGeometry = new THREE.BoxGeometry(4, 12, 2);
let secondWestWall = new THREE.Mesh(secondWestWallGeometry, material);
secondWestWall.position.set(81, 6, -21);
secondWestWall.rotation.y = Math.PI/2;
westWalls.add(secondWestWall);

let thirdWestWallGeometry = new THREE.BoxGeometry(10, 12, 2);
let thirdWestWall = new THREE.Mesh(thirdWestWallGeometry, material);
thirdWestWall.position.set(86, 6, -22);
westWalls.add(thirdWestWall);

let fourthWestWallGeometry = new THREE.BoxGeometry(24, 12, 2);
let fourthWestWall = new THREE.Mesh(fourthWestWallGeometry, material);
fourthWestWall.position.set(104, 6, -20);
westWalls.add(fourthWestWall);

castelo.add(westWalls);

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

let entranceTowerGeometry = new THREE.BoxGeometry(7, 18, 5);
let entranceTower = new THREE.Mesh(entranceTowerGeometry, material);
entranceTower.position.set(73, 9, 0)
castelo.add(entranceTower);

//TORRE LATERAIS E TRASEIRA
let middleTowersGeometry = new THREE.BoxGeometry(8, 18, 5);

function createMiddleTower(x, z, rotation = 0) {
    let middleTower = new THREE.Mesh(middleTowersGeometry, material);
    middleTower.position.set(x, 9, z);
    rotation = THREE.MathUtils.degToRad(rotation);
    middleTower.rotation.y = rotation;
    castelo.add(middleTower);
}

createMiddleTower(95, -21.5); // Oeste
createMiddleTower(95, 21.5); // Leste
createMiddleTower(120.5, 0, 90); // Traseira


let middleTowerBack = new THREE.Mesh(middleTowersGeometry, material);
middleTowerBack.position.set(120.5, 9, 0);
middleTowerBack.rotation.y = Math.PI/2;
castelo.add(middleTowerBack);

// TORRES PEQUENAS ADJACENTES
let smallTowersGeometry = new THREE.CylinderGeometry(1, 1, 20);

function createSmallTower(x, z) {
    let smallTower = new THREE.Mesh(smallTowersGeometry, material);
    smallTower.position.set(x, 10, z);
    castelo.add(smallTower);
}

createSmallTower(99, -20); // TorreCentralOeste
createSmallTower(99, 20);  // TorreCentralLeste
createSmallTower(77, -20); // TorreCilindricaSO
createSmallTower(72, 15.5); // TorreCilindricaSE
createSmallTower(75.5, -2.5);// TorreFrontal
createSmallTower(119, -16); // TorreCilindricaNO
createSmallTower(119, 15); // TorreCilindricaNE
createSmallTower(119, 4); // TorreTraseira

//COROAS DAS TORRES PEQUENAS ADJACENTES
let smallCrownGeometry = new THREE.CylinderGeometry(1.2, 1.2, 1, 32, 1, true);

function createSmallCrown(x, z) {
    let smallCrown = new THREE.Mesh(smallCrownGeometry, material);
    smallCrown.position.set(x, 20.2, z);
    castelo.add(smallCrown);
}

createSmallCrown(99, -20); // 1
createSmallCrown(99, 20);  // 2
createSmallCrown(77, -20); // 3
createSmallCrown(72, 15.5); // 4
createSmallCrown(75.5, -2.5); // 5
createSmallCrown(119, -16); // 6
createSmallCrown(119, 15); // 7
createSmallCrown(119, 4); // 8

castelo.scale.setScalar(2);

export { castelo };
