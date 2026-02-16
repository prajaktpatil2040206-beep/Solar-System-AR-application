// ---------------- SCENE SETUP ----------------

const scene = new THREE.Scene();
const camera = new THREE.Camera();
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ---------------- LIGHTING (CRITICAL FIX) ----------------

// Bright ambient light → prevents dark/invisible planets
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// Directional light → gives depth
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 2, 1);
scene.add(directionalLight);

// ---------------- AR TOOLKIT SOURCE ----------------

const arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: 'webcam',
});

arToolkitSource.init(() => onResize());

window.addEventListener('resize', () => onResize());

function onResize() {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);

    if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
}

// ---------------- AR TOOLKIT CONTEXT ----------------

const arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl:
        'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/data/camera_para.dat',

    detectionMode: 'mono',

    // ✅ PERFORMANCE + STABILITY BOOSTERS
    maxDetectionRate: 60,
    canvasWidth: 640,
    canvasHeight: 480,

    debug: false
});

arToolkitContext.init(() => {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

// ---------------- MARKER ROOT ----------------

const markerRoot = new THREE.Group();
scene.add(markerRoot);

// ---------------- MARKER CONTROLS (HEAVILY STABILIZED) ----------------

new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: 'pattern',
    patternUrl:
        'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/data/patt.hiro',

    // ✅ JITTER / SHAKE FIX
    smooth: true,
    smoothCount: 10,
    smoothTolerance: 0.01,
    smoothThreshold: 5,

    // ✅ Detection reliability
    minConfidence: 0.2
});

// ---------------- SOLAR SYSTEM ----------------

// Better materials for visibility
function createPlanet(size, color, xPos) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color });
    const planet = new THREE.Mesh(geometry, material);

    planet.position.set(xPos, 0, 0);
    markerRoot.add(planet);

    return planet;
}

// Sun
const sun = createPlanet(0.3, 0xFDB813, 0);

// Planets
const mercury = createPlanet(0.05, 0x888888, 0.6);
const venus   = createPlanet(0.07, 0xd4af37, 1.0);
const earth   = createPlanet(0.08, 0x2E86C1, 1.5);
const mars    = createPlanet(0.06, 0xC0392B, 2.0);

// ✅ SCALE BOOST → easier detection visibility
markerRoot.scale.set(1.2, 1.2, 1.2);

// ---------------- ANIMATION LOOP ----------------

function animate() {
    requestAnimationFrame(animate);

    if (arToolkitSource.ready)
        arToolkitContext.update(arToolkitSource.domElement);

    // Rotation animation
    mercury.rotation.y += 0.05;
    venus.rotation.y   += 0.04;
    earth.rotation.y   += 0.03;
    mars.rotation.y    += 0.02;
    sun.rotation.y     += 0.01;

    renderer.render(scene, camera);
}

animate();
