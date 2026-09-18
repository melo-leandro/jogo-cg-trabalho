let enabled = false;

export function toggleBuildCamera() {
  enabled = !enabled;
  return enabled;
}

export function isBuildCameraEnabled() {
  return enabled;
}
