import * as THREE from "three";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";

const modelLoader = new GLTFLoader();
export const FADE_DURATION = 0.8;
export const ENEMY_LIGHT_INTENSITY = 30;

const bodyMaterials = {
  cube: new THREE.MeshLambertMaterial({ color: "#b544d6", transparent: true }),
  cylinder: new THREE.MeshLambertMaterial({ color: "#48ad4b", transparent: true })
};
const healthBackgroundMaterial = new THREE.MeshLambertMaterial({
  color: "#321b1b",
  emissive: "#321b1b",
  transparent: true
});
const healthForegroundMaterial = new THREE.MeshLambertMaterial({
  color: "#e53935",
  emissive: "#e53935",
  transparent: true
});

function toLambertMaterial(material) {
  return new THREE.MeshLambertMaterial({
    name: material.name,
    color: material.color,
    map: material.map,
    emissive: material.emissive ?? 0,
    emissiveMap: material.emissiveMap ?? null,
    emissiveIntensity: material.emissiveIntensity ?? 1,
    transparent: material.transparent,
    opacity: material.opacity,
    alphaTest: material.alphaTest,
    side: material.side,
    vertexColors: material.vertexColors,
    flatShading: material.flatShading
  });
}

export function setMeshOpacity(mesh, opacity) {
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
  foreground.position.z = 0.01;
  bar.add(background, foreground);
  bar.userData.foreground = foreground;
  bar.position.y = 2.65;
  return bar;
}

export function createEnemy(definition, onHit) {
  const enemy = {
    health: definition.type === "cylinder" ? 5 : 3,
    maxHealth: definition.type === "cylinder" ? 5 : 3,
    alive: true,
    groundState: { velocityY: 0, isGrounded: false },
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
        object.material = Array.isArray(object.material)
          ? object.material.map(toLambertMaterial) : toLambertMaterial(object.material);
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
