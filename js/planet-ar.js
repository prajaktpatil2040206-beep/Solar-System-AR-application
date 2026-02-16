import * as THREE from 'three';

// Get planet name from URL
const urlParams = new URLSearchParams(window.location.search);
const planetName = urlParams.get('planet') || 'earth';
const planetData = {
  mercury: { name:'Mercury', size:0.8, texture:'mercury.jpg', info:'Mercury is the smallest planet and closest to the Sun. It has no atmosphere and extreme temperatures.' },
  venus:   { name:'Venus',   size:0.9, texture:'venus.jpg',   info:'Venus is similar in size to Earth but has a thick toxic atmosphere, making it the hottest planet.' },
  earth:   { name:'Earth',   size:1.0, texture:'earth.jpg',   info:'Earth is the only planet known to support life. It has one moon and a breathable atmosphere.' },
  mars:    { name:'Mars',    size:0.8, texture:'mars.jpg',    info:'Mars is the Red Planet, with the largest volcano in the solar system. It has two small moons.' },
  jupiter: { name:'Jupiter', size:1.5, texture:'jupiter.jpg', info:'Jupiter is the largest planet, with a Great Red Spot and dozens of moons.' },
  saturn:  { name:'Saturn',  size:1.3, texture:'saturn.jpg',  info:'Saturn is famous for its stunning rings made of ice and rock.' },
  uranus:  { name:'Uranus',  size:1.1, texture:'uranus.jpg',  info:'Uranus rotates on its side and has faint rings. It is an ice giant.' },
  neptune: { name:'Neptune', size:1.1, texture:'neptune.jpg', info:'Neptune is deep blue and has the strongest winds in the solar system.' }
}[planetName];

// --- Setup camera video element manually ---
const video = document.createElement('video');
video.setAttribute('playsinline', '');
video.setAttribute('autoplay', '');
video.setAttribute('muted', '');
video.style.position = 'fixed';
video.style.top = '0';
video.style.left = '0';
video.style.width = '100%';
video.style.height = '100%';
video.style.objectFit = 'cover';
video.style.zIndex = '-1'; // Behind the canvas
document.body.appendChild(video);

// Request camera access
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    video.play().catch(e => console.warn('Auto-play failed:', e));
  })
  .catch(err => {
    console.error('Camera access denied:', err);
    // Fallback: show a message or a color
    video.style.backgroundColor = '#111';
    const msg = document.createElement('div');
    msg.innerText = 'Camera access required for AR. Please allow camera.';
    msg.style.position = 'fixed';
    msg.style.top = '50%';
    msg.style.left = '50%';
    msg.style.transform = 'translate(-50%, -50%)';
    msg.style.color = 'white';
    msg.style.background = 'rgba(0,0,0,0.7)';
    msg.style.padding = '1rem';
    msg.style.borderRadius = '8px';
    msg.style.zIndex = '0';
    document.body.appendChild(msg);
  });

// --- Setup Three.js renderer (transparent) ---
const canvas = document.getElementById('ar-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0); // transparent

const scene = new THREE.Scene();
const camera = new THREE.Camera();
camera.matrixAutoUpdate = false;

// --- AR.js setup with our video element ---
const arController = new THREEx.ArController(renderer, camera, canvas);
// Create a custom source using our video element
arController.source = new THREEx.ArSource('custom', {
  videoElement: video,
  cameraParamUrl: 'data/camera_para.dat'
});

// Configure marker detection
arController.context.arController.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);
arController.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_COLOR);

// Load Hiro pattern
arController.loadMarker('data/hiro.patt', markerId => {
  arController.trackMarker(markerId, {
    onAdded: marker => createContent(marker),
    onUpdated: marker => updateContent(marker),
    onRemoved: () => removeContent()
  });
});

arController.start();

// Planet and card holders
let planetMesh, cardMesh;
let cardScale = 1.0;

function createContent(marker) {
  // Planet sphere
  const texture = new THREE.TextureLoader().load(`images/${planetData.texture}`);
  const geo = new THREE.SphereGeometry(planetData.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ map: texture });
  planetMesh = new THREE.Mesh(geo, mat);
  planetMesh.position.set(0, planetData.size / 2, 0);
  planetMesh.castShadow = true;
  planetMesh.receiveShadow = true;

  // Add a light to make the planet visible
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(2, 5, 5);
  marker.add(light);

  // Info card (canvas texture)
  const canvasElem = document.createElement('canvas');
  canvasElem.width = 512;
  canvasElem.height = 256;
  const ctx = canvasElem.getContext('2d');

  // Glass card style
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, 0, canvasElem.width, canvasElem.height);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, canvasElem.width, canvasElem.height);

  ctx.font = 'bold 40px "Segoe UI", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText(planetData.name, 30, 70);

  ctx.font = '24px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ddd';
  wrapText(ctx, planetData.info, 30, 120, 450, 30);

  const cardTexture = new THREE.CanvasTexture(canvasElem);
  const cardGeo = new THREE.PlaneGeometry(4, 2);
  const cardMat = new THREE.MeshBasicMaterial({ map: cardTexture, side: THREE.DoubleSide, transparent: true });
  cardMesh = new THREE.Mesh(cardGeo, cardMat);
  cardMesh.position.set(2.5, 1, 0); // side by side
  cardMesh.scale.set(cardScale, cardScale, cardScale);

  marker.add(planetMesh);
  marker.add(cardMesh);
}

function updateContent(marker) {
  if (planetMesh) planetMesh.rotation.y += 0.01;
}

function removeContent() {
  if (planetMesh) planetMesh.parent.remove(planetMesh);
  if (cardMesh) cardMesh.parent.remove(cardMesh);
  planetMesh = cardMesh = null;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// UI Controls
document.getElementById('speak-btn').addEventListener('click', () => {
  const utterance = new SpeechSynthesisUtterance(planetData.info);
  window.speechSynthesis.speak(utterance);
});

document.getElementById('zoom-in').addEventListener('click', () => {
  cardScale = Math.min(cardScale + 0.2, 3.0);
  if (cardMesh) cardMesh.scale.set(cardScale, cardScale, cardScale);
  document.getElementById('scale-display').innerText = `Card scale: ${cardScale.toFixed(1)}`;
});

document.getElementById('zoom-out').addEventListener('click', () => {
  cardScale = Math.max(cardScale - 0.2, 0.5);
  if (cardMesh) cardMesh.scale.set(cardScale, cardScale, cardScale);
  document.getElementById('scale-display').innerText = `Card scale: ${cardScale.toFixed(1)}`;
});

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  if (arController) arController.process();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();