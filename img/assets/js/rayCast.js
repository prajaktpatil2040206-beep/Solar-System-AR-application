import { Raycaster, Vector2 } from "three";
import { camera } from "./camera/camera.js";
import scene from "./scene.js";
import { moon } from "./meshes/planets.js";
import sun from "./meshes/sun.js";
import galaxy from "./meshes/galaxy.js";
import { applyVisualEffect } from "./animation/VisualEffects.js";

/*
   Used the below links to teach myself on how to use the raycasting:
   https://www.youtube.com/watch?v=CbUhot3K-gc
   https://threejs.org/docs/#api/en/core/Raycaster
*/

const raycaster = new Raycaster();
const pointer = new Vector2();
raycaster.layers.set(1);

function onPointerMove(e) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;

}

document.querySelector('.webgl').addEventListener('pointermove', onPointerMove);


function rayCast() {
    
    raycaster.setFromCamera(pointer, camera);
    const intersected = raycaster.intersectObjects(scene.children)[0]? raycaster.intersectObjects(scene.children)[0].object : false; // making sure the first intersected entity has an object because we need it in applyVisualEffect, otherwise everything explodes

    if (intersected == false) return;
    if (intersected.uuid == moon.mesh.uuid) return;
    if (intersected.uuid == sun.mesh.uuid) return;
    if (intersected.uuid == galaxy.mesh.uuid) return;
    if (intersected.hasOwnProperty('isRing')) return;

    applyVisualEffect(intersected);
}

export default rayCast;