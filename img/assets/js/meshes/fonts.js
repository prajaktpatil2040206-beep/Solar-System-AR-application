import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { Mesh, MeshBasicMaterial } from 'three';

/*
I helped myself with the below materials + chatGPT as the fontLoader module is not intuitive to use and
I had no time to think how to implement it in the SpaceObject Class.
Also the TextGeometry and FontLoader paths are different in the Three.js documentation so I had to find the correct directories in the file explorer.
Probably will fork and edit the documentation. 

https://threejs.org/docs/#examples/en/geometries/TextGeometry
https://threejs.org/docs/#examples/en/geometries/TextGeometry
https://www.youtube.com/watch?v=l7K9AMnesJQ
*/


const fontLoader = new FontLoader();
export async function attach_name_labels(planets) {

    return new Promise((resolve, reject) => {

        const promises = [];
        for (let planet of planets) {

            const fontPromise = new Promise((resolveFont, rejectFont) => {

                fontLoader.load('node_modules/three/examples/fonts/droid/droid_serif_regular.typeface.json', function (font) {

                    const geometry = new TextGeometry(planet['name'], {
                        font: font,
                        size: 4,
                        height: 1, // Height of the text (controls thickness) - asked GPT for how to make text mesh appear thinner
                        curveSegments: 12, // Number of points on the curves
                        bevelEnabled: false // Disable bevel for a thinner look
                    });

                    const material = new MeshBasicMaterial({

                        color: 0xffffff,

                    });
                    const nameMesh = new Mesh(geometry, material);
                    nameMesh.position.set(-5, 8, 0);
                    nameMesh.layers.set(2);
                    nameMesh['isLabel'] = true;
                    planet.nameMesh = nameMesh; //adding the mesh as a property to the planet object so I can customize the animation
                    planet.mesh[nameMesh.uuid] = nameMesh;  //added the nameMesh UUID reference to the planet mesh so the nameMesh could be accessed by its UUID because raycaster intercepts planets related to labels, not labels
                    planet.mesh.name_label_id = nameMesh.uuid; //adding the uuid of the labelmesh, so it can be accessed by the raycaster logic
                    planet.mesh.add(nameMesh);
                    console.log('Font loaded!');
                    resolveFont();
                }, function (e) {

                    rejectFont();
                    console.log('Font still loading!');

                })
            })
            promises.push(fontPromise);
        }

        Promise.allSettled(promises).then(() => {

            resolve(true);

        }).catch((error) => {
            reject(error);
        });
    })
}






