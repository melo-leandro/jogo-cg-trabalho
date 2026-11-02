import * as THREE from "three";

export function configureWorldShadows(scene) {
  scene.traverse((object) => {
    if (!object.isMesh || !object.visible) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
}

export function createDayNightLighting(scene, renderer) {
  const mainLight = new THREE.DirectionalLight();
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(2048, 2048);
  mainLight.shadow.camera.near = 100;
  mainLight.shadow.camera.far = 1000;
  mainLight.shadow.camera.left = -300;
  mainLight.shadow.camera.right = 300;
  mainLight.shadow.camera.bottom = -300;
  mainLight.shadow.camera.top = 300;
  mainLight.shadow.bias = -0.0005;
  mainLight.shadow.normalBias = 0.3;

  const fillLight = new THREE.AmbientLight();
  scene.add(mainLight, fillLight);

  let isNight = false;

  renderer.setClearColor("#87ceeb");
  mainLight.color.set("#fff4d6");
  mainLight.intensity = 2.2;
  mainLight.position.set(-300, 500, 300);
  fillLight.color.set("#b1e1ff");
  fillLight.intensity = 0.6;

  function toggleDayNight() {
    isNight = !isNight;

    if (isNight) {
      renderer.setClearColor("#07111f");
      mainLight.color.set("#b7c9ff");
      mainLight.intensity = 1.1;
      mainLight.position.set(-300, 400, -300);
      fillLight.color.set("#6177a6");
      fillLight.intensity = 0.35;
    } else {
      renderer.setClearColor("#87ceeb");
      mainLight.color.set("#fff4d6");
      mainLight.intensity = 2.2;
      mainLight.position.set(-300, 500, 300);
      fillLight.color.set("#b1e1ff");
      fillLight.intensity = 0.6;
    }

    return isNight;
  }

  return toggleDayNight;
}
