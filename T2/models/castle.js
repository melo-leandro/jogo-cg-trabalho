import * as THREE from 'three';
import {degreesToRadians, setDefaultMaterial} from "../libs/util/util.js";
import { floor, ramp, wall, ZF, stoneMaterial } from "./tools.js";
import { castleDoors, frontDoor } from "./doors.js";
import { CSG } from "../libs/other/CSGMesh.js";

let castelo = new THREE.Group();
let material = setDefaultMaterial("#65645D");
material.side = THREE.DoubleSide;
const slitBorderMaterial = new THREE.MeshLambertMaterial({ color: "#55544e", side: THREE.DoubleSide });

// FUNDAÇÃO

function createCastleFoundation() {
    const foundation = new THREE.Group();
    for (const [x, z, width, depth] of [
        [95.5, 0, 149 / 3, 42],
        [85.5, -22, 35 / 3, 8 / 3],
        [95, -21.5, 26 / 3, 17 / 3], [95, 21.5, 26 / 3, 17 / 3],
        [120.5, 0, 17 / 3, 26 / 3],
        [75, 0, 26 / 3, 26 / 3],
        [71.5, -6, 11 / 3, 26 / 3], [71.5, 6, 11 / 3, 26 / 3],
        [70.5, -4.5, 17 / 3, 14 / 3], [70.5, 4.5, 17 / 3, 14 / 3]
    ]) {
        wall(x, -0.75 - ZF / 3, z, width, 1.5, depth, 0, foundation, stoneMaterial);
    }
    const towerBaseGeometry = new THREE.CylinderGeometry(14.5 / 3, 14.5 / 3, 1.5, 32);
    for (const [x, z] of [[72, -20], [72, 20], [119, -20], [119, 20]]) {
        const base = new THREE.Mesh(towerBaseGeometry, stoneMaterial);
        base.position.set(x, -0.75 - ZF / 3, z);
        foundation.add(base);
    }
    return foundation;
}

const foundation = createCastleFoundation();
castelo.add(foundation);

// TORRES

function createTowerShell(geometry, interiorGeometry) {
    const solid = CSG.fromGeometry(geometry).subtract(CSG.fromGeometry(interiorGeometry));
    geometry.dispose();
    interiorGeometry.dispose();
    return solid;
}

function cutTowerPassages(solid, passageCutters) {
    for (const passage of passageCutters) {
        passage.updateMatrix();
        solid = solid.subtract(CSG.fromMesh(passage));
        passage.geometry.dispose();
    }
    return solid;
}

function addArrowSlits(solid, positions) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.15, -1.2);
    shape.lineTo(0.15, -1.2);
    shape.lineTo(0.15, 1.05);
    shape.absarc(0, 1.05, 0.15, 0, Math.PI, false);
    shape.closePath();
    const slitGeometry = new THREE.ExtrudeGeometry(shape, {
        depth: 2.2, bevelEnabled: false, curveSegments: 6
    });
    slitGeometry.translate(0, 0, -1.1);
    const cutter = new THREE.Mesh(slitGeometry, material);
    for (const [x, y, z, angle] of positions) {
        cutter.position.set(x, y, z);
        cutter.rotation.y = angle;
        cutter.updateMatrix();
        solid = solid.subtract(CSG.fromMesh(cutter));
    }
    const playerCollider = CSG.toMesh(solid, new THREE.Matrix4(), material);
    playerCollider.visible = false;
    playerCollider.userData.ignoreCollision = true;
    playerCollider.userData.playerCollider = true;
    const result = CSG.toMesh(solid, new THREE.Matrix4(), material);
    result.add(playerCollider);
    const borderShape = new THREE.Shape(shape.getPoints(6).map(point =>
        new THREE.Vector2(point.x * 1.5, point.y * 1.06)
    ));
    borderShape.holes.push(new THREE.Path(shape.getPoints(6)));
    const borderGeometry = new THREE.ShapeGeometry(borderShape);
    borderGeometry.translate(0, 0, 0.52);
    for (const [x, y, z, angle] of positions) {
        const border = new THREE.Mesh(borderGeometry, slitBorderMaterial);
        border.name = 'slitBorder';
        border.position.set(x, y, z);
        border.rotation.y = angle;
        border.userData.ignoreCollision = true;
        result.add(border);
    }
    slitGeometry.dispose();
    return result;
}

const towerFloorGeometry = new THREE.CylinderGeometry(3.5, 3.5, 0.5, 32);

function cylinderTower(x, z, slits) {
    const inwardX = x === 72 ? 1 : -1;
    const inwardZ = z < 0 ? 1 : -1;
    const height = x === 119 && z === 20 ? 13 : 12;
    const passageShape = new THREE.Shape();
    passageShape.moveTo(-0.7, -0.5);
    passageShape.lineTo(0.7, -0.5);
    passageShape.lineTo(0.7, 1.1);
    passageShape.absarc(0, 1.1, 0.7, 0, Math.PI, false);
    passageShape.closePath();
    const verticalPassage = new THREE.Mesh(new THREE.ExtrudeGeometry(passageShape, {
        depth: 6, bevelEnabled: false, curveSegments: 6
    }));
    verticalPassage.geometry.translate(0, 0, -3);
    verticalPassage.position.set(inwardX * 2, height - 9, inwardZ * 3);
    const horizontalPassage = new THREE.Mesh(verticalPassage.geometry.clone());
    horizontalPassage.rotation.y = Math.PI / 2;
    horizontalPassage.position.set(inwardX * 3, height - 9, inwardZ * 2);
    const positions = slits.map(([height, degrees]) => {
        const angle = degreesToRadians(degrees);
        return [Math.sin(angle) * 4, height - 9, Math.cos(angle) * 4, angle];
    });
    const shell = createTowerShell(
        new THREE.CylinderGeometry(4.5, 4.5, 18),
        new THREE.CylinderGeometry(3.5, 3.5, 16)
    );
    const solid = cutTowerPassages(shell, [horizontalPassage, verticalPassage]);
    const tower = addArrowSlits(solid, positions);
    tower.position.set(x, 9, z);
    castelo.add(tower);
    floor(x, height - 0.25 + ZF, z, null, null, null, 0, castelo, material, towerFloorGeometry);
    floor(x + inwardX * 2.75, height - 0.25, z + inwardZ * 2,
        3.5, 0.5, 2, 0, castelo, material);
    floor(x + inwardX * 2, height - 0.25, z + inwardZ * 2.75,
        2, 0.5, 3.5, 0, castelo, material);
}

cylinderTower(119, -20, [ // noroeste
    [5.5, -165], [5.5, 30], [5.5, 130],
    [10.4, -160], [10.4, 70],
    [15.2, -100], [15.2, 35], [15.2, 130]
]);
cylinderTower(72, -20, [ // sudoeste
    [5.2, -140], [5.2, -70], [5.2, 110],
    [10, -60], [10, 165],
    [14.4, -140], [14.4, 120]
]);
cylinderTower(119, 20, [ // nordeste
    [5.5, -65], [5.5, 0], [5.5, 120],
    [10.6, -45], [10.6, 60],
    [15.4, 60]
]);
cylinderTower(72, 20, [ // sudeste
    [4.7, -140], [4.7, -15], [4.7, 40],
    [9.4, -80], [9.4, 40],
    [14.2, -135], [14.2, -15], [14.2, 45]
]);

//COROAS DAS TORRES CILINDRICAS

let crownBaseGeometry = new THREE.CircleGeometry(4.5, 256);

function crownToothGeometry(radius, height, thetaStart, thetaLength, thickness) {
    const startAngle = Math.PI / 2 - thetaStart;
    const endAngle = startAngle - thetaLength;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, radius, startAngle, endAngle, true);
    shape.absarc(0, 0, radius - thickness, endAngle, startAngle);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: false,
        curveSegments: 8
    });
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, height / 2, 0);
    return geometry;
}

function crown(x, z) {
    let crownBase = new THREE.Mesh(crownBaseGeometry, material);

    crownBase.position.set(x, 18 + ZF, z);
    crownBase.rotation.x = degreesToRadians(-90);
    castelo.add(crownBase);

    //secciona o topo da
    for(let thetaStart = 0; thetaStart < Math.PI * 2; thetaStart += Math.PI / 4) {
        // aqui o último número diminui a circunferencia do cilindro (theta)
        let crownGeometry = crownToothGeometry(4.5, 1.8, thetaStart, 0.5, 0.6);
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

const blockShape = new THREE.BoxGeometry(2, 2.5, 0.7);
const towerBlockShape = new THREE.BoxGeometry(1, 1.8, 0.7);

function addTopBlocks(centerX, centerZ, length, axis, height, blockLength = 2, shape = blockShape, gap = 1.5) {
    const spacing = blockLength + gap;
    const count = Math.floor((length + gap) / spacing);
    const alongX = axis === 'x';
    for (let index = 0; index < count; index++) {
        const offset = (index - (count - 1) / 2) * spacing;
        wall(
            centerX + (alongX ? offset : 0), height, centerZ + (alongX ? 0 : offset),
            null, null, null, alongX ? 0 : Math.PI / 2, castelo, material, shape
        );
    }
}

// blocos dos muros
addTopBlocks(71, 10, 16, 'z', 12.25);   // frente
addTopBlocks(71, -10, 16, 'z', 12.25);  // frente
addTopBlocks(120, 0, 40, 'z', 12.25);   // fundo
addTopBlocks(95.5, 21, 40, 'x', 12.25); // direita
addTopBlocks(104, -21, 24, 'x', 12.25); // esquerda (trecho longo)
addTopBlocks(86, -23, 10, 'x', 12.25);  // esquerda (trecho curto)
addTopBlocks(78, -21, 4, 'x', 12.25);   // esquerda (base do L)
addTopBlocks(80.25, -22, 4, 'z', 12.25); // esquerda (curva do L)

// blocos do bloco frontal
addTopBlocks(71.5, 9.65, 3, 'x', 17.9, 1, towerBlockShape, 0.6); // lado externo
addTopBlocks(70.35, 8.25, 3.5, 'z', 17.9, 1, towerBlockShape, 0.6); // frente do retângulo
addTopBlocks(69, 6.15, 2, 'x', 17.9, 1, towerBlockShape, 0.6); // degrau quadrado/retângulo
addTopBlocks(68.35, 4.5, 4, 'z', 17.9, 1, towerBlockShape, 0.6); // frente do quadrado
addTopBlocks(69.5, 2.85, 3, 'x', 17.9, 1, towerBlockShape, 0.6); // degrau quadrado/entrada
addTopBlocks(72.65, 7, 6, 'z', 17.9, 1, towerBlockShape, 0.6); // ombro traseiro
addTopBlocks(76, 3.65, 6, 'x', 17.9, 1, towerBlockShape, 0.6); // lateral da entrada
addTopBlocks(71.5, -9.65, 3, 'x', 17.9, 1, towerBlockShape, 0.6);
addTopBlocks(70.35, -8.25, 3.5, 'z', 17.9, 1, towerBlockShape, 0.6);
addTopBlocks(69, -6.15, 2, 'x', 17.9, 1, towerBlockShape, 0.6);
addTopBlocks(68.35, -4.5, 4, 'z', 17.9, 1, towerBlockShape, 0.6);
addTopBlocks(69.5, -2.85, 3, 'x', 17.9, 1, towerBlockShape, 0.6);
addTopBlocks(72.65, -7, 6, 'z', 17.9, 1, towerBlockShape, 0.6);
addTopBlocks(76, -3.65, 6, 'x', 17.9, 1, towerBlockShape, 0.6);
addTopBlocks(71.35, 0, 4, 'z', 17.9, 1, towerBlockShape, 0.6); // frente da entrada (centro)
addTopBlocks(78.65, 0, 8, 'z', 17.9, 1, towerBlockShape, 0.6); // fundo da entrada (centro)

// blocos no topo das torres quadradas
addTopBlocks(95, -23.65, 8, 'x', 17.9, 1, towerBlockShape);
addTopBlocks(95, -19.35, 8, 'x', 17.9, 1, towerBlockShape);
addTopBlocks(91.35, -21.5, 5, 'z', 17.9, 1, towerBlockShape);
addTopBlocks(98.65, -21.5, 5, 'z', 17.9, 1, towerBlockShape);
addTopBlocks(95, 19.35, 8, 'x', 17.9, 1, towerBlockShape);
addTopBlocks(95, 23.65, 8, 'x', 17.9, 1, towerBlockShape);
addTopBlocks(91.35, 21.5, 5, 'z', 17.9, 1, towerBlockShape);
addTopBlocks(98.65, 21.5, 5, 'z', 17.9, 1, towerBlockShape);
addTopBlocks(120.5, -3.65, 5, 'x', 17.9, 1, towerBlockShape);
addTopBlocks(120.5, 3.65, 5, 'x', 17.9, 1, towerBlockShape);
addTopBlocks(118.35, 0, 8, 'z', 17.9, 1, towerBlockShape);
addTopBlocks(122.65, 0, 8, 'z', 17.9, 1, towerBlockShape);

// -> PASSARELA

const frontPlatformGeometry = new THREE.BoxGeometry(2 + 2 * ZF, 0.5, 12 + 2 * ZF);
const entrancePlatformGeometry = new THREE.BoxGeometry(6.5 + 2 * ZF, 0.5, 2.5 + 2 * ZF);
const pillarGeometry = new THREE.BoxGeometry(1, 12 - 2 * ZF, 1);
const elevatedPillarGeometry = new THREE.BoxGeometry(1, 13 - 2 * ZF, 1);
const pillarMaterial = setDefaultMaterial("#7d7c74"); // um pouco mais claro que o muro
pillarMaterial.side = THREE.DoubleSide;

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
wall(86.5, 6, -20, null, null, null, 0, castelo, pillarMaterial, pillarGeometry);
// frente do castelo, esquerda e direita (pov do fundo do castelo pra frente)
wall(74, 6, 10, null, null, null, 0, castelo, pillarMaterial, pillarGeometry);
wall(74, 6, -10, null, null, null, 0, castelo, pillarMaterial, pillarGeometry);
// atras da casa alta
wall(107.5, 6.5, 18, null, null, null, 0, castelo, pillarMaterial, elevatedPillarGeometry);
// direita do castelo
wall(86.58, 6, 18, null, null, null, 0, castelo, pillarMaterial, pillarGeometry);
// fundo do castelo, esquerda e direita
wall(117, 6, -7.92, null, null, null, 0, castelo, pillarMaterial, pillarGeometry);
wall(117, 6.5, 4.5, null, null, null, 0, castelo, pillarMaterial, elevatedPillarGeometry);

// sobe do teto da casa ate a passarela elevada do castelo
ramp(110, 37 / 3, 15, 2, 2 / 3, 2, degreesToRadians(-90), "slategray", castelo, material, 2);

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

// duplica arco + porta no fim do corredor (fundo da entrada, espelhado sobre x=75)
const backDoorFrame = entranceDoorFrame.clone();
backDoorFrame.position.x = 78.7;
castelo.add(backDoorFrame);

const backDoor = frontDoor.clone(); // frontDoor tem as folhas em x=71.6 → +6.8 = 78.4
backDoor.position.x = 7.4;
castelo.add(backDoor);
const backCastleDoors = backDoor.children.map((door, index) => [door, castleDoors[index][1]]);

//TORRE LATERAIS E TRASEIRA
wall(95, 9, -21.5, 8, 18, 5, Math.PI, castelo, material); // Oeste
wall(95, 9, 21.5, 8, 18, 5, 0, castelo, material); // Leste
wall(120.5, 9, 0, 8, 18, 5, Math.PI / 2, castelo, material); // Traseira

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
let smallCrownBaseGeometry = new THREE.CircleGeometry(1, 256);

function createSmallCrown(x, z) {
    let smallCrownBase = new THREE.Mesh(smallCrownBaseGeometry, material);
    smallCrownBase.position.set(x, 20 + ZF, z);
    smallCrownBase.rotation.x = degreesToRadians(-90);
    castelo.add(smallCrownBase);

    for (let thetaStart = 0; thetaStart < Math.PI * 2; thetaStart += Math.PI / 2) {
        let smallCrownGeometry = crownToothGeometry(1, 1, thetaStart, 1, 0.25);
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

export { backCastleDoors, castelo, foundation };
