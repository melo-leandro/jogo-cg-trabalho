import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import * as THREE from 'three';
import { createEnemies } from './enemies.js';

test('enemies push the player only when their vertical bodies overlap', async () => {
    globalThis.ProgressEvent ??= class extends Event {
        constructor(type, init) { super(type); Object.assign(this, init); }
    };
    // Carrega os GLBs locais sem depender de um servidor HTTP para o teste.
    THREE.DefaultLoadingManager.setURLModifier(url =>
        'data:model/gltf-binary;base64,' + readFileSync(new URL('../' + url, import.meta.url)).toString('base64')
    );
    const loaded = new Promise((resolve, reject) => {
        THREE.DefaultLoadingManager.onLoad = resolve;
        THREE.DefaultLoadingManager.onError = reject;
    });
    const system = createEnemies(new THREE.Scene(), [], []);
    await loaded;
    const camera = new THREE.PerspectiveCamera();

    for (const enemy of system.enemies) {
        for (const [heightAboveCenter, shouldPush] of [[2, true], [0, true], [60, false], [-60, false], [6, false], [-2, false]]) {
            system.setNight(false);
            system.setNight(true);
            camera.position.copy(enemy.originPosition);
            camera.position[enemy.axis] += enemy.direction;
            camera.position.y += heightAboveCenter;
            const previous = camera.position.clone();
            system.update(0.1, camera, true);
            const displacement = camera.position[enemy.axis] - previous[enemy.axis];
            assert.ok(Math.abs(displacement - (shouldPush ? enemy.direction * 0.4 : 0)) < 0.00001,
                `enemy at ${enemy.originPosition.toArray()}: vertical offset ${heightAboveCenter}`);
        }
    }
});
