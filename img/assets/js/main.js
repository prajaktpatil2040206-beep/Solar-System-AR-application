
import scene from "./scene.js";
import sun from "./meshes/sun.js";
import galaxy from "./meshes/galaxy.js";
import rayCast from "./rayCast.js";
import { pause } from "./utility/pause_ms.js";
import { camera, cameraMainFunction, cameraAutoRotate } from "./camera/camera.js"
import planetRenderer from "./renderers/renderer.js";
import { planets, moon, nameLabelsLoaded } from "./meshes/planets.js";
import { pointNameLabelToCamera, resetVisualEffects } from "./animation/VisualEffects.js";
import { rotateSelf, rotatePivot } from "./animation/rotation.js";
import { Clock } from "three";
import { cameraControls } from "./camera/controls.js";
import { wheelEventData } from "./event-listeners/listeners.js";

const clock = new Clock();
let deltaTime;

const animate = () => {
    requestAnimationFrame(animate);

    if (nameLabelsLoaded == undefined) return;

    deltaTime = clock.getDelta();

    if (pause.value == false) {

        if (wheelEventData.isWheeLing) {

            cameraMainFunction(deltaTime, wheelEventData.documentDeltaY);
        }

        if (cameraControls !== null) {

            cameraControls.update();
        }

        cameraAutoRotate(deltaTime);
        rotateSelf([galaxy, moon, sun, ...planets], deltaTime);
        rotatePivot([moon, ...planets], deltaTime);
        resetVisualEffects([moon, ...planets]);
        pointNameLabelToCamera([...planets]);     //it is the planets nameLabels we are making look at the camera;
        wheelEventData.documentDeltaY = 0;             //zeroing out the deltaY, otherwise the cameraMainFunction will continue affecting the camera position
        wheelEventData.isWheeLing = false;             //just like the below comment - I want to be sure there won't be any side effects;
    }
    rayCast();
    planetRenderer.render(scene, camera);
};
animate();

//setTimeout(animate,1500) // waits 1.5 seconds before animation start just to make sure all the modules have loaded;

