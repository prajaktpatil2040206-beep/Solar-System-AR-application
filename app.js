// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.Camera();
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0px';
renderer.domElement.style.left = '0px';
document.body.appendChild(renderer.domElement);

// AR Toolkit Source (Camera)
const arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: 'webcam'
});

arToolkitSource.init(() => {
    onResize();
});

window.addEventListener('resize', () => {
    onResize();
});

function onResize() {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
}

// AR Toolkit Context
const arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/data/camera_para.dat',
    detectionMode: 'mono'
});

arToolkitContext.init(() => {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

// Marker Root
const markerRoot = new THREE.Group();
scene.add(markerRoot);

// Hiro Marker Controls
new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: 'pattern',
    patternUrl: 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/data/patt.hiro'
});

// ---------------- SOLAR SYSTEM ----------------

// Sun
const sunGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.y = 0.5;
markerRoot.add(sun);

// Planet function
function createPlanet(size, color, xPos) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(xPos, 0.5, 0);
    markerRoot.add(planet);
    return planet;
}

// Planets
const mercury = createPlanet(0.05, 0x888888, 0.6);
const venus   = createPlanet(0.07, 0xd4af37, 0.9);
const earth   = createPlanet(0.08, 0x2E86C1, 1.3);
const mars    = createPlanet(0.06, 0xC0392B, 1.7);

// ---------------- ANIMATION LOOP ----------------

function animate() {
    requestAnimationFrame(animate);

    if (arToolkitSource.ready !== false)
        arToolkitContext.update(arToolkitSource.domElement);

    // Rotation animation
    mercury.rotation.y += 0.05;
    venus.rotation.y   += 0.04;
    earth.rotation.y   += 0.03;
    mars.rotation.y    += 0.02;

    renderer.render(scene, camera);
}

animate();
