import * as THREE from 'three';
import {degreesToRadians, setDefaultMaterial} from "../libs/util/util.js";
import { floor, ramp, wall, ZF } from "./tools.js";
import { frontDoor } from "./doors.js";

let castelo = new THREE.Group();
let material = setDefaultMaterial("slategray");
material.side = THREE.DoubleSide;

// TORRES

let towerGeometry = new THREE.CylinderGeometry(4.5, 4.5, 18);

function cylinderTower(x, z) {
    let tower = new THREE.Mesh(towerGeometry, material);
    tower.position.set(x, 9, z);
    castelo.add(tower);
}

cylinderTower(119.0, -20.0); // noroeste
cylinderTower(72.0, -20.0); // sudoeste
cylinderTower(119.0, 20.0); // nordeste
cylinderTower(72.0, 20.0); // sudeste

//COROAS DAS TORRES CILINDRICAS

let crownBaseGeometry = new THREE.CircleGeometry(5, 256);

function crown(x, z) {
    let crownBase = new THREE.Mesh(crownBaseGeometry, material);

    crownBase.position.set(x, 18 + ZF, z);
    crownBase.rotation.x = degreesToRadians(-90);
    castelo.add(crownBase);

    //secciona o topo da
    for(let thetaStart = 0; thetaStart < Math.PI * 2; thetaStart += Math.PI / 4) {
        // aqui o último número diminui a circunferencia do cilindro (theta)
        let crownGeometry = new THREE.CylinderGeometry(5, 5, 1.8, 32, 1, true, thetaStart, 0.5);
        let crown = new THREE.Mesh(crownGeometry, material);
        crown.position.set(x, 18.9, z);
        castelo.add(crown);
    }
}

crown(119.0, -20.0); // NW
crown(119.0, 20.0);  // NE
crown(72.0, -20.0);  // SW
crown(72.0, 20.0);   // SE

// MURO

// -> FRENTE E TRÁS
let frontWallsGeometry = new THREE.BoxGeometry(2, 12, 16);

function frontWall(x, z) {
    let frontWall = new THREE.Mesh(frontWallsGeometry, material);
    frontWall.position.set(x, 6, z);
    castelo.add(frontWall);
}

frontWall(72, 10);
frontWall(72, -10);

let northWallGeometry = new THREE.BoxGeometry(2, 12, 40);
let northWall = new THREE.Mesh(northWallGeometry, material);
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

// -> PASSARELA

const frontPlatformGeometry = new THREE.BoxGeometry(2 + 2 * ZF, 0.5, 12 + 2 * ZF);
const entrancePlatformGeometry = new THREE.BoxGeometry(6.5 + 2 * ZF, 0.5, 2.5 + 2 * ZF);
const pillarGeometry = new THREE.BoxGeometry(1, 12, 1);
const elevatedPillarGeometry = new THREE.BoxGeometry(1, 13, 1);

// em cima da rampa de acesso (formato em U)
floor(104, 11.75, -53 / 3, 8 / 3, 0.5, 8 / 3, 0, castelo, material);
floor(1205 / 12, 11.75, -46 / 3, 59 / 6, 0.5, 2, 0, castelo, material);
floor(94.5, 11.75, -50 / 3, 2, 0.5, 14 / 3, 0, castelo, material);

// encostando na parede afundada
floor(86.5, 11.75, -20, 9, 0.5, 2, 0, castelo, material);
floor(92.25, 11.75, -18, 6.5, 0.5, 2, 0, castelo, material);
floor(80, 11.75, -18, 8, 0.5, 2, 0, castelo, material);

// frente do castelo, contornando a torre da entrada
floor(74, 11.75, 10, null, null, null, 0, castelo, material, frontPlatformGeometry);
floor(78.25, 11.75, 5.25, null, null, null, 0, castelo, material, entrancePlatformGeometry);
floor(80.25, 11.75, -1, 2.5, 0.5, 11, 0, castelo, material);
floor(78.25, 11.75, -5.25, null, null, null, 0, castelo, material, entrancePlatformGeometry);
floor(74, 11.75, -10, null, null, null, 0, castelo, material, frontPlatformGeometry);

// direita do castelo, considerando a entrada
floor(107.5, 12.75, 18, 15, 0.5, 2, 0, castelo, material);
floor(86.58, 11.75, 18, 21.16, 0.5, 2, 0, castelo, material);

// fundo do castelo + conexão com o início da passarela
floor(117, 11.75, -7.92, 2, 0.5, 16.16, 0, castelo, material);
floor(117, 12.75, 9.5, 2, 0.5, 13, 0, castelo, material);
floor(661 / 6, 11.75, -18, 29 / 3, 0.5, 2, 0, castelo, material);

const inclinedPlatformLength = 3.15;
const inclinedPlatformWidth = 2;
const inclinedPlatformGeometry = new THREE.BoxGeometry(
    inclinedPlatformLength + 2 * ZF,
    0.5,
    inclinedPlatformWidth + 2 * ZF
);

function inclinedPlatform(x, y, z, angleZ, rotationY) {
    const platform = floor(
        0, 0, 0, null, null, null, 0,
        castelo, material, inclinedPlatformGeometry
    );

    platform.position.set(x, y, z);
    platform.rotation.set(0, rotationY, angleZ);

    platform.translateX(inclinedPlatformLength / 2);
    platform.translateY(-0.25);

    platform.userData.walkable = true;
}

// passarelas inclinadas
inclinedPlatform(117, 11.99, 0, degreesToRadians(18.85), degreesToRadians(-90));
inclinedPlatform(97, 11.99, 18, degreesToRadians(18.85), 0);

// PILARES DA PASSARELA
wall(86.5, 6, -20, null, null, null, 0, castelo, material, pillarGeometry);
// frente do castelo, esquerda e direita (pov do fundo do castelo pra frente)
wall(74, 6, 10, null, null, null, 0, castelo, material, pillarGeometry);
wall(74, 6, -10, null, null, null, 0, castelo, material, pillarGeometry);
// atras da casa alta
wall(107.5, 6.5, 18, null, null, null, 0, castelo, material, elevatedPillarGeometry);
// direita do castelo
wall(86.58, 6, 18, null, null, null, 0, castelo, material, pillarGeometry);
// fundo do castelo, esquerda e direita
wall(117, 6, -7.92, null, null, null, 0, castelo, material, pillarGeometry);
wall(117, 6.5, 4.5, null, null, null, 0, castelo, material, elevatedPillarGeometry);

function curvedPlatform(centerX, centerZ, startAngle, endAngle, height = 12) {
    const innerRadius = 4.4;
    const outerRadius = 7.5;
    const segments = 12;
    const shape = new THREE.Shape();
    const pointAt = (radius, angle) => [
        centerX + Math.cos(angle) * radius,
        centerZ + Math.sin(angle) * radius
    ];
    const outerStart = pointAt(outerRadius, startAngle);
    shape.moveTo(outerStart[0], outerStart[1]);

    for (let step = 1; step <= segments; step++) {
        const angle = THREE.MathUtils.lerp(startAngle, endAngle, step / segments);
        const [x, z] = pointAt(outerRadius, angle);
        shape.lineTo(x, z);
    }
    for (let step = segments; step >= 0; step--) {
        const angle = THREE.MathUtils.lerp(startAngle, endAngle, step / segments);
        const [x, z] = pointAt(innerRadius, angle);
        shape.lineTo(x, z);
    }
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: .5,
        bevelEnabled: false
    });
    geometry.rotateX(Math.PI / 2);

    const platform = new THREE.Mesh(geometry, material);
    platform.position.y = height + ZF;
    platform.userData.walkable = true;
    platform.userData.curvedPlatform = true;
    castelo.add(platform);
}

// PASSARELA DE CANTO (TORRES CILINDRICAS)
curvedPlatform(119, -20, degreesToRadians(102), degreesToRadians(168));
curvedPlatform(119, 20, degreesToRadians(192), degreesToRadians(258), 13);
curvedPlatform(72, 20, degreesToRadians(282), degreesToRadians(348));
curvedPlatform(72, -20, degreesToRadians(12), degreesToRadians(78));

// sobe do teto da casa ate a passarela elevada do castelo
ramp(110, 37 / 3, 15, 2, 2 / 3, 2, degreesToRadians(-90), "slategray", castelo, material);

castelo.add(westWalls);

// TORRES FRONTAIS

let frontTowerRectangleGeometry = new THREE.BoxGeometry(3, 18, 8);
let frontTowerSquareGeometry = new THREE.BoxGeometry(5, 18, 4);

function createFrontTower(x, z) {
    let frontTowerRectangle = new THREE.Mesh(frontTowerRectangleGeometry, material);
    frontTowerRectangle.position.set(x, 9, z)
    castelo.add(frontTowerRectangle);
}

function createFrontTowerSquare(x, z) {
    let frontTowerSquare = new THREE.Mesh(frontTowerSquareGeometry, material);
    frontTowerSquare.position.set(x, 9, z)
    castelo.add(frontTowerSquare);
}

createFrontTower(71.5, 6);
createFrontTower(71.5, -6);
createFrontTowerSquare(70.5, 4.5);
createFrontTowerSquare(70.5, -4.5);

// TORRE DA ENTRADA + PAREDES

let entranceTowerGeometry = new THREE.BoxGeometry(8, 13, 5);
let entranceTower = new THREE.Mesh(entranceTowerGeometry, material);
entranceTower.position.set(75, 11.5, 0)
castelo.add(entranceTower);

let entranceWallGeometry = new THREE.BoxGeometry(8, 18, 2);

function createEntranceWall(x, z) {
    let entranceWall = new THREE.Mesh(entranceWallGeometry, material);
    entranceWall.position.set(x, 9, z)
    castelo.add(entranceWall);
}

createEntranceWall(75, 3);
createEntranceWall(75, -3);

// ARCO DA ENTRADA
const entranceDoorFrame = new THREE.Group();
const doorFrameColumnGeometry = new THREE.BoxGeometry(0.6, 3.2, 1.1);
wall(0, 1.6, -2.05, null, null, null, 0, entranceDoorFrame, material, doorFrameColumnGeometry);
wall(0, 1.6, 2.05, null, null, null, 0, entranceDoorFrame, material, doorFrameColumnGeometry);

const doorFrameArchShape = new THREE.Shape();
doorFrameArchShape.moveTo(-2.6, 0);
doorFrameArchShape.lineTo(-2.6, 1.8);
doorFrameArchShape.lineTo(2.6, 1.8);
doorFrameArchShape.lineTo(2.6, 0);
doorFrameArchShape.lineTo(1.5, 0);
doorFrameArchShape.quadraticCurveTo(0.98, 0.92, 0, 1.15);
doorFrameArchShape.quadraticCurveTo(-0.98, 0.92, -1.5, 0);
doorFrameArchShape.closePath();

const doorFrameArchGeometry = new THREE.ExtrudeGeometry(doorFrameArchShape, {
    depth: 0.6,
    bevelEnabled: false,
    curveSegments: 24
});
doorFrameArchGeometry.translate(0, 0, -0.3);
doorFrameArchGeometry.rotateY(degreesToRadians(90));

const doorFrameArch = new THREE.Mesh(doorFrameArchGeometry, material);
doorFrameArch.position.y = 3.2;
entranceDoorFrame.add(doorFrameArch);

entranceDoorFrame.position.x = 71.3;
castelo.add(entranceDoorFrame);

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
createSmallTower(78.5, -3.5);// TorreFrontal
createSmallTower(119, -16); // TorreCilindricaNO
createSmallTower(119, 15); // TorreCilindricaNE
createSmallTower(119, 4); // TorreTraseira

//COROAS DAS TORRES PEQUENAS ADJACENTES
let smallCrownBaseGeometry = new THREE.CircleGeometry(1.2, 256);

function createSmallCrown(x, z) {
    let smallCrownBase = new THREE.Mesh(smallCrownBaseGeometry, material);
    smallCrownBase.position.set(x, 20 + ZF, z);
    smallCrownBase.rotation.x = degreesToRadians(-90);
    castelo.add(smallCrownBase);


    for (let thetaStart = 0; thetaStart < Math.PI * 2; thetaStart += Math.PI / 2) {
        let smallCrownGeometry = new THREE.CylinderGeometry(1.2, 1.2, 1, 32, 1, true, thetaStart, 1);
        let smallCrown = new THREE.Mesh(smallCrownGeometry, material);
        smallCrown.position.set(x, 20.5, z);
        castelo.add(smallCrown);
    }
}

createSmallCrown(99, -20); // 1
createSmallCrown(99, 20);  // 2
createSmallCrown(77, -20); // 3
createSmallCrown(72, 15.5); // 4
createSmallCrown(78.5, -3.5); // 5
createSmallCrown(119, -16); // 6
createSmallCrown(119, 15); // 7
createSmallCrown(119, 4); // 8

castelo.scale.setScalar(3);
castelo.add(frontDoor);

export { castelo };
