import * as THREE from 'three';
import {degreesToRadians, setDefaultMaterial} from "../libs/util/util.js";
import { floor, ramp, ZF } from "./tools.js";

let castelo = new THREE.Group();
let material = setDefaultMaterial("gray");
material.side = THREE.DoubleSide;

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
let crownBaseGeometry = new THREE.CircleGeometry(5, 256);


function createCrown(x, z) {
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

createCrown(119.0, -20.0); // NW
createCrown(119.0, 20.0);  // NE
createCrown(72.0, -20.0);  // SW
createCrown(72.0, 20.0);   // SE

// MURO

// -> FRENTE E TRÁS
let frontWallsGeometry = new THREE.BoxGeometry(2, 12, 16);

function createFrontWall(x, z) {
    let frontWall = new THREE.Mesh(frontWallsGeometry, material);
    frontWall.position.set(x, 6, z);
    castelo.add(frontWall);
}

createFrontWall(72, 10);
createFrontWall(72, -10);

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

// Passarela interna: [xMin, xMax, zMin, zMax, altura do piso (padrao: 12)].
const walkwaySections = [
    // Patamar e face interna da muralha junto a casa grande.
    [308 / 3, 316 / 3, -19, -49 / 3],
    [316 / 3, 115, -19, -17],
    [116, 118, -16, 0.16],
    // Desvio interno das torres; piso elevado acima do telhado da casa menor.
    [116, 118, 3, 16, 13],
    [100, 115, 17, 19, 13],
    [76, 97.16, 17, 19],
    // Face interna da frente, contornando a torre da entrada.
    [73, 75, 4, 16],
    [75, 81.5, 4, 6.5],
    [79, 81.5, -6.5, 4.5],
    [75, 81.5, -6.5, -4],
    [73, 75, -16, -4],
    // Acompanha o recuo do muro e passa pelo lado livre da rampa da casa.
    [76, 84, -19, -17],
    [82, 91, -21, -19],
    [95.5, 316 / 3, -49 / 3, -43 / 3],
    [93.5, 95.5, -19, -43 / 3],
    [89, 95.5, -19, -17]
];

for (const [x1, x2, z1, z2, height = 12] of walkwaySections) {
    const [xMin, xMax] = [Math.min(x1, x2), Math.max(x1, x2)];
    const [zMin, zMax] = [Math.min(z1, z2), Math.max(z1, z2)];
    const platform = floor(
        (xMin + xMax) / 2, height - 0.25, (zMin + zMax) / 2,
        xMax - xMin, 0.5, zMax - zMin, 0, "gray", castelo
    );
    platform.userData.walkable = true;
}

function createCurvedPlatform(centerX, centerZ, startAngle, endAngle, height = 12) {
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

// Plataformas em arco ao redor das quatro torres de canto.
createCurvedPlatform(119, -20, degreesToRadians(102), degreesToRadians(168));
createCurvedPlatform(119, 20, degreesToRadians(192), degreesToRadians(258), 13);
createCurvedPlatform(72, 20, degreesToRadians(282), degreesToRadians(348));
createCurvedPlatform(72, -20, degreesToRadians(12), degreesToRadians(78));

function createInclinedWalkway(x, y, z, run, rise, width, rotationY) {
    const slopeLength = Math.hypot(run, rise);
    const walkway = floor(0, 0, 0, slopeLength, 0.5, width, 0, "gray", castelo);
    walkway.rotation.set(0, rotationY, Math.atan2(rise, run));

    const direction = new THREE.Vector3(1, 0, 0).applyEuler(walkway.rotation);
    const normal = new THREE.Vector3(0, 1, 0).applyEuler(walkway.rotation);
    walkway.position.set(x, y, z)
        .addScaledVector(direction, slopeLength / 2)
        .addScaledVector(normal, -0.25);
    walkway.translateY(2 * ZF);
    walkway.userData.walkable = true;
}

// Transicoes entre os trechos normal e elevado, sem degraus intransponiveis.
createInclinedWalkway(117, 12, 0, 3, 1, 2, degreesToRadians(-90));
createInclinedWalkway(97, 12, 18, 3, 1, 2, 0);

// Sobe do teto da casa menor ate a passarela elevada do castelo.
ramp(110, 37 / 3, 15, 2, 2 / 3, 2, degreesToRadians(-90), "gray", castelo);

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

export { castelo };
