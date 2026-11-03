import * as THREE from "three";
import {
  atualizarChavesSoltas,
  prepararChavesSoltas,
  registrarChaveDrop
} from "./keys.js";
import { createEnemy, setMeshOpacity, FADE_DURATION, ENEMY_LIGHT_INTENSITY } from "../models/enemy.js";

const enemyDefinitions = [
  //inimigo1
  {
    model: "./assets/bat.glb",
    flipOnTurn: true,
    position: [-55, 39.5, 54],
    direction: 1,
    axis: "x",
    limits: [-55, -15],
    keyColor: "#3fa9ff"
  },
  //inimigo2
  {
    model: "./assets/bat.glb",
    modelRotationY: -Math.PI / 2,
    position: [-108.5, 3.5, -7],
    direction: 1,
    axis: "z",
    limits: [-7, 7],
    keyColor: "#3ddc6b"
  },
  //inimigo3
  {
    type: "cylinder",
    model: "./assets/slime.glb",
    modelRotationY: -Math.PI / 2,
    flipOnTurn: true,
    position: [21.5, 24, -31],
    direction: 1,
    axis: "z",
    limits: [-41, -21],
    keyColor: "#ffb43a"
  },
  //inimigo4
  {
    type: "cylinder",
    model: "./assets/slime.glb",
    flipOnTurn: true,
    position: [41.5, 2.5, 35],
    direction: -1,
    axis: "z",
    limits: [26, 42],
    keyColor: "#b35cff"
  }
];

const raycaster = new THREE.Raycaster();
const movement = new THREE.Vector3();
const nextPosition = new THREE.Vector3();

function reverseEnemyDirection(enemy) {
  enemy.direction *= -1;
  if (!enemy.flipOnTurn) return;

  enemy.turnRotation += Math.PI;
  if (enemy.model) enemy.model.rotation.y += Math.PI;
}

function pushPlayerWithEnemy(enemy, previousPosition, nextPosition, camera) {
  const playerFeet = camera.position.y - 4;
  if (camera.position.y <= previousPosition.y - 2 || playerFeet >= previousPosition.y + 2) return;

  const axis = enemy.axis;
  const lateralAxis = axis === "x" ? "z" : "x";
  const movementDistance = nextPosition[axis] - previousPosition[axis];
  if (movementDistance === 0) return;

  const playerDistance = camera.position[axis] - previousPosition[axis];
  const collisionDistance = enemy.collisionRadius + 0.6;
  const lateralDistance = Math.abs(camera.position[lateralAxis] - previousPosition[lateralAxis]);
  const nextPlayerDistance = camera.position[axis] - nextPosition[axis];
  const isInFront = playerDistance * movementDistance >= 0;
  const isColliding = Math.abs(nextPlayerDistance) <= collisionDistance;

  if (isInFront && isColliding && lateralDistance <= collisionDistance) {
    camera.position[axis] += movementDistance;
  }
}

export function createEnemies(scene, wallCollisions, playerCollisions = null, grounds = []) {
  prepararChavesSoltas(scene, enemyDefinitions.map((enemy) => enemy.keyColor));

  function damageEnemy(enemy, damage = 1) {
    if (!enemy?.alive || enemy.dying) return false;

    enemy.health = Math.max(0, enemy.health - damage);
    const ratio = enemy.health / enemy.maxHealth;
    enemy.healthBar.userData.foreground.scale.x = ratio;
    enemy.healthBar.userData.foreground.position.x = -1.14 * (1 - ratio);

    if (enemy.health === 0) {
      enemy.alive = false;
      enemy.dying = true;
      enemy.fadeTime = 0;
      for (const mesh of enemy.fadeMeshes) {
        mesh.visible = true;
        setMeshOpacity(mesh, 1);
      }
      enemy.body.userData.ignoreCollision = true;
      registrarChaveDrop(enemy.group.position, enemy.keyColor);
    }
    return true;
  }

  const enemies = enemyDefinitions.map((definition) => createEnemy(definition, damageEnemy));
  for (const enemy of enemies) scene.add(enemy.group);
  const colliders = [];
  const targets = [];
  let isNight = false;

  for (const enemy of enemies) {
    enemy.body.userData.ignoreCollision = true;
    enemy.group.visible = false;
  }

  function setNight(value) {
    const enteringNight = value && !isNight;
    isNight = value;
    for (const enemy of enemies) {
      if (enteringNight && enemy.alive && !enemy.dying) {
        enemy.direction = enemy.initialDirection;
        enemy.turnRotation = 0;
        if (enemy.model) {
          enemy.model.rotation.y = enemy.modelRotationY;
        }
        enemy.group.position.copy(enemy.originPosition);
        enemy.groundState.velocityY = 0;
        enemy.groundState.isGrounded = false;
        enemy.group.visible = true;
        for (const mesh of enemy.fadeMeshes) {
          mesh.visible = true;
          setMeshOpacity(mesh, 1);
        }
        enemy.healthBar.visible = true;
        enemy.light.intensity = ENEMY_LIGHT_INTENSITY;
      } else if (!isNight) {
        enemy.group.visible = false;
        enemy.light.intensity = 0;
      }

      const active = isNight && enemy.alive && !enemy.dying;
      enemy.group.visible = isNight && (active || enemy.dying);
      enemy.body.userData.ignoreCollision = !active;

      const colliderIndex = colliders.indexOf(enemy.body);
      if (active && colliderIndex === -1) {
        colliders.push(enemy.body);
        if (playerCollisions) playerCollisions.push(enemy.body);
      } else if (!active && colliderIndex !== -1) {
        colliders.splice(colliderIndex, 1);
        if (playerCollisions) {
          const playerColliderIndex = playerCollisions.indexOf(enemy.body);
          if (playerColliderIndex !== -1) playerCollisions.splice(playerColliderIndex, 1);
        }
      }

      const targetIndex = targets.indexOf(enemy.group);
      if (active && targetIndex === -1) targets.push(enemy.group);
      else if (!active && targetIndex !== -1) targets.splice(targetIndex, 1);
    }
  }

  function update(delta, camera, active = true) {
    atualizarChavesSoltas(camera);
    if (!isNight) return;
    for (const enemy of enemies) {
      if (enemy.dying) {
        enemy.fadeTime += delta;
        const opacity = Math.max(0, 1 - enemy.fadeTime / FADE_DURATION);
        for (const mesh of enemy.fadeMeshes) setMeshOpacity(mesh, opacity);
        enemy.light.intensity = ENEMY_LIGHT_INTENSITY * opacity;
        if (enemy.fadeTime >= FADE_DURATION) {
          for (const mesh of enemy.fadeMeshes) mesh.visible = false;
          enemy.healthBar.visible = false;
          enemy.light.intensity = 0;
          const colliderIndex = colliders.indexOf(enemy.body);
          if (colliderIndex !== -1) colliders.splice(colliderIndex, 1);
          if (playerCollisions) {
            const playerColliderIndex = playerCollisions.indexOf(enemy.body);
            if (playerColliderIndex !== -1) playerCollisions.splice(playerColliderIndex, 1);
          }
          const targetIndex = targets.indexOf(enemy.group);
          if (targetIndex !== -1) targets.splice(targetIndex, 1);
          enemy.dying = false;
        }
        continue;
      }

      if (!enemy.alive) continue;
      enemy.healthBar.lookAt(camera.position);
      if (!active) continue;

      const direction = enemy.axis === "x"
        ? new THREE.Vector3(enemy.direction, 0, 0)
        : new THREE.Vector3(0, 0, enemy.direction);
      raycaster.set(enemy.group.position, direction);
      raycaster.far = enemy.speed * delta + 1.2;
      if (raycaster.intersectObjects(wallCollisions, false).length > 0) {
        reverseEnemyDirection(enemy);
      }

      movement.set(
        enemy.axis === "x" ? enemy.direction * enemy.speed * delta : 0,
        0,
        enemy.axis === "z" ? enemy.direction * enemy.speed * delta : 0
      );
      nextPosition.copy(enemy.group.position).add(movement);
      const [minimum, maximum] = enemy.limits;
      const nextCoordinate = enemy.axis === "x" ? nextPosition.x : nextPosition.z;
      if (nextCoordinate < minimum || nextCoordinate > maximum) {
        reverseEnemyDirection(enemy);
        if (enemy.axis === "x") {
          nextPosition.x = enemy.group.position.x + enemy.direction * enemy.speed * delta;
        } else {
          nextPosition.z = enemy.group.position.z + enemy.direction * enemy.speed * delta;
        }
      }
      const previousPosition = enemy.group.position.clone();
      enemy.group.position.copy(nextPosition);
      enemy.group.updateWorldMatrix(true, true);
      pushPlayerWithEnemy(enemy, previousPosition, nextPosition, camera);
    }
  }

  return {
    enemies,
    colliders,
    targets,
    setNight,
    damageEnemy,
    update
  };
}
