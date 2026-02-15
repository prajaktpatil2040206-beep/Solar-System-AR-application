import { camera } from "../camera/camera.js";
import { pause } from "../utility/pause_ms.js";
import planetRenderer from "../renderers/renderer.js";


// getting the elements we are going to manipulate or listen for evenets on:
const displayOrTouchDiv = document.querySelector('#prompt');
const confirmBtn = document.querySelector('#confirm');
const aboutBtn = document.querySelector('#aboutBtn');
const aboutInfo = document.querySelector('#aboutInfo');
const aboutCloseBtn = document.querySelector('#aboutCloseBtn');
const canvas = document.querySelector('.webgl');

//delegation click event on the initial div for determing what listener to attach and to which element - scroll to window or wheel to canvas:

displayOrTouchDiv.addEventListener('click', (e)=> {

    if (e.target.tagName !== 'BUTTON') return

    if (e.target.id == "touch-screen") {

        window.addEventListener("scroll", isWheeling);
    }
    else if (e.target.id == "desktop"){

        canvas.addEventListener("wheel", isWheeling)
    }
    removeParentElement(e);
})

//pause logic on scene click:
canvas.addEventListener("mousedown", (e) => pause.value = true);
canvas.addEventListener("mouseup", (e) => pause.value = false);

//buttons listeners
confirmBtn.addEventListener("click", removeParentElement );
aboutCloseBtn.addEventListener("click", removeParentElement);
aboutBtn.addEventListener("click", (e)=> {

    aboutInfo.classList.add("animatedText");
    removeParentElement(e);
})

//window resize listener
window.addEventListener(
    "resize",
    () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        planetRenderer.setSize(window.innerWidth, window.innerHeight);
    },
);

// creating a isWheeling object with documentDeltaY and isWheeling which will be used in the animation() function at main.js
let isWheeLing = false;
let documentDeltaY = 0;

let wheelEventData = {

    isWheeLing,
    documentDeltaY
}

// listener-related handler functions:
function removeParentElement(e) {

    e.target.parentElement.remove();
}

function isWheeling(e) {
    wheelEventData.documentDeltaY = e.deltaY;
    wheelEventData.isWheeLing = true;
}

export {canvas, wheelEventData}