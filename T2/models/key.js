import * as THREE from "three";

// Chave: esfera com MeshPhongMaterial e emissive (única exceção ao Lambert no enunciado).
// Também usada por quem implementar os inimigos, ao soltar a chave.

export const RAIO_CHAVE = 0.5;
export const CORES_CHAVES = ["#ffb43a", "#3fa9ff", "#3ddc6b", "#b35cff"];
const geometriaChave = new THREE.SphereGeometry(RAIO_CHAVE, 32, 16);

export function criarChave(cor = "#ffc94a") {
  const chave = new THREE.Mesh(
    geometriaChave,
    new THREE.MeshPhongMaterial({
      color: cor,
      emissive: cor,
      emissiveIntensity: 2,
      specular: "#ffffff",
      shininess: 180,
      transparent: false,
      opacity: 1
    })
  );
  chave.name = "chave";
  chave.castShadow = false;
  chave.userData.ignoreCollision = true;
  return chave;
}
