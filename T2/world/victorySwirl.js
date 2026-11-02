import { MathUtils } from "three";

export function createVictorySwirl(renderer, scene, camera) {
  let canvas;
  try {
    canvas = window.fx.canvas();
  } catch (error) {
    console.warn("Swirl indisponivel neste navegador.", error);
    return () => 1;
  }

  renderer.render(scene, camera);
  const texture = canvas.texture(renderer.domElement);
  const { width, height } = renderer.domElement;
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", zIndex: "999",
    background: "#071226", pointerEvents: "none"
  });
  Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let elapsed = 0;
  let finished = false;

  return (delta) => {
    if (finished) return 1;
    elapsed += delta;
    const progress = MathUtils.clamp(elapsed / (reducedMotion ? 0.6 : 2.2), 0, 1);
    canvas.draw(texture)
      .swirl(width / 2, height / 2, Math.hypot(width, height) / 2, reducedMotion ? 0 : progress ** 2 * 16)
      .update();
    canvas.style.opacity = String(1 - MathUtils.smoothstep(progress, 0.65, 1));
    if (progress === 1) {
      finished = true;
      texture.destroy();
      overlay.remove();
      const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      context.getExtension("WEBGL_lose_context")?.loseContext();
    }
    return MathUtils.smoothstep(progress, 0.75, 1);
  };
}
