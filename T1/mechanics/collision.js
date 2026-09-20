import * as THREE from "three";

const raycaster = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);
const wallRayHeights = [-2.45, -1.95, -1.45, -0.95, -0.45, -0.05];
const wallRayOffsets = [-0.6, 0, 0.6];

let velocityY = 0;
let isGrounded = false;
const gravity = 30;
const jumpVelocity = 12;
const playerWidth = 0.6;
const maximumStepHeight = 1.5;
const maximumGroundDrop = 1.5;

export function jump() {
  if (!isGrounded) return;

  velocityY = jumpVelocity;
  isGrounded = false;
}

export function createWallCollision(objects) {
  const meshes = [];

  for (const object of objects) {
    object.updateWorldMatrix(true, true);
    object.traverse((child) => {
      if (!child.isMesh || child.userData.ignoreCollision) return;

      meshes.push(child);
    });
  }

  return meshes;
}

function updateDynamicColliders(colliders) {
  for (const collider of colliders) {
    if (collider.userData.dynamicCollider) {
      collider.updateWorldMatrix(true, false);
    }
  }
}

function findWallHit(position, direction, distance, colliders) {
  const side = new THREE.Vector3(-direction.z, 0, direction.x);
  const origin = new THREE.Vector3();
  const normal = new THREE.Vector3();
  let nearest = null;

  raycaster.far = distance + playerWidth;

  for (const height of wallRayHeights) {
    for (const offset of wallRayOffsets) {
      origin.copy(position).addScaledVector(side, offset);
      origin.y += height;
      raycaster.set(origin, direction);

      for (const hit of raycaster.intersectObjects(colliders, false)) {
        normal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);

        if (Math.abs(normal.y) >= 0.5 || normal.dot(direction) >= 0) continue;
        if (!nearest || hit.distance < nearest.distance) {
          nearest = { distance: hit.distance, normal: normal.clone() };
        }
        break;
      }
    }
  }

  return nearest;
}

function moveWithWallSlide(position, movement, colliders) {
  const remaining = movement.clone();

  for (let attempt = 0; attempt < 2 && remaining.lengthSq() > 0; attempt++) {
    const distance = remaining.length();
    const direction = remaining.clone().normalize();
    const hit = findWallHit(position, direction, distance, colliders);

    if (!hit) {
      position.add(remaining);
      return;
    }

    const travel = Math.min(distance, Math.max(0, hit.distance - playerWidth));
    position.addScaledVector(direction, travel);
    remaining.copy(direction).multiplyScalar(distance - travel);
    hit.normal.y = 0;
    hit.normal.normalize();
    remaining.addScaledVector(hit.normal, -remaining.dot(hit.normal));
  }
}

export function wallCollision(camera, lastPosition, colliders) {
  updateDynamicColliders(colliders);

  const movement = new THREE.Vector3(
    camera.position.x - lastPosition.x,
    0,
    camera.position.z - lastPosition.z
  );

  camera.position.x = lastPosition.x;
  camera.position.z = lastPosition.z;
  moveWithWallSlide(camera.position, movement, colliders);
}

export function groundCollision(camera, floors, delta) {
  const viewHeight = 4;
  const wasGrounded = isGrounded;

  velocityY -= gravity * delta;
  camera.position.y += velocityY * delta;
  isGrounded = false;

  const rayOrigin = camera.position.clone();
  rayOrigin.y += viewHeight + 0.5;
  raycaster.set(rayOrigin, down);
  raycaster.far = Infinity;

  const intersections = raycaster
    .intersectObjects(floors, true)
    .filter(({ object, point }) =>
      !object.userData.ignoreCollision &&
      point.y <= camera.position.y + maximumStepHeight
    );
  if (intersections.length === 0) return;

  const groundHeight = intersections[0].point.y + viewHeight;
  const heightDifference = groundHeight - camera.position.y;

  if (velocityY > 0) {
    if (heightDifference > 0 && heightDifference <= maximumStepHeight) {
      camera.position.y = groundHeight;
    }
    return;
  }

  const canStepUp = heightDifference >= 0 &&
    heightDifference <= maximumStepHeight;
  const canFollowRampDown = wasGrounded && heightDifference < 0 &&
    Math.abs(heightDifference) <= maximumGroundDrop;

  if (canStepUp || canFollowRampDown) {
    camera.position.y = groundHeight;
    velocityY = 0;
    isGrounded = true;
  }
}

export function rayIntersectsColliders(origin, direction, distance, colliders) {
  updateDynamicColliders(colliders);
  raycaster.set(origin, direction);
  raycaster.far = distance;
  return raycaster.intersectObjects(colliders, false).length > 0;
}
