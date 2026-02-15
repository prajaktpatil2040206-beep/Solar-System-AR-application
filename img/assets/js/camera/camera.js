import { PerspectiveCamera } from "three";
import { planets } from "../meshes/planets.js";
import sun from "../meshes/sun.js";
import { cameraControls, initiateControls } from "./controls.js";
import { showNameLabels } from "../animation/VisualEffects.js";
import animateText from "../animation/cssTextAnimate.js";

const [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto] = planets;

//ensure that the initial state of the scroller is always the top of the viewport
window.scroll(0, 0);

/*-------------------------CAMERA SETTINGS---------------------*/

const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 3000;

const camera = new PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 100;
camera.position.x = 0;
camera.position.y = 0;
camera.layers.set(1);

/*-------------------------CAMERA POSITION FUNCTIONALITY---------------------*/

let directionY = -0.1;
//changes the direction of the rotation of the camera around it's pivot Y axis on every 10 secs.
function adjustRotationY() {

    if (directionY < 0) {

        directionY = 0.1;
        return;
    }
    directionY = -0.1;
}
setInterval(adjustRotationY, 10 * 1000);

let cameraPivot = sun;

function cameraAutoRotate(deltaTime) {

    if (cameraControls !== null) return // stop autoRotations on cameraControls initialization as cameraControls have their own rotation method;
    cameraPivot.mesh.rotateY(directionY * deltaTime);
    camera.updateProjectionMatrix();
}

let previousCameraPivot = null;
let previousPlanetName = null;

function updatePivot(newPivotPlanet) {

    if (previousCameraPivot !== null) {
        previousCameraPivot.mesh.remove(camera);
        previousCameraPivot.rotation_self = previousCameraPivot.savedRotation_self;
    }

    cameraPivot = newPivotPlanet;
    cameraPivot.mesh.add(camera);
    cameraPivot.savedRotation_self = cameraPivot.rotation_self;
    cameraPivot.rotation_self = 0.1;
    previousCameraPivot = cameraPivot;
    previousPlanetName = cameraPivot.name.toLowerCase();
}


function cameraMainFunction(deltaTime, documentDeltaY) {

    const documentPosition = window.scrollY;

    if (documentPosition > 50 && documentPosition <= 1500) {

        if (cameraPivot.name == 'Mercury') {

            rotatePivotOnScroll(mercury.mesh, documentDeltaY, deltaTime);
            return
        } 
        camera.position.z = 20;
        animateText('mercury', previousPlanetName);
        updatePivot(mercury);
    }
    else if (documentPosition > 1500 && documentPosition <= 3000) {

        if (cameraPivot.name == 'Venus') {

            rotatePivotOnScroll(venus.mesh, documentDeltaY, deltaTime);
            return
        }
        camera.position.z = 50;
        animateText('venus', previousPlanetName);
        updatePivot(venus);
    }
    else if (documentPosition > 3000 && documentPosition <= 4500) {

        if (cameraPivot.name == 'Earth') {

            rotatePivotOnScroll(earth.mesh, documentDeltaY, deltaTime);
            return
        }
        animateText('earth', previousPlanetName);
        updatePivot(earth);
    }
    else if (documentPosition > 4500 && documentPosition <= 6000) {

        if (cameraPivot.name == 'Mars') {

            rotatePivotOnScroll(mars.mesh, documentDeltaY, deltaTime);
            return
        }
        animateText('mars', previousPlanetName);
        updatePivot(mars);
    }
    else if (documentPosition > 6000 && documentPosition <= 7500) {

        if (cameraPivot.name == 'Jupiter') {

            rotatePivotOnScroll(jupiter.mesh, documentDeltaY, deltaTime);
            return
        }
        camera.position.z = 100;
        animateText('jupiter', previousPlanetName);
        updatePivot(jupiter);
    }
    else if (documentPosition > 7500 && documentPosition <= 9000) {

        if (cameraPivot.name == 'Saturn') {

            rotatePivotOnScroll(saturn.mesh, documentDeltaY, deltaTime);
            return
        }
        camera.position.z = 100;
        animateText('saturn', previousPlanetName);
        updatePivot(saturn);
    }
    else if (documentPosition > 9000 && documentPosition <= 10500) {

        if (cameraPivot.name == 'Uranus') {

            rotatePivotOnScroll(uranus.mesh, documentDeltaY, deltaTime);
            return
        }
        camera.position.z = 30;
        animateText('uranus', previousPlanetName);
        updatePivot(uranus);
    }
    else if (documentPosition > 10500 && documentPosition <= 12000) {

        if (cameraPivot.name == 'Neptune') {

            rotatePivotOnScroll(neptune.mesh, documentDeltaY, deltaTime);
            return
        }
        animateText('neptune', previousPlanetName);
        updatePivot(neptune);
    }
    else if (documentPosition > 12000 && documentPosition <= 13000) {

        if (cameraPivot.name == 'Pluto') {

            rotatePivotOnScroll(pluto.mesh, documentDeltaY, deltaTime);
            return
        }   
        
        animateText('pluto', previousPlanetName);
        updatePivot(pluto);
    }
    else if (documentPosition > 13000) {

        if (cameraControls !== null) return;
        onCameraInitialize();
    }
}

function rotatePivotOnScroll(planet, documentDeltaY, deltaTime) {

    let multiplier = documentDeltaY > 0 ? 1 : -1;  //determines the spinning direction of the camera around it's pivot planet
    planet.rotateY(20 * multiplier * deltaTime);
    camera.updateProjectionMatrix();
}

function onCameraInitialize() {

    camera.position.z = 100;
    animateText('freeLook', previousPlanetName);
    pluto.mesh.remove(camera);
    showNameLabels.show = true;
    console.log('Camera initialized!');
    initiateControls();
}

export { camera, cameraPivot, cameraAutoRotate, cameraMainFunction };