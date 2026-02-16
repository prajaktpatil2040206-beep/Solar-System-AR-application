import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";

// --- SETUP RENDERER, SCENE, CAMERA (AR.js will update projection) ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// Camera will be controlled by AR.js – use a basic THREE.Camera
const camera = new THREE.Camera();
scene.add(camera);

// --- AR.js CONTEXT ---
// Use default camera parameters from AR.js CDN
const ar = new ARjs.Context(renderer, camera, {
  cameraParametersUrl: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/data/camera_para.dat',
  detectionMode: 'mono',
});

// Initialize AR (this requests camera access and sets up tracking)
await ar.initialize();
ar.start();

// --- CREATE ROOT FOR THE MARKER ---
const markerRoot = new THREE.Group();
scene.add(markerRoot);

// Marker controls for Hiro pattern
const markerControls = new ARjs.MarkerControls(ar, markerRoot, {
  type: 'pattern',
  patternUrl: ARjs.Pattern.Hiro,  // built-in Hiro pattern
  changeMatrixMode: 'modelViewMatrix' // ensures correct placement
});

// --- SOLAR SYSTEM GROUP (will be added to markerRoot when marker is found) ---
const solarSystemGroup = new THREE.Group();
// Scale the whole system to fit nicely on the marker (original units too large)
// Factor 0.02 makes Neptune orbit ~4 units, sun radius ~0.3 – good visibility
solarSystemGroup.scale.set(0.02, 0.02, 0.02);
solarSystemGroup.visible = false; // hidden until marker detected
markerRoot.add(solarSystemGroup);

// Show/hide based on marker detection
markerControls.addEventListener('markerFound', () => {
  solarSystemGroup.visible = true;
});
markerControls.addEventListener('markerLost', () => {
  solarSystemGroup.visible = false;
});

// --- LIGHTS ---
// Ambient light (global)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Sun light – point light at sun position (will be added to solarSystemGroup later)
const sunLight = new THREE.PointLight(0xffffff, 4, 0, 0); // no decay
// (added to sun mesh in planet creation)

// --- TEXTURE LOADER ---
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('images/sun.jpg');
const mercuryTexture = textureLoader.load('images/mercury.jpg');
const venusTexture = textureLoader.load('images/venus.jpg');
const earthTexture = textureLoader.load('images/earth.jpg');
const marsTexture = textureLoader.load('images/mars.jpg');
const jupiterTexture = textureLoader.load('images/jupiter.jpg');
const saturnTexture = textureLoader.load('images/saturn.jpg');
const uranusTexture = textureLoader.load('images/uranus.jpg');
const neptuneTexture = textureLoader.load('images/neptune.jpg');
const saturnRingTexture = textureLoader.load('images/saturn_ring.png');
const uranusRingTexture = textureLoader.load('images/uranus_ring.png');

// --- CREATE SUN (add to solarSystemGroup) ---
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(15, 50, 50),
  new THREE.MeshStandardMaterial({ map: sunTexture })
);
sun.position.set(0, 0, 0);
solarSystemGroup.add(sun);
// Add the point light as a child of sun so it moves with it
sun.add(sunLight);

// --- ARRAY TO HOLD PLANET DATA FOR ANIMATION & TOOLTIP ---
const planets = [];

// Helper to create orbital path (adds to solarSystemGroup)
const pathOfPlanets = []; // store line loops for visibility toggling
function createOrbitPath(radius, color) {
  const material = new THREE.LineBasicMaterial({ color });
  const geometry = new THREE.BufferGeometry();
  const points = [];
  for (let i = 0; i <= 100; i++) {
    const angle = (i / 100) * Math.PI * 2;
    points.push(radius * Math.cos(angle), 0, radius * Math.sin(angle));
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const loop = new THREE.LineLoop(geometry, material);
  solarSystemGroup.add(loop);
  return loop;
}

// Helper to create a planet (with optional rings)
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

// Create planets (using original sizes/distances; will be scaled by group)
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
  // Store for animation
  planets.push({
    name: data.name,
    group,
    mesh,
    speedData: { orbitSpeed: 0.001, rotateSpeed: 0.01 } // default, will be adjusted
  });
  // Create orbit path with color based on dark mode (initially white if dark mode on)
  const pathColor = options.DarkMode ? 0xffffff : 0x333333;
  const path = createOrbitPath(data.dist, pathColor);
  pathOfPlanets.push(path);
});

// Set custom speeds per planet (as in original)
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
  "Real view": true,   // toggles ambient light intensity
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
  // Update path colors
  pathOfPlanets.forEach((path, idx) => {
    path.material.color.setHex(isDark ? 0xffffff : 0x333333);
  });
  // Update tooltip style (tooltip created below)
  tooltip.style.color = isDark ? "white" : "black";
  tooltip.style.background = isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)";
});
gui.add(options, "speed", 0, 20);

// Per‑planet speed folders
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
tooltip.style.color = "white";
tooltip.style.padding = "4px 8px";
tooltip.style.background = "rgba(0,0,0,0.6)";
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

  // Update AR tracking (updates camera projection and marker roots)
  ar.update();

  const delta = clock.getDelta();

  // Animate planets only if not paused and marker is visible (or even if not, but we can skip)
  if (!options.isPaused && solarSystemGroup.visible) {
    // Sun rotation
    sun.rotateY(delta * options.speed * 0.5);

    // Planets
    planets.forEach(({ group, mesh, speedData }) => {
      group.rotateY(speedData.orbitSpeed * options.speed * delta * 60);
      mesh.rotateY(speedData.rotateSpeed * options.speed * delta * 60);
    });
  }

  // Raycasting for tooltip (only if group visible)
  if (solarSystemGroup.visible) {
    // Compile list of meshes to test (sun + planet meshes)
    const testMeshes = [sun, ...planets.map(p => p.mesh)];
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(testMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit === sun) {
        tooltip.innerHTML = "Sun";
      } else {
        const planet = planets.find(p => p.mesh === hit);
        if (planet) tooltip.innerHTML = planet.name;
      }
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