const buildCameraStorageKey = "t1-build-camera-enabled";
let enabled = false;

try {
  enabled = localStorage.getItem(buildCameraStorageKey) === "true";
} catch (error) {
  console.warn("Nao foi possivel restaurar o modo construcao.", error);
}

export function toggleBuildCamera() {
  enabled = !enabled;

  try {
    localStorage.setItem(buildCameraStorageKey, enabled);
  } catch (error) {
    console.warn("Nao foi possivel salvar o modo construcao.", error);
  }

  return enabled;
}

export function isBuildCameraEnabled() {
  return enabled;
}
