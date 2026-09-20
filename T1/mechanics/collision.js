import * as THREE from "three";

const raycaster = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);

let velocityY = 0;
const gravity = 20;
const playerWidth = 0.6;
const playerHeight = 4;
const maximumStepHeight = 0.5;
const maximumGroundDrop = 1;
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
      const isCylinder = child.geometry.type === "CylinderGeometry";
      const isRamp =
        child.userData.walkable === true &&
        child.geometry.type === "ExtrudeGeometry" &&
        child.userData.curvedPlatform !== true;
      let cylinderRadius = 0;
      const worldCylinderCenter = new THREE.Vector3();
      let worldCylinderRadius = 0;

      if (isCylinder) {
        cylinderRadius = Math.max(
          child.geometry.parameters.radiusTop,
          child.geometry.parameters.radiusBottom
        );
        worldCylinderCenter.setFromMatrixPosition(child.matrixWorld);
        worldCylinderRadius = cylinderRadius * Math.max(
          Math.abs(scale.x),
          Math.abs(scale.z)
        );
      }

      colliders.push({
        blocksMovement: !child.userData.walkable || isRamp,

        containsPoint(point) {
          localPoint.copy(point).applyMatrix4(inverseMatrix);

          if (isCylinder) {
            const insideHeight =
              localPoint.y >= localBox.min.y && localPoint.y <= localBox.max.y;
            const horizontalDistance = Math.hypot(
              point.x - worldCylinderCenter.x,
              point.z - worldCylinderCenter.z
            );
            return insideHeight && horizontalDistance <= worldCylinderRadius;
          }

          return localBox.containsPoint(localPoint);
        },

        intersectsPlayer(position) {
          const playerBottom = position.y - playerHeight;
          const playerTop = position.y;
          const overlapsVertically =
            worldBox.max.y - maximumStepHeight > playerBottom &&
            worldBox.min.y < playerTop;

          if (!overlapsVertically) return false;

          localPoint.copy(position).applyMatrix4(inverseMatrix);

          if (isRamp) {
            const sideMargin = playerWidth / Math.abs(scale.z);
            const isAtLeftEdge =
              localPoint.z >= localBox.min.z - sideMargin &&
              localPoint.z <= localBox.min.z + sideMargin;
            const isAtRightEdge =
              localPoint.z >= localBox.max.z - sideMargin &&
              localPoint.z <= localBox.max.z + sideMargin;
            const isAlongRamp =
              localPoint.x >= localBox.min.x - sideMargin &&
              localPoint.x <= localBox.max.x + sideMargin;
            const rampLength = localBox.max.x - localBox.min.x;
            const rampHeight = localBox.max.y - localBox.min.y;
            const rampProgress = THREE.MathUtils.clamp(
              (localPoint.x - localBox.min.x) / rampLength,
              0,
              1
            );
            const rampSurface = localBox.min.y + rampHeight * rampProgress;
            const playerBottom =
              localPoint.y - playerHeight / Math.abs(scale.y);

            return isAlongRamp &&
              (isAtLeftEdge || isAtRightEdge) &&
              playerBottom < rampSurface - 0.05 &&
              localPoint.y > localBox.min.y;
          }

          if (isCylinder) {
            const horizontalDistance = Math.hypot(
              position.x - worldCylinderCenter.x,
              position.z - worldCylinderCenter.z
            );
            return horizontalDistance <= worldCylinderRadius + playerWidth;
          }

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
    (collider) => collider.blocksMovement && collider.intersectsPlayer(position)
  );
}

function moveWithWallSlide(position, movement, colliders) {
  if (movement.lengthSq() === 0) return;

  const direction = Math.atan2(movement.z, movement.x);
  const candidate = position.clone();
  let bestScore = -Infinity;
  let bestAngle = 0;
  const samples = 32;

  for (let sample = 0; sample < samples; sample++) {
    const angle = direction + sample * Math.PI * 2 / samples;
    candidate.x = position.x + Math.cos(angle) * movement.length();
    candidate.z = position.z + Math.sin(angle) * movement.length();

    if (!isColliding(candidate, colliders)) {
      const score = Math.cos(angle - direction);
      if (score > bestScore) {
        bestScore = score;
        bestAngle = angle;
      }
    }
  }

  if (bestScore > -Infinity) {
    position.x += Math.cos(bestAngle) * movement.length();
    position.z += Math.sin(bestAngle) * movement.length();
  }
}

export function wallCollision(camera, lastPosition, colliders) {
  const movementX = camera.position.x - lastPosition.x;
  const movementZ = camera.position.z - lastPosition.z;
  const steps = Math.max(
    1,
    Math.ceil(Math.max(Math.abs(movementX), Math.abs(movementZ)) / maximumMovementStep)
  );
  const stepMovement = new THREE.Vector3();

  camera.position.x = lastPosition.x;
  camera.position.z = lastPosition.z;

  for (let step = 0; step < steps; step++) {
    stepMovement.set(movementX / steps, 0, movementZ / steps);
    moveWithWallSlide(camera.position, stepMovement, colliders);
  }
}

export function groundCollision(camera, floors, delta) {
  const viewHeight = 4;

  velocityY -= gravity * delta;
  camera.position.y += velocityY * delta;

  const rayOrigin = camera.position.clone();
  rayOrigin.y += viewHeight + 0.5;
  raycaster.set(rayOrigin, down);

  const intersections = raycaster
    .intersectObjects(floors, true)
    .filter(({ object, point }) =>
      (object.userData.walkable === true || object.userData.ground === true) &&
      point.y <= camera.position.y + maximumStepHeight
    );
  if (intersections.length === 0) return;

  const groundHeight = intersections[0].point.y + viewHeight;
  const heightDifference = groundHeight - camera.position.y;
  const canStepUp = heightDifference >= 0 &&
    heightDifference <= maximumStepHeight;
  const canFollowRampDown = heightDifference < 0 &&
    Math.abs(heightDifference) <= maximumGroundDrop;

  if (canStepUp || canFollowRampDown) {
    camera.position.y = groundHeight;
    velocityY = 0;
  }
}

export function pontoColideComAlgum(point, colliders) {
  return colliders.some((collider) => collider.containsPoint(point));
}
