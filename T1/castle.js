import * as THREE from 'three';
import {setDefaultMaterial} from "./libs/util/util.js";

let castelo = new THREE.Group();
let material = setDefaultMaterial('#796D62');

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
let crownNW = new THREE.Mesh(crownGeometry, material);
crownNW.position.set(119.0, 18.5, -20.0);
castelo.add(crownNW);

let crownSW = new THREE.Mesh(crownGeometry, material);
crownSW.position.set(72.0, 18.5, -20.0);
castelo.add(crownSW);

let crownNE = new THREE.Mesh(crownGeometry, material);
crownNE.position.set(119.0, 18.5, 20.0);
castelo.add(crownNE);

let crownSE = new THREE.Mesh(crownGeometry, material);
crownSE.position.set(72.0, 18.5, 20.0);
castelo.add(crownSE);

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
let middleTowerLeft = new THREE.Mesh(middleTowersGeometry, material);
middleTowerLeft.position.set(95, 9, -21.5);
castelo.add(middleTowerLeft);

let middleTowerRight = new THREE.Mesh(middleTowersGeometry, material);
middleTowerRight.position.set(95, 9, 21.5);
castelo.add(middleTowerRight);

let middleTowerBack = new THREE.Mesh(middleTowersGeometry, material);
middleTowerBack.position.set(120.5, 9, 0);
middleTowerBack.rotation.y = Math.PI/2;
castelo.add(middleTowerBack);

//COROAS DAS TORRES LATERAIS E TRASEIRA


// TORRES PEQUENAS ADJACENTES
let smallTowersGeometry = new THREE.CylinderGeometry(1, 1, 20);

//-> TorreCentralOeste
let smallTower1 = new THREE.Mesh(smallTowersGeometry, material);
smallTower1.position.set(99, 10, -20);
castelo.add(smallTower1);

//-> TorreCentralLeste
let smallTower2 = new THREE.Mesh(smallTowersGeometry, material);
smallTower2.position.set(99, 10, 20);
castelo.add(smallTower2);

//-> TorreCilindricaSO
let smallTower3 = new THREE.Mesh(smallTowersGeometry, material);
smallTower3.position.set(77, 10, -20);
castelo.add(smallTower3);

//-> TorreCilindricaSE
let smallTower4 = new THREE.Mesh(smallTowersGeometry, material);
smallTower4.position.set(72, 10, 15.5);     
castelo.add(smallTower4);

//-> TorreFrontal
let smallTower5 = new THREE.Mesh(smallTowersGeometry, material);
smallTower5.position.set(75.5, 10, -2.5);
castelo.add(smallTower5);

//-> TorreCilindricaNO
let smallTower6 = new THREE.Mesh(smallTowersGeometry, material);
smallTower6.position.set(119, 10, -16);
castelo.add(smallTower6);

//-> TorreCilindricaNE
let smallTower7 = new THREE.Mesh(smallTowersGeometry, material);
smallTower7.position.set(119, 10, 15);
castelo.add(smallTower7);

//-> TorreTraseira
let smallTower8 = new THREE.Mesh(smallTowersGeometry, material);
smallTower8.position.set(119, 10, 4);
castelo.add(smallTower8);

//COROAS DAS TORRES PEQUENAS ADJACENTES
let smallCrownGeometry = new THREE.CylinderGeometry(1.2, 1.2, 1, 32, 1, true);
let smallCrown1 = new THREE.Mesh(smallCrownGeometry, material);
smallCrown1.position.set(99, 20.5, -20);
castelo.add(smallCrown1);

let smallCrown2 = new THREE.Mesh(smallCrownGeometry, material);
smallCrown2.position.set(99, 20.5, 20);
castelo.add(smallCrown2);

let smallCrown3 = new THREE.Mesh(smallCrownGeometry, material);
smallCrown3.position.set(77, 20.5, -20);
castelo.add(smallCrown3);

let smallCrown4 = new THREE.Mesh(smallCrownGeometry, material);
smallCrown4.position.set(72, 20.5, 15.5);
castelo.add(smallCrown4);

let smallCrown5 = new THREE.Mesh(smallCrownGeometry, material);
smallCrown5.position.set(75.5, 20.5, -2.5);
castelo.add(smallCrown5);

let smallCrown6 = new THREE.Mesh(smallCrownGeometry, material);
smallCrown6.position.set(119, 20.5, -16);
castelo.add(smallCrown6);

let smallCrown7 = new THREE.Mesh(smallCrownGeometry, material);
smallCrown7.position.set(119, 20.5, 15);
castelo.add(smallCrown7);

let smallCrown8 = new THREE.Mesh(smallCrownGeometry, material);
smallCrown8.position.set(119, 20.5, 4);
castelo.add(smallCrown8);

castelo.scale.setScalar(2);

export { castelo };
