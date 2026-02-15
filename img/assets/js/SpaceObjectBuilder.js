import { Mesh, TextureLoader, Object3D, RingGeometry, MeshLambertMaterial, DoubleSide } from "three";


const textureRoot = '/assets/textures/';
const textureLoader = new TextureLoader();

/*
    MeshStandardMaterial looks a little bit better, 
    but I read a little bit about meshes and it turned out it is more computational costly.
    I think MeshLambert is a good choise for this small project and will enhance the performance.
    The Sun will be made with BasicMaterial since it should always be bright.
*/

class SpaceObject {
    constructor(name, Geometry, geometryParamsArr, Material, texturePath, side, transparent, positionArr, layer, rotation_self) {

        //creating the mesh:
        this.name = name;
        this.mesh = new Mesh(
            new Geometry(...geometryParamsArr),
            new Material({
                map: textureLoader.load(textureRoot + texturePath),
                side: side,
                transparent: transparent,
                emissiveIntensity: 0.1,
            }));

        this.mesh.position.set(...positionArr);
        this.mesh.layers.set(layer);
        this.rotation_self = rotation_self / 1000; //rotation around self
        this.savedRotation_self = 0; //this will be needed for the cameraMainFunction, because we will be changing the rotation speed of the planes (as the camera will be attached to it)
    }
}

class OrbitingPlanet extends SpaceObject {

    constructor(name, Geometry, geometryParamsArr, Material, texturePath, side, transparent, positionArr, layer, rotation_self, rotation_pivot) {
        super(name, Geometry, geometryParamsArr, Material, texturePath, side, transparent, positionArr, layer, rotation_self)

        //creating the pivot the space object will rotate around:
        this.pivot = new Object3D();
        this.pivot.layers.set(1);
        this.pivot.add(this.mesh);
        this.rotation_pivot = rotation_pivot / 1000; //rotation around the pivot
        this.name_label_id = null // this will be populated with UUID of the font mesh when the font mesh is created in attach_name_labels functionality.
    }
}

class IcePlanet extends OrbitingPlanet {

    constructor(name, Geometry, geometryParamsArr, Material, texturePath, side, transparent, positionArr, layer, rotation_self, rotation_pivot) {
        super(name, Geometry, geometryParamsArr, Material, texturePath, side, transparent, positionArr, layer, rotation_self, rotation_pivot)

        this.mesh.material.roughness = 0;
        this.mesh.material.metalness = 0.4;
    }
}

class RingPlanet extends OrbitingPlanet {
    constructor(name, Geometry, geometryParamsArr, Material, texturePath, side, transparent, positionArr, layer, rotation_self, rotation_pivot) {
        super(name, Geometry, geometryParamsArr, Material, texturePath, side, transparent, positionArr, layer, rotation_self, rotation_pivot)

        this.ringMesh = new Mesh(
            new RingGeometry(17, 27, 32, 1),
            new MeshLambertMaterial({

                map: textureLoader.load(textureRoot + 'saturnRing.png'),
                side: DoubleSide,

            }));

        this.ringMesh.isRing = true;
        this.ringMesh.layers.set(1);
        this.ringMesh.rotateX(20);
        this.mesh.add(this.ringMesh);

    }
}

class PlanetWithSatellite extends OrbitingPlanet {
    constructor(name, Geometry, geometryParamsArr, Material, texturePath, side, transparent, positionArr, layer, rotation_self, rotation_pivot, satellite) {
        super(name, Geometry, geometryParamsArr, Material, texturePath, side, transparent, positionArr, layer, rotation_self, rotation_pivot)

        satellite.pivot.position.set(0, 0, 0);
        satellite.mesh.position.set(20, 0, 0);
        satellite.mesh.castShadow = true;
        this.mesh.add(satellite.pivot);
        this.mesh.receiveShadow = true;
    }
}



export { SpaceObject, OrbitingPlanet, RingPlanet, PlanetWithSatellite, IcePlanet }