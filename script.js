import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";

// --- SETUP RENDERER (with alpha for AR background) ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- SCENE & CAMERA ---
const scene = new THREE.Scene();
const camera = new THREE.Camera(); // AR.js will update projection
scene.add(camera);

// --- LIGHTS ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const sunLight = new THREE.PointLight(0xffffff, 4, 0); // attached to sun later

// --- AR.js CONTEXT (proper initialization) ---
const ar = new ARjs.Context({
  cameraParametersUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/data/camera_para.dat',
  detectionMode: 'mono',
  maxDetectionRate: 60,
  canvasWidth: 640,
  canvasHeight: 480,
});

// Initialize AR and start camera feed
ar.init(() => {
  // Once initialized, copy projection matrix to camera
  camera.projectionMatrix.copy(ar.getProjectionMatrix());
  // Start AR processing
  ar.start();
});

// --- MARKER ROOT GROUP ---
const markerRoot = new THREE.Group();
scene.add(markerRoot);

// Marker controls for Hiro pattern
const markerControls = new ARjs.MarkerControls(ar, markerRoot, {
  type: 'pattern',
  patternUrl: ARjs.Pattern.Hiro,  // built-in Hiro pattern
  changeMatrixMode: 'modelViewMatrix'
});

// --- SOLAR SYSTEM GROUP (attached to marker, initially hidden) ---
const solarSystemGroup = new THREE.Group();
solarSystemGroup.scale.set(0.02, 0.02, 0.02);
solarSystemGroup.visible = false;
markerRoot.add(solarSystemGroup);

// Show/hide on marker detection
markerControls.addEventListener('markerFound', () => {
  solarSystemGroup.visible = true;
});
markerControls.addEventListener('markerLost', () => {
  solarSystemGroup.visible = false;
});

// --- TEXTURE LOADER ---
const textureLoader = new THREE.TextureLoader();
const loadTexture = (name) => textureLoader.load(`images/${name}.jpg`);

const sunTexture = loadTexture('sun');
const mercuryTexture = loadTexture('mercury');
const venusTexture = loadTexture('venus');
const earthTexture = loadTexture('earth');
const marsTexture = loadTexture('mars');
const jupiterTexture = loadTexture('jupiter');
const saturnTexture = loadTexture('saturn');
const uranusTexture = loadTexture('uranus');
const neptuneTexture = loadTexture('neptune');
const saturnRingTexture = textureLoader.load('images/saturn_ring.png');
const uranusRingTexture = textureLoader.load('images/uranus_ring.png');

// --- CREATE SUN ---
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(15, 50, 50),
  new THREE.MeshStandardMaterial({ map: sunTexture })
);
sun.position.set(0, 0, 0);
sun.add(sunLight);
solarSystemGroup.add(sun);

// --- ARRAY FOR PLANETS ---
const planets = [];
const pathOfPlanets = []; // for toggling visibility

// Helper: create orbit path (adds to solarSystemGroup)
function createOrbitPath(radius, color) {
  const material = new THREE.LineBasicMaterial({ color });
  const points = [];
  for (let i = 0; i <= 100; i++) {
    const angle = (i / 100) * Math.PI * 2;
    points.push(radius * Math.cos(angle), 0, radius * Math.sin(angle));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const loop = new THREE.LineLoop(geometry, material);
  solarSystemGroup.add(loop);
  return loop;
}

// Helper: create a planet (with optional rings)
function createPlanet(size, texture, distance, ring = null) {
  const geometry = new THREE.SphereGeometry(size, 50, 50);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);

  const planetGroup = new THREE.Group();
  mesh.position.set(distance, 0, 0);
  planetGroup.add(mesh);

  if (ring) {
    const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
    const ringMat = new THREE.MeshBasicMaterial({ map: ring.ringmat, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(distance, 0, 0);
    ringMesh.rotation.x = -0.5 * Math.PI;
    planetGroup.add(ringMesh);
  }

  solarSystemGroup.add(planetGroup);
  return { group: planetGroup, mesh };
}

// Planet data
const planetData = [
  { name: 'Mercury', size: 3.2, tex: mercuryTexture, dist: 28 },
  { name: 'Venus',   size: 5.8, tex: venusTexture,   dist: 44 },
  { name: 'Earth',   size: 6,   tex: earthTexture,   dist: 62 },
  { name: 'Mars',    size: 4,   tex: marsTexture,    dist: 78 },
  { name: 'Jupiter', size: 12,  tex: jupiterTexture, dist: 100 },
  { name: 'Saturn',  size: 10,  tex: saturnTexture,  dist: 138, ring: { innerRadius: 10, outerRadius: 20, ringmat: saturnRingTexture } },
  { name: 'Uranus',  size: 7,   tex: uranusTexture,  dist: 176, ring: { innerRadius: 7, outerRadius: 12, ringmat: uranusRingTexture } },
  { name: 'Neptune', size: 7,   tex: neptuneTexture, dist: 200 }
];

planetData.forEach(data => {
  const { group, mesh } = createPlanet(data.size, data.tex, data.dist, data.ring || null);
  planets.push({
    name: data.name,
    group,
    mesh,
    speedData: { orbitSpeed: 0.001, rotateSpeed: 0.01 } // placeholder
  });
  const color = true ? 0xffffff : 0x333333; // will be updated via GUI
  const path = createOrbitPath(data.dist, color);
  pathOfPlanets.push(path);
});

// Assign real speeds (as in original)
planets[0].speedData = { orbitSpeed: 0.004, rotateSpeed: 0.004 }; // Mercury
planets[1].speedData = { orbitSpeed: 0.015, rotateSpeed: 0.002 }; // Venus
planets[2].speedData = { orbitSpeed: 0.01, rotateSpeed: 0.02 };   // Earth
planets[3].speedData = { orbitSpeed: 0.008, rotateSpeed: 0.018 }; // Mars
planets[4].speedData = { orbitSpeed: 0.002, rotateSpeed: 0.04 };  // Jupiter
planets[5].speedData = { orbitSpeed: 0.0009, rotateSpeed: 0.038 }; // Saturn
planets[6].speedData = { orbitSpeed: 0.0004, rotateSpeed: 0.03 };  // Uranus
planets[7].speedData = { orbitSpeed: 0.0001, rotateSpeed: 0.032 }; // Neptune

// --- GUI OPTIONS ---
const options = {
  "Real view": true,
  "Show path": true,
  speed: 1,
  isPaused: false,
  "Dark Mode": true
};

// --- DAT.GUI ---
const gui = new dat.GUI();
gui.add(options, "Real view").onChange(val => ambientLight.intensity = val ? 0 : 0.5);
gui.add(options, "Show path").onChange(val => pathOfPlanets.forEach(p => p.visible = val));
gui.add(options, "isPaused").name("Pause Animation");
gui.add(options, "Dark Mode").onChange(isDark => {
  pathOfPlanets.forEach(path => {
    path.material.color.setHex(isDark ? 0xffffff : 0x333333);
  });
  tooltip.style.color = isDark ? "white" : "black";
  tooltip.style.background = isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)";
});
gui.add(options, "speed", 0, 20);

// Planet speed folders
planets.forEach(({ name, speedData }) => {
  const folder = gui.addFolder(name);
  folder.add(speedData, "orbitSpeed", 0, 0.05).name("Orbit Speed");
  folder.add(speedData, "rotateSpeed", 0, 0.05).name("Self Rotation");
  folder.open();
});

// --- TOOLTIP (hover info) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseX = 0, mouseY = 0;

const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.padding = "4px 8px";
tooltip.style.background = "rgba(0,0,0,0.6)";
tooltip.style.color = "white";
tooltip.style.borderRadius = "5px";
tooltip.style.pointerEvents = "none";
tooltip.style.zIndex = "1000";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  mouse.x = (mouseX / window.innerWidth) * 2 - 1;
  mouse.y = -(mouseY / window.innerHeight) * 2 + 1;
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  // Update AR.js (processes camera frame and marker detection)
  ar.update(scene);

  const delta = clock.getDelta();

  if (!options.isPaused && solarSystemGroup.visible) {
    // Sun rotation
    sun.rotateY(delta * options.speed * 0.5);

    // Planets
    planets.forEach(({ group, mesh, speedData }) => {
      group.rotateY(speedData.orbitSpeed * options.speed * delta * 60);
      mesh.rotateY(speedData.rotateSpeed * options.speed * delta * 60);
    });
  }

  // Raycasting for tooltip
  if (solarSystemGroup.visible) {
    const testMeshes = [sun, ...planets.map(p => p.mesh)];
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(testMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      tooltip.innerHTML = (hit === sun) ? "Sun" : (planets.find(p => p.mesh === hit)?.name || "");
      tooltip.style.display = "block";
      tooltip.style.left = (mouseX + 10) + "px";
      tooltip.style.top = (mouseY + 10) + "px";
    } else {
      tooltip.style.display = "none";
    }
  } else {
    tooltip.style.display = "none";
  }

  renderer.render(scene, camera);
}
animate();

// --- RESIZE HANDLER ---
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- DEBUG: Show message if marker not detected ---
const msg = document.createElement("div");
msg.style.position = "absolute";
msg.style.bottom = "20px";
msg.style.left = "20px";
msg.style.background = "rgba(0,0,0,0.7)";
msg.style.color = "white";
msg.style.padding = "8px 12px";
msg.style.borderRadius = "20px";
msg.style.fontFamily = "sans-serif";
msg.style.zIndex = "10000";
msg.innerText = "🔍 Point camera at Hiro marker";
document.body.appendChild(msg);

markerControls.addEventListener('markerFound', () => {
  msg.style.display = "none";
});
markerControls.addEventListener('markerLost', () => {
  msg.style.display = "block";
});