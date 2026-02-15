import { camera } from "../camera/camera.js"

let showNameLabels = { show: false } // the state will change to true in cameraMainFunction once we deploy the OrbitControls.

function applyVisualEffect(intersected) {
    
    if (intersected.hasOwnProperty('isLabel')) return; // no effects are applied to font meshes;
    if (intersected.hasOwnProperty('isRing')) return; // no effects should be applied in case raycaster intercepts a planet ring;

    if (showNameLabels.show) {
        intersected[intersected['name_label_id']].lookAt(camera.position); //at this stage of the function the intercected objects are only planets. They contain a UUID of the label mesh and point to label mesh object. 
        intersected[intersected['name_label_id']].layers.set(1);
    }

    intersected.material.emissive.set(0x3D85C6); // only planets receive blue glow on hover
}

function resetVisualEffects(spaceObjectsArray) {

    for (let spaceObj of spaceObjectsArray) {

        spaceObj.mesh.material.emissive.set(0x000000);

        if (spaceObj.hasOwnProperty('nameMesh')) {

            spaceObj.nameMesh.layers.set(2)
        }
    }
}

function pointNameLabelToCamera(planets) { 

    if (showNameLabels.show == false) return

    for (let planet of planets) {
        planet.nameMesh.lookAt(camera.position);
    }
}

export { applyVisualEffect, resetVisualEffects, pointNameLabelToCamera, showNameLabels }