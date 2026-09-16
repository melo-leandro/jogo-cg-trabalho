import * as THREE from "three";

const raycaster = new THREE.Raycaster();
//Direção do raio 
const down = new THREE.Vector3(0,-1,0);

let velocityY = 0;
const gravity = 20;

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