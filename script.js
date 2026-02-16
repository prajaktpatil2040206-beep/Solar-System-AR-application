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


// ---------- AR SETUP ----------

const arToolkitSource = new THREEx.ArToolkitSource({
  sourceType: "webcam"
});

arToolkitSource.init(() => onResize());

window.addEventListener("resize", () => onResize());

function onResize() {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }
}

const arToolkitContext = new THREEx.ArToolkitContext({
  cameraParametersUrl:
    "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/data/camera_para.dat",
  detectionMode: "mono"
});

arToolkitContext.init(() => {
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});


// ---------- MARKER ----------

const markerRoot = new THREE.Group();
scene.add(markerRoot);

new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
  type: "pattern",
  patternUrl:
    "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/data/patt.hiro"
});


// ---------- SOLAR SYSTEM ROOT ----------

const solarSystem = new THREE.Group();

/* SCALE DOWN FOR AR SPACE */
solarSystem.scale.set(0.05, 0.05, 0.05);

markerRoot.add(solarSystem);


// ---------- TEXTURES ----------

const textureLoader = new THREE.TextureLoader();

const sunTexture = textureLoader.load("images/sun.jpg");
const mercuryTexture = textureLoader.load("images/mercury.jpg");
const venusTexture = textureLoader.load("images/venus.jpg");
const earthTexture = textureLoader.load("images/earth.jpg");
const marsTexture = textureLoader.load("images/mars.jpg");
const jupiterTexture = textureLoader.load("images/jupiter.jpg");
const saturnTexture = textureLoader.load("images/saturn.jpg");
const uranusTexture = textureLoader.load("images/uranus.jpg");
const neptuneTexture = textureLoader.load("images/neptune.jpg");
const saturnRingTexture = textureLoader.load("images/saturn_ring.png");
const uranusRingTexture = textureLoader.load("images/uranus_ring.png");


// ---------- LIGHTING ----------

const sunLight = new THREE.PointLight(0xffffff, 2, 300);
solarSystem.add(sunLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
solarSystem.add(ambientLight);


// ---------- SUN ----------

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(15, 50, 50),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);

solarSystem.add(sun);


// ---------- PLANET FUNCTION ----------

function generatePlanet(size, texture, radius, ring) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshStandardMaterial({ map: texture })
  );

  const obj = new THREE.Object3D();
  mesh.position.x = radius;
  obj.add(mesh);

  if (ring) {
    const ringMesh = new THREE.Mesh(
      new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32),
      new THREE.MeshBasicMaterial({
        map: ring.texture,
        side: THREE.DoubleSide,
        transparent: true
      })
    );

    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.x = radius;

    obj.add(ringMesh);
  }

  solarSystem.add(obj);

  return { obj, mesh };
}


// ---------- PLANETS ----------

const planets = [
  { name: "Mercury", ...generatePlanet(3.2, mercuryTexture, 28), orbit: 0.004, rotate: 0.004 },
  { name: "Venus", ...generatePlanet(5.8, venusTexture, 44), orbit: 0.015, rotate: 0.002 },
  { name: "Earth", ...generatePlanet(6, earthTexture, 62), orbit: 0.01, rotate: 0.02 },
  { name: "Mars", ...generatePlanet(4, marsTexture, 78), orbit: 0.008, rotate: 0.018 },
  { name: "Jupiter", ...generatePlanet(12, jupiterTexture, 100), orbit: 0.002, rotate: 0.04 },
  { name: "Saturn", ...generatePlanet(10, saturnTexture, 138, {
      innerRadius: 10,
      outerRadius: 20,
      texture: saturnRingTexture
    }), orbit: 0.0009, rotate: 0.038 },
  { name: "Uranus", ...generatePlanet(7, uranusTexture, 176, {
      innerRadius: 7,
      outerRadius: 12,
      texture: uranusRingTexture
    }), orbit: 0.0004, rotate: 0.03 },
  { name: "Neptune", ...generatePlanet(7, neptuneTexture, 200), orbit: 0.0001, rotate: 0.032 }
];


// ---------- GUI ----------

const options = {
  speed: 1,
  isPaused: false
};

const gui = new dat.GUI();
gui.add(options, "speed", 0, 10);
gui.add(options, "isPaused");


// ---------- ANIMATION ----------

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  if (arToolkitSource.ready) {
    arToolkitContext.update(arToolkitSource.domElement);
  }

  const delta = clock.getDelta();

  if (!options.isPaused && markerRoot.visible) {
    sun.rotation.y += delta * 0.5 * options.speed;

    planets.forEach(p => {
      p.obj.rotation.y += p.orbit * options.speed;
      p.mesh.rotation.y += p.rotate * options.speed;
    });
  }

  renderer.render(scene, camera);
}

animate();
