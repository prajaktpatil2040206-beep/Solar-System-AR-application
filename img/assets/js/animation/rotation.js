
function rotateSelf(spaceObjectsArray, deltaTime) {

    for (let spaceObj of spaceObjectsArray ) {

        spaceObj.mesh.rotateY(spaceObj.rotation_self * deltaTime);
    }
}

function rotatePivot(spaceObjectsArray, deltaTime) {

    for (let spaceObj of spaceObjectsArray ) {

        spaceObj.pivot.rotateY(spaceObj.rotation_pivot * deltaTime);
    }
}

export {rotateSelf, rotatePivot}