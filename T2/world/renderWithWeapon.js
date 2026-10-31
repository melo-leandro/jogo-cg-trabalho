import { CAMADA_ARMA } from "../models/gun.js";

export function renderWithWeapon(renderer, scene, camera, arma) {
    const camadasOriginais = camera.layers.mask;

    camera.layers.set(0);
    renderer.render(scene, camera);

    if (arma.visible) {
        // as luzes também precisam estar na camada da arma para iluminá-la
        scene.traverse((objeto) => {
            if (objeto.isLight) objeto.layers.enable(CAMADA_ARMA);
        });

        const autoClear = renderer.autoClear;
        const atualizarSombras = renderer.shadowMap.autoUpdate;
        const fundo = scene.background;

        renderer.autoClear = false;
        renderer.shadowMap.autoUpdate = false;
        scene.background = null;              
        renderer.clearDepth();

        camera.layers.set(CAMADA_ARMA);
        renderer.render(scene, camera);

        renderer.autoClear = autoClear;
        renderer.shadowMap.autoUpdate = atualizarSombras;
        scene.background = fundo;
    }

    camera.layers.mask = camadasOriginais;
}
