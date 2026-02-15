import { IcosahedronGeometry, MeshBasicMaterial, FrontSide } from "three";
import {SpaceObject} from "../SpaceObjectBuilder.js";

const sun = new SpaceObject('Sun',IcosahedronGeometry, [20,8], MeshBasicMaterial, 'sun.png', FrontSide, true, [0,0,0], 1, 1000)

export default sun;

