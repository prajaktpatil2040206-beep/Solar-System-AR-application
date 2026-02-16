// Import Three.js and OrbitControls from CDN
import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";

// Create WebGL renderer and add it to the page
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// GUI options
const options = {
  "Real view": true,
  "Show path": true,
  speed: 1,
  isPaused: false,
  "Dark Mode": true
};

// Load textures for all celestial bodies
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

// Create the scene
const scene = new THREE.Scene();

// Set cube texture background (skybox effect)
const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeTexture = cubeTextureLoader.setPath('images/').load([
  'stars.jpg', 'stars.jpg', 'stars.jpg',
  'stars.jpg', 'stars.jpg', 'stars.jpg'
]);
scene.background = cubeTexture;

// Set up the camera (field of view, aspect ratio, near/far)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-50, 90, 150);

// Add orbit controls for mouse interaction
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.minDistance = 30;
orbit.maxDistance = 500;
orbit.enableDamping = true;
orbit.dampingFactor = 0.05;

// Create the sun using basic material and texture
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(15, 50, 50),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);
scene.add(sun);

// Add a point light at the sun's location
const sunLight = new THREE.PointLight(0xffffff, 4, 300);
scene.add(sunLight);

// Add ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0);
scene.add(ambientLight);

// Helper function to draw orbital paths
const path_of_planets = [];
function createLineLoopWithMesh(radius, isDark, width) {
  const color = isDark ? 0xffffff : 0x333333;
  const material = new THREE.LineBasicMaterial({ color, linewidth: width });
  const geometry = new THREE.BufferGeometry();
  const points = [];

  for (let i = 0; i <= 100; i++) {
    const angle = (i / 100) * Math.PI * 2;
    points.push(radius * Math.cos(angle), 0, radius * Math.sin(angle));
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const loop = new THREE.LineLoop(geometry, material);
  scene.add(loop);
  path_of_planets.push(loop);
}

// Function to generate a planet with optional rings
function genratePlanet(size, texture, x, ring) {
  const geometry = new THREE.SphereGeometry(size, 50, 50);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);

  const planetObj = new THREE.Object3D();
  mesh.position.set(x, 0, 0);
  planetObj.add(mesh);

  if (ring) {
    const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
    const ringMat = new THREE.MeshBasicMaterial({ map: ring.ringmat, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(x, 0, 0);
    ringMesh.rotation.x = -0.5 * Math.PI;
    planetObj.add(ringMesh);
  }

  scene.add(planetObj);
  createLineLoopWithMesh(x, options["Dark Mode"], 3);

  return { planetObj, planet: mesh };
}

// List of planets with their properties
const planets = [
  { name: "Mercury", ...genratePlanet(3.2, mercuryTexture, 28), speedData: { orbitSpeed: 0.004, rotateSpeed: 0.004 } },
  { name: "Venus", ...genratePlanet(5.8, venusTexture, 44), speedData: { orbitSpeed: 0.015, rotateSpeed: 0.002 } },
  { name: "Earth", ...genratePlanet(6, earthTexture, 62), speedData: { orbitSpeed: 0.01, rotateSpeed: 0.02 } },
  { name: "Mars", ...genratePlanet(4, marsTexture, 78), speedData: { orbitSpeed: 0.008, rotateSpeed: 0.018 } },
  { name: "Jupiter", ...genratePlanet(12, jupiterTexture, 100), speedData: { orbitSpeed: 0.002, rotateSpeed: 0.04 } },
  { name: "Saturn", ...genratePlanet(10, saturnTexture, 138, { innerRadius: 10, outerRadius: 20, ringmat: saturnRingTexture }), speedData: { orbitSpeed: 0.0009, rotateSpeed: 0.038 } },
  { name: "Uranus", ...genratePlanet(7, uranusTexture, 176, { innerRadius: 7, outerRadius: 12, ringmat: uranusRingTexture }), speedData: { orbitSpeed: 0.0004, rotateSpeed: 0.03 } },
  { name: "Neptune", ...genratePlanet(7, neptuneTexture, 200), speedData: { orbitSpeed: 0.0001, rotateSpeed: 0.032 } }
];

// Setup raycasting and tooltip for planet hover info
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

// dat.GUI controls
const gui = new dat.GUI();
scene.background = options["Dark Mode"] ? cubeTexture : new THREE.Color("#f0f0f0");

// GUI toggles
const maxSpeed = new URL(window.location.href).searchParams.get("ms") * 1;
gui.add(options, "Real view").onChange(e => ambientLight.intensity = e ? 0 : 0.5);
gui.add(options, "Show path").onChange(e => path_of_planets.forEach(path => path.visible = e));
gui.add(options, "isPaused").name("Pause Animation");
gui.add(options, "Dark Mode").onChange((isDark) => {
  scene.background = isDark ? cubeTexture : new THREE.Color("#f0f0f0");
  document.body.style.backgroundColor = isDark ? "#000" : "#fff";
  tooltip.style.color = isDark ? "white" : "black";
  tooltip.style.background = isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)";
  path_of_planets.forEach(p => scene.remove(p));
  path_of_planets.length = 0;
  planets.forEach(({ planetObj }) => createLineLoopWithMesh(planetObj.children[0].position.x, isDark, 3));
});
gui.add(options, "speed", 0, maxSpeed || 20);

// Add speed folders per planet
planets.forEach(({ name, speedData }) => {
  const folder = gui.addFolder(name);
  folder.add(speedData, "orbitSpeed", 0, 0.05).name("Orbit Speed");
  folder.add(speedData, "rotateSpeed", 0, 0.05).name("Self Rotation");
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();

  if (!options.isPaused) {
    sun.rotateY(delta * options.speed * 0.5);
    planets.forEach(({ planetObj, planet, speedData }) => {
      planetObj.rotateY(speedData.orbitSpeed * options.speed * delta * 60);
      planet.rotateY(speedData.rotateSpeed * options.speed * delta * 60);
    });
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([sun, ...planets.map(p => p.planet)]);
  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    if (intersected === sun) {
      tooltip.innerHTML = "Sun";
    } else {
      const hoveredPlanet = planets.find(p => p.planet === intersected);
      if (hoveredPlanet) {
        tooltip.innerHTML = hoveredPlanet.name;
      }
    }
    tooltip.style.display = "block";
    tooltip.style.left = `${mouseX + 10}px`;
    tooltip.style.top = `${mouseY + 10}px`;
  } else {
    tooltip.style.display = "none";
  }
  orbit.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
