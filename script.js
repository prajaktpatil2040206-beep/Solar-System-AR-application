// Import Three.js and OrbitControls from CDN
import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";

// ============================================
// AR.JS INTEGRATION FOR HIRO MARKER TRACKING
// ============================================

// Create renderer with alpha for transparent background
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color('black'), 0);
document.body.appendChild(renderer.domElement);

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

// AR.js source (camera)
const arToolkitSource = new THREEx.ArToolkitSource({
  sourceType: 'webcam',
  sourceWidth: 1280,
  sourceHeight: 960,
  displayWidth: window.innerWidth,
  displayHeight: window.innerHeight
});

// Initialize AR source
arToolkitSource.init(() => {
  onResize();
  document.getElementById('loading').classList.add('hidden');
});

// Handle resize
function onResize() {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }
}

window.addEventListener('resize', onResize);

// AR.js context
const arToolkitContext = new THREEx.ArToolkitContext({
  cameraParametersUrl: 'https://raw.githack.com/AR-js-org/AR.js/master/data/data/camera_para.dat',
  detectionMode: 'mono',
  maxDetectionRate: 60,
  canvasWidth: 1280,
  canvasHeight: 960
});

arToolkitContext.init(() => {
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

// Hiro marker
const markerRoot = new THREE.Group();
scene.add(markerRoot);

const arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
  type: 'pattern',
  patternUrl: 'https://raw.githack.com/AR-js-org/AR.js/master/data/data/patt.hiro',
  changeMatrixMode: 'cameraTransformMatrix',
  smooth: true,
  smoothCount: 10,
  smoothTolerance: 0.01,
  smoothThreshold: 2
});

// Marker detection status
let markerVisible = false;
const markerStatus = document.getElementById('marker-status');

// ============================================
// SOLAR SYSTEM SETUP
// ============================================

// GUI options
const options = {
  "Real view": true,
  "Show path": true,
  speed: 1,
  isPaused: false,
  scale: 0.15
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

// Create solar system container that will be attached to marker
const solarSystemGroup = new THREE.Group();
markerRoot.add(solarSystemGroup);

// Apply initial scale to make solar system smaller for AR
solarSystemGroup.scale.set(options.scale, options.scale, options.scale);

// Rotate solar system to be more visible from top
solarSystemGroup.rotation.x = -Math.PI / 3; // Tilt for better view

// Create the sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(15, 50, 50),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);
solarSystemGroup.add(sun);

// Add a point light at the sun's location
const sunLight = new THREE.PointLight(0xffffff, 4, 300);
solarSystemGroup.add(sunLight);

// Add ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0);
solarSystemGroup.add(ambientLight);

// Helper function to draw orbital paths
const path_of_planets = [];
function createLineLoopWithMesh(radius, width) {
  const color = 0xffffff;
  const material = new THREE.LineBasicMaterial({ 
    color, 
    linewidth: width,
    transparent: true,
    opacity: 0.5
  });
  const geometry = new THREE.BufferGeometry();
  const points = [];

  for (let i = 0; i <= 100; i++) {
    const angle = (i / 100) * Math.PI * 2;
    points.push(radius * Math.cos(angle), 0, radius * Math.sin(angle));
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const loop = new THREE.LineLoop(geometry, material);
  solarSystemGroup.add(loop);
  path_of_planets.push(loop);
  return loop;
}

// Function to generate a planet with optional rings
function generatePlanet(size, texture, x, ring) {
  const geometry = new THREE.SphereGeometry(size, 50, 50);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);

  const planetObj = new THREE.Object3D();
  mesh.position.set(x, 0, 0);
  planetObj.add(mesh);

  if (ring) {
    const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      map: ring.ringmat, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(x, 0, 0);
    ringMesh.rotation.x = -0.5 * Math.PI;
    planetObj.add(ringMesh);
  }

  solarSystemGroup.add(planetObj);
  createLineLoopWithMesh(x, 3);

  return { planetObj, planet: mesh };
}

// List of planets with their properties
const planets = [
  { 
    name: "Mercury", 
    ...generatePlanet(3.2, mercuryTexture, 28), 
    speedData: { orbitSpeed: 0.004, rotateSpeed: 0.004 } 
  },
  { 
    name: "Venus", 
    ...generatePlanet(5.8, venusTexture, 44), 
    speedData: { orbitSpeed: 0.015, rotateSpeed: 0.002 } 
  },
  { 
    name: "Earth", 
    ...generatePlanet(6, earthTexture, 62), 
    speedData: { orbitSpeed: 0.01, rotateSpeed: 0.02 } 
  },
  { 
    name: "Mars", 
    ...generatePlanet(4, marsTexture, 78), 
    speedData: { orbitSpeed: 0.008, rotateSpeed: 0.018 } 
  },
  { 
    name: "Jupiter", 
    ...generatePlanet(12, jupiterTexture, 100), 
    speedData: { orbitSpeed: 0.002, rotateSpeed: 0.04 } 
  },
  { 
    name: "Saturn", 
    ...generatePlanet(10, saturnTexture, 138, { 
      innerRadius: 10, 
      outerRadius: 20, 
      ringmat: saturnRingTexture 
    }), 
    speedData: { orbitSpeed: 0.0009, rotateSpeed: 0.038 } 
  },
  { 
    name: "Uranus", 
    ...generatePlanet(7, uranusTexture, 176, { 
      innerRadius: 7, 
      outerRadius: 12, 
      ringmat: uranusRingTexture 
    }), 
    speedData: { orbitSpeed: 0.0004, rotateSpeed: 0.03 } 
  },
  { 
    name: "Neptune", 
    ...generatePlanet(7, neptuneTexture, 200), 
    speedData: { orbitSpeed: 0.0001, rotateSpeed: 0.032 } 
  }
];

// ============================================
// TOOLTIP SETUP
// ============================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseX = 0, mouseY = 0;

const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.color = "white";
tooltip.style.padding = "6px 12px";
tooltip.style.background = "rgba(0,0,0,0.8)";
tooltip.style.borderRadius = "8px";
tooltip.style.pointerEvents = "none";
tooltip.style.zIndex = "1000";
tooltip.style.display = "none";
tooltip.style.fontSize = "14px";
tooltip.style.fontWeight = "bold";
document.body.appendChild(tooltip);

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  mouse.x = (mouseX / window.innerWidth) * 2 - 1;
  mouse.y = -(mouseY / window.innerHeight) * 2 + 1;
});

// ============================================
// DAT.GUI CONTROLS
// ============================================

const gui = new dat.GUI();

gui.add(options, "Real view").onChange(e => {
  ambientLight.intensity = e ? 0 : 0.5;
});

gui.add(options, "Show path").onChange(e => {
  path_of_planets.forEach(path => path.visible = e);
});

gui.add(options, "isPaused").name("Pause Animation");

gui.add(options, "speed", 0, 20).name("Animation Speed");

gui.add(options, "scale", 0.05, 0.5).name("AR Scale").onChange(value => {
  solarSystemGroup.scale.set(value, value, value);
});

// Add speed folders per planet
planets.forEach(({ name, speedData }) => {
  const folder = gui.addFolder(name);
  folder.add(speedData, "orbitSpeed", 0, 0.05).name("Orbit Speed");
  folder.add(speedData, "rotateSpeed", 0, 0.05).name("Self Rotation");
});

// ============================================
// ANIMATION LOOP
// ============================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Update AR.js
  if (arToolkitSource.ready !== false) {
    arToolkitContext.update(arToolkitSource.domElement);
  }

  // Check marker visibility
  const currentMarkerVisible = markerRoot.visible;
  
  if (currentMarkerVisible !== markerVisible) {
    markerVisible = currentMarkerVisible;
    
    if (markerVisible) {
      markerStatus.textContent = "Marker Detected ✓";
      markerStatus.className = "detected";
      document.getElementById('instructions').classList.add('hidden');
    } else {
      markerStatus.textContent = "Marker Not Detected";
      markerStatus.className = "not-detected";
      document.getElementById('instructions').classList.remove('hidden');
    }
  }

  // Animate solar system only when marker is visible
  if (markerVisible && !options.isPaused) {
    // Rotate sun
    sun.rotateY(delta * options.speed * 0.5);
    
    // Animate planets
    planets.forEach(({ planetObj, planet, speedData }) => {
      planetObj.rotateY(speedData.orbitSpeed * options.speed * delta * 60);
      planet.rotateY(speedData.rotateSpeed * options.speed * delta * 60);
    });
  }

  // Raycasting for tooltip (only when marker visible)
  if (markerVisible) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(
      [sun, ...planets.map(p => p.planet)], 
      true
    );
    
    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (intersected === sun) {
        tooltip.innerHTML = "☀️ Sun";
      } else {
        const hoveredPlanet = planets.find(p => p.planet === intersected);
        if (hoveredPlanet) {
          tooltip.innerHTML = `🪐 ${hoveredPlanet.name}`;
        }
      }
      tooltip.style.display = "block";
      tooltip.style.left = `${mouseX + 15}px`;
      tooltip.style.top = `${mouseY + 15}px`;
    } else {
      tooltip.style.display = "none";
    }
  } else {
    tooltip.style.display = "none";
  }

  // Render scene
  renderer.render(scene, camera);
}

// Start animation
animate();

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (e) => {
  console.error('Error occurred:', e.message);
  const loading = document.getElementById('loading');
  loading.innerHTML = `
    <div style="color: #ff6b6b;">Error: ${e.message}</div>
    <div style="font-size: 12px; margin-top: 10px;">Please check console for details</div>
  `;
  loading.classList.remove('hidden');
});

// Camera permission handling
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert('Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
}