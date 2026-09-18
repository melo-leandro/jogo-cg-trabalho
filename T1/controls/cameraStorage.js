const cameraStorageKey = "t1-camera-state";

export function restoreCamera(camera) {
  try {
    const savedCamera = JSON.parse(localStorage.getItem(cameraStorageKey));
    const validPosition = savedCamera?.position?.length === 3 && savedCamera.position.every(Number.isFinite);
    const validQuaternion = savedCamera?.quaternion?.length === 4 && savedCamera.quaternion.every(Number.isFinite);

    if (validPosition && validQuaternion) {
      camera.position.fromArray(savedCamera.position);
      camera.quaternion.fromArray(savedCamera.quaternion).normalize();
    }
  } catch (error) {
    console.warn("Nao foi possivel restaurar a camera.", error);
  }
}

export function saveCamera(camera) {
  try {
    localStorage.setItem(cameraStorageKey, JSON.stringify({
      position: camera.position.toArray(),
      quaternion: camera.quaternion.toArray()
    }));
  } catch (error) {
    console.warn("Nao foi possivel salvar a camera.", error);
  }
}
