import { AmbientLight, PointLight, Scene } from "three";
import { planets} from "./meshes/planets.js";
import sun from './meshes/sun.js'
import galaxy from "./meshes/galaxy.js";
import {camera} from "./camera/camera.js";

//-------------------SCENE PREPARATION---------------
const scene = new Scene();

//ambient light settings:
const ambientLight = new AmbientLight(0xFFFFFF, 0.05);
ambientLight.layers.set(1);

//point light settings - it is in the center of the Sun, bright, unlimited distance reach and no light dispersion:
const pointLight = new PointLight( 0xFDB813,0.5,0,0);
pointLight.position.set(0, 0, 0);
pointLight.layers.set(1);

//adding the entities to the scene:
scene.add(ambientLight);
scene.add(pointLight);
scene.add(galaxy.mesh);
scene.add(sun.mesh);

//I asked chat gpt whether there is a direction vector for the position the camera is looking at so I could calculate the angle after camera position change. 
//He showed me the below amazing function:
camera.lookAt(sun.mesh.position);

//All planets pivots are attached to the PointLight XYZ 0,0,0:
for (let planet of planets) {

    pointLight.add(planet.pivot);
}

export default scene;

