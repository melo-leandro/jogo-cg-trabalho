import * as THREE from "three";

const raycaster = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);

let velocityY = 0;
const gravity = 20;
const playerWidth = 0.6;
const playerHeight = 4;
const maximumStepHeight = 0.5;
const maximumMovementStep = playerWidth / 2;
const minimumWallHeight = 1.1;

export function createWallCollision(objects) {
  const colliders = [];

  for (const object of objects) {
    object.updateWorldMatrix(true, true);

    object.traverse((child) => {
      if (!child.isMesh) return;

      child.updateWorldMatrix(true, false);
      const worldBox = new THREE.Box3().setFromObject(child);
      if (worldBox.max.y - worldBox.min.y < minimumWallHeight) return;

      child.geometry.computeBoundingBox();

      const localBox = child.geometry.boundingBox.clone();
      const inverseMatrix = child.matrixWorld.clone().invert();
      const scale = child.getWorldScale(new THREE.Vector3());
      const localPoint = new THREE.Vector3();

      colliders.push({
        walkable: child.userData.walkable === true,

        containsPoint(point) {
          return localBox.containsPoint(localPoint.copy(point).applyMatrix4(inverseMatrix));
        },

        intersectsPlayer(position) {
          const playerBottom = position.y - playerHeight;
          const playerTop = position.y;
          const overlapsVertically =
            worldBox.max.y - maximumStepHeight > playerBottom &&
            worldBox.min.y < playerTop;

          if (!overlapsVertically) return false;

          localPoint.copy(position).applyMatrix4(inverseMatrix);
          const radiusX = playerWidth / Math.abs(scale.x);
          const radiusZ = playerWidth / Math.abs(scale.z);

          return localPoint.x + radiusX >= localBox.min.x &&
            localPoint.x - radiusX <= localBox.max.x &&
            localPoint.z + radiusZ >= localBox.min.z &&
            localPoint.z - radiusZ <= localBox.max.z;
        }
      });
    });
  }

  return colliders;
}

function isColliding(position, colliders) {
  return colliders.some(
    (collider) => !collider.walkable && collider.intersectsPlayer(position)
  );
}

export function wallCollision(camera, lastPosition, colliders) {
  const movementX = camera.position.x - lastPosition.x;
  const movementZ = camera.position.z - lastPosition.z;
  const steps = Math.max(
    1,
    Math.ceil(Math.max(Math.abs(movementX), Math.abs(movementZ)) / maximumMovementStep)
  );
  const stepX = movementX / steps;
  const stepZ = movementZ / steps;

  camera.position.x = lastPosition.x;
  camera.position.z = lastPosition.z;

  for (let step = 0; step < steps; step++) {
    const previousX = camera.position.x;
    camera.position.x += stepX;
    if (isColliding(camera.position, colliders)) camera.position.x = previousX;

    const previousZ = camera.position.z;
    camera.position.z += stepZ;
    if (isColliding(camera.position, colliders)) camera.position.z = previousZ;
  }
}

export function groundCollision(camera, floors, delta) {
  const viewHeight = 4;

  velocityY -= gravity * delta;
  camera.position.y += velocityY * delta;

  const rayOrigin = camera.position.clone();
  rayOrigin.y += viewHeight + 0.5;
  raycaster.set(rayOrigin, down);

  const intersections = raycaster.intersectObjects(floors, true);
  if (intersections.length === 0) return;

  const minimumCameraHeight = intersections[0].point.y + viewHeight;
  if (camera.position.y <= minimumCameraHeight) {
    camera.position.y = minimumCameraHeight;
    velocityY = 0;
  }
}

export function pontoColideComAlgum(point, colliders) {
  return colliders.some((collider) => collider.containsPoint(point));
}
