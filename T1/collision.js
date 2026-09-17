import * as THREE from "three";

const raycaster = new THREE.Raycaster();
//Direção do raio 
const down = new THREE.Vector3(0,-1,0);

let velocityY = 0;
const gravity = 20;

//Considerei que o player e um cilindro, por que da pra usar o raio no lugar de várias dimensões
const playerWidth = 0.6;
const playerHeight = 4;
const minimumWallHeight = 1.1;

export function createWallCollision(walls){
    const wallCollisions = [];
    
    for(const object of walls){
        object.updateWorldMatrix(true, true);

        object.traverse((child) => {
            if(!child.isMesh) return;

            child.updateWorldMatrix(true, false);

            const box = new THREE.Box3().setFromObject(child);
            
            if(box.max.y - box.min.y >= minimumWallHeight){
                wallCollisions.push(box);
            }
        });
    }

    return wallCollisions;
}

function isColliding(camera, wallCollisions){
    const playerBottom = camera.position.y - playerHeight;
    const playerTop = camera.position.y;

    return wallCollisions.some((wall) => {
        const overlapsVertically = wall.max.y >= playerBottom && wall.min.y <= playerTop;

        const overlapsHorizontally = camera.position.x + playerWidth >= wall.min.x  - playerWidth && 
            camera.position.x - playerWidth <= wall.max.x + playerWidth &&
            camera.position.z + playerWidth >= wall.min.z - playerWidth &&
            camera.position.z - playerWidth <= wall.max.z + playerWidth;

        return overlapsVertically && overlapsHorizontally;
    });
}

export function wallCollision(camera, lastPosition, wallCollisions){
    const nextX = camera.position.x;
    const nextZ = camera.position.z;

    camera.position.x = nextX;
    camera.position.z = lastPosition.z;

    if (isColliding(camera, wallCollisions)) {
        camera.position.x = lastPosition.x;
    }

    camera.position.z = nextZ;
    if (isColliding(camera, wallCollisions)) {
        camera.position.z = lastPosition.z;
    }
}

//Cria colisão pro chão
export function groundCollision(camera, floors, delta){
    const viewHeight = 4;
    
    velocityY -= gravity * delta;
    camera.position.y += velocityY * delta;
    
    const rayOrigin = camera.position.clone();
    //Considerei a origem do raio 1 acima, pra se tiver parcialmente dentro do chão, ele não ficar preso
    rayOrigin.y += viewHeight +  0.5;

    //Lança o raio pra baixo e cria quais locais ele deu interseção
    raycaster.set(rayOrigin, down);
    
    const intersections = raycaster.intersectObjects(floors, true);

    //Confere se ainda tem interseções e reajusta a câmera se houver
    if (intersections.length > 0) {
        //pra garantir que a câmera está correta (estava com medo de que tivesse bugs ao subir em estruturas)
        console.log(
            "câmera:",
            camera.position.y,
            "piso detectado:",
            intersections[0]?.point.y
        );
        const floorHeight = intersections[0].point.y;
        const minimumCameraHeight = floorHeight + viewHeight;

        if (camera.position.y <= minimumCameraHeight) {
            camera.position.y = minimumCameraHeight;
            velocityY = 0;
        }
    }
}

export function pontoColideComAlgum(ponto, boxes) {
  return boxes.some((box) => box.containsPoint(ponto));
}