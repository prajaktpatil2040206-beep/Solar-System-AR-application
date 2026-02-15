import { WebGLRenderer } from "three";

const canvas = document.getElementsByTagName("canvas")[0];
const planetRenderer = new WebGLRenderer({
    
    canvas: canvas,
    antialias:true
});
planetRenderer.setSize(window.innerWidth, window.innerHeight);

export  default planetRenderer;