

//the function is used in cameraMainFunction, they are tightly coupled I have to make the logic more abstract
function animateText (planetId, previousPlanetId = null) {

    document.getElementById(planetId).classList.add('animatedText')
    
    if (previousPlanetId == null) return;

    document.getElementById(previousPlanetId).classList.remove('animatedText')

}

export default animateText