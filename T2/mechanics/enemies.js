import * as THREE from "three";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import {
  atualizarChavesSoltas,
  prepararChavesSoltas,
  registrarChaveDrop
} from "./keys.js";

const modelLoader = new GLTFLoader();

const enemyDefinitions = [
  //inimigo1
  {
    model: "./assets/bat.glb",
    flipOnTurn: true,
    position: [-55, 39, 54],
    direction: 1,
    axis: "x",
    limits: [-55, -15],
    keyColor: "#3fa9ff"
  },
  //inimigo2
  {
    model: "./assets/bat.glb",
    modelRotationY: -Math.PI / 2,
    position: [-108.5, 2, -7],
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
    keyColor: "#ffdf3f"
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
    keyColor: "#d86cff"
  }
];

const bodyMaterials = {
  cube: new THREE.MeshLambertMaterial({ color: "#b544d6", transparent: true }),
  cylinder: new THREE.MeshLambertMaterial({ color: "#48ad4b", transparent: true })
};
const healthBackgroundMaterial = new THREE.MeshBasicMaterial({
  color: "#321b1b",
  transparent: true
});
const healthForegroundMaterial = new THREE.MeshBasicMaterial({
  color: "#e53935",
  transparent: true
});
const raycaster = new THREE.Raycaster();
const movement = new THREE.Vector3();
const nextPosition = new THREE.Vector3();
const FADE_DURATION = 0.8;
const ENEMY_LIGHT_INTENSITY = 30;

function reverseEnemyDirection(enemy) {
  enemy.direction *= -1;
  if (!enemy.flipOnTurn) return;

  enemy.turnRotation += Math.PI;
  if (enemy.model) enemy.model.rotation.y += Math.PI;
}

function setMeshOpacity(mesh, opacity) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const material of materials) {
    material.transparent = opacity < 1;
    material.depthWrite = opacity >= 1;
    material.opacity = opacity;
  }
}

function createHealthBar() {
  const bar = new THREE.Group();
  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.5),
    healthBackgroundMaterial.clone()
  );
  const foreground = new THREE.Mesh(
    new THREE.PlaneGeometry(2.28, 0.36),
    healthForegroundMaterial.clone()
  );
  background.renderOrder = 20;
  foreground.renderOrder = 21;
  background.material.depthTest = false;
  foreground.material.depthTest = false;
  foreground.position.z = 0.01;
  bar.add(background, foreground);
  bar.userData.foreground = foreground;
  bar.position.y = 2.65;
  return bar;
}

function createEnemy(definition, onHit) {
  const enemy = {
    health: definition.type === "cylinder" ? 5 : 3,
    maxHealth: definition.type === "cylinder" ? 5 : 3,
    alive: true,
    dying: false,
    fadeTime: 0,
    speed: 4,
    direction: definition.direction,
    initialDirection: definition.direction,
    axis: definition.axis,
    limits: definition.limits,
    originPosition: new THREE.Vector3(...definition.position),
    keyColor: definition.keyColor,
    modelRotationY: definition.modelRotationY ?? Math.PI / 2,
    flipOnTurn: definition.flipOnTurn === true,
    turnRotation: 0,
    model: null,
    group: new THREE.Group()
  };

  const bodyGeometry = definition.type === "cylinder"
    ? new THREE.CylinderGeometry(1.3, 1.3, 4, 20)
    : new THREE.BoxGeometry(2, 4, 2);
  const bodyMaterial = bodyMaterials[definition.type ?? "cube"].clone();
  bodyMaterial.opacity = 0;
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.userData.enemy = enemy;
  body.userData.dynamicCollider = true;
  body.castShadow = false;
  body.receiveShadow = false;

  const light = new THREE.PointLight(
    definition.type === "cylinder" ? "#7dff70" : "#d86cff",
    ENEMY_LIGHT_INTENSITY,
    10,
    2
  );
  light.position.y = 1.8;
  light.userData.ignoreCollision = true;

  const healthBar = createHealthBar();
  healthBar.userData.ignoreCollision = true;

  enemy.body = body;
  enemy.healthBar = healthBar;
  enemy.light = light;
  enemy.group.userData.aoSerAtingido = (damage) => {
    onHit(enemy, damage);
  };
  enemy.group.add(body, light, healthBar);
  enemy.fadeMeshes = [];
  modelLoader.load(
    definition.model,
    (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(definition.type === "cylinder" ? 2 : 1);
      model.rotation.y = (definition.modelRotationY ?? Math.PI / 2) + enemy.turnRotation;
      model.position.y = -2;
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = true;
        object.receiveShadow = true;
        object.userData.enemy = enemy;
        enemy.fadeMeshes.push(object);
      });
      enemy.model = model;
      enemy.group.add(model);
      const opacity = enemy.dying
        ? Math.max(0, 1 - enemy.fadeTime / FADE_DURATION)
        : 1;
      for (const mesh of enemy.fadeMeshes) {
        mesh.visible = opacity > 0;
        setMeshOpacity(mesh, opacity);
      }
    },
    undefined,
    (error) => {
      console.error(`Erro ao carregar o modelo do inimigo: ${definition.model}`, error);
    }
  );
  enemy.group.position.set(...definition.position);
  return enemy;
}

export function createEnemies(scene, wallCollisions, playerCollisions = null) {
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

  function update(delta, camera) {
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
      enemy.group.position.copy(nextPosition);
      enemy.group.updateWorldMatrix(true, true);

      const distanceX = camera.position.x - enemy.group.position.x;
      const distanceZ = camera.position.z - enemy.group.position.z;
      const horizontalDistance = Math.hypot(distanceX, distanceZ);
      const minimumDistance = 1 + 0.6;
      if (horizontalDistance < minimumDistance) {
        if (enemy.axis === "x") {
          camera.position.x += enemy.direction * enemy.speed * delta;
        } else {
          camera.position.z += enemy.direction * enemy.speed * delta;
        }
      }
      enemy.healthBar.lookAt(camera.position);
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
