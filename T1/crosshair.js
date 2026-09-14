export function createCrosshair() {
    const crosshair = document.createElement("div");

    crosshair.innerHTML = "+";
    crosshair.style.position = "fixed";
    crosshair.style.left = "50%";
    crosshair.style.top = "50%";
    crosshair.style.transform = "translate(-50%, -50%)";
    crosshair.style.color = "red";
    crosshair.style.fontSize = "30px";
    crosshair.style.pointerEvents = "none";

    document.body.appendChild(crosshair);
}