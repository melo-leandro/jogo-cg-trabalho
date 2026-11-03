import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { castelo } from './castle.js';
import { createWallCollision, firstColliderHit } from '../mechanics/collision.js';
import { CSG } from '../libs/other/CSGMesh.js';

test('tower passage frames surround the arches without blocking the openings', () => {
    const frames = [];
    castelo.traverse(object => {
        if (object.name === 'towerPassageFrame') frames.push(object);
    });
    assert.equal(frames.length, 8, 'both passages of all four towers have frames');
    const colliders = createWallCollision([castelo], true);
    const projectileColliders = createWallCollision([castelo]);

    for (const frame of frames) {
        const tower = frame.parent;
        const inwardX = tower.position.x === 72 ? 1 : -1;
        const inwardZ = tower.position.z < 0 ? 1 : -1;
        const height = tower.position.x === 119 && tower.position.z === 20 ? 4 : 3;
        frame.geometry.computeBoundingBox();
        const size = frame.geometry.boundingBox.getSize(new THREE.Vector3());
        const alongZ = size.z > size.x;
        const mesh = new THREE.Mesh(frame.geometry, frame.material);
        const direction = new THREE.Vector3(alongZ ? 0 : -inwardX, 0, alongZ ? -inwardZ : 0);
        const origin = new THREE.Vector3(alongZ ? inwardX * 2 : inwardX * 7,
            height + 0.5, alongZ ? inwardZ * 7 : inwardZ * 2);
        const ray = new THREE.Raycaster(origin, direction);
        assert.equal(ray.intersectObject(mesh).length, 0, 'doorway stays open');
        const allFrames = tower.children.filter(child => child.name === 'towerPassageFrame')
            .map(frame => new THREE.Mesh(frame.geometry, frame.material));
        assert.equal(ray.intersectObjects(allFrames).length, 0,
            'the neighboring frame must not cross the doorway from inside the tower');
        ray.set(origin.clone().setY(height + 1.5), direction);
        assert.equal(ray.intersectObjects(allFrames).length, 0,
            'the arches must not cross above the neighboring opening');
        origin[alongZ ? 'x' : 'z'] += 0.8;
        ray.set(origin, direction);
        assert.ok(ray.intersectObject(mesh).length > 0, 'frame covers the jamb');
        origin[alongZ ? 'x' : 'z'] -= 0.8;
        origin.y = height + 1.9;
        ray.set(origin, direction);
        assert.ok(ray.intersectObject(mesh).length > 0, 'frame covers the arch');
        assert.ok(!colliders.includes(frame), 'decoration does not alter player collisions');
        const jambOrigin = new THREE.Vector3(
            alongZ ? inwardX * 2 + 0.8 : inwardX * 6,
            height + 0.5, alongZ ? inwardZ * 6 : inwardZ * 2 + 0.8
        );
        const hit = firstColliderHit(tower.localToWorld(jambOrigin), direction, 12, projectileColliders);
        assert.ok(hit, 'projectiles must hit the stone jamb');
        assert.equal(hit.object, frame, 'projectiles hit the visible frame surface');
        const doorwayOrigin = new THREE.Vector3(alongZ ? inwardX * 2 : inwardX * 6,
            height + 0.5, alongZ ? inwardZ * 6 : inwardZ * 2);
        assert.equal(firstColliderHit(tower.localToWorld(doorwayOrigin), direction, 12, projectileColliders),
            null, 'projectiles still pass through the doorway');
        const overlap = CSG.fromGeometry(tower.geometry).intersect(CSG.fromGeometry(frame.geometry));
        let volume = 0;
        for (const { vertices } of overlap.polygons) {
            const a = new THREE.Vector3().copy(vertices[0].pos);
            for (let i = 1; i < vertices.length - 1; i++) {
                const b = new THREE.Vector3().copy(vertices[i].pos);
                const c = new THREE.Vector3().copy(vertices[i + 1].pos);
                volume += a.dot(b.cross(c)) / 6;
            }
        }
        assert.ok(Math.abs(volume) < 0.0001, 'frame replaces the wall instead of overlapping it');
    }
});
