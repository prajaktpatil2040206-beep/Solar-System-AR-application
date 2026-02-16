import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Live camera background
const video = document.createElement('video');
video.autoplay = true;
video.muted = true;
video.playsInline = true;

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; video.play(); })
  .catch(() => console.warn('Camera not available'));

const videoTexture = new THREE.VideoTexture(video);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122);
video.addEventListener('loadeddata', () => { scene.background = videoTexture; });

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(-50, 90, 150);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.minDistance = 30;
orbit.maxDistance = 500;
orbit.enableDamping = true;

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(15, 50, 50),
  new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/sun.jpg') })
);
scene.add(sun);
scene.add(new THREE.PointLight(0xffffff, 4, 300));
scene.add(new THREE.AmbientLight(0x404040));

// Planets data
const planets = [
  { name:'Mercury', size:3.2, texture:'mercury.jpg', distance:28, speed:0.004, rot:0.004 },
  { name:'Venus',   size:5.8, texture:'venus.jpg',   distance:44, speed:0.015, rot:0.002 },
  { name:'Earth',   size:6,   texture:'earth.jpg',   distance:62, speed:0.01,  rot:0.02 },
  { name:'Mars',    size:4,   texture:'mars.jpg',    distance:78, speed:0.008, rot:0.018 },
  { name:'Jupiter', size:12,  texture:'jupiter.jpg', distance:100, speed:0.002, rot:0.04 },
  { name:'Saturn',  size:10,  texture:'saturn.jpg',  distance:138, speed:0.0009, rot:0.038, ring:{ inner:10, outer:20, tex:'saturn_ring.png' } },
  { name:'Uranus',  size:7,   texture:'uranus.jpg',  distance:176, speed:0.0004, rot:0.03, ring:{ inner:7, outer:12, tex:'uranus_ring.png' } },
  { name:'Neptune', size:7,   texture:'neptune.jpg', distance:200, speed:0.0001, rot:0.032 }
];

const loader = new THREE.TextureLoader();
const planetObjects = [];

planets.forEach(p => {
  const geo = new THREE.SphereGeometry(p.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ map: loader.load(`images/${p.texture}`) });
  const mesh = new THREE.Mesh(geo, mat);
  const obj = new THREE.Object3D();
  mesh.position.x = p.distance;
  obj.add(mesh);

  if (p.ring) {
    const ringGeo = new THREE.RingGeometry(p.ring.inner, p.ring.outer, 64);
    const ringMat = new THREE.MeshBasicMaterial({ map: loader.load(`images/${p.ring.tex}`), side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.x = p.distance;
    ring.rotation.x = Math.PI/2;
    obj.add(ring);
  }

  scene.add(obj);
  planetObjects.push({ obj, mesh, orbitSpeed: p.speed, rotSpeed: p.rot });

  // Orbit path
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i/64)*Math.PI*2;
    points.push(p.distance*Math.cos(angle), 0, p.distance*Math.sin(angle));
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const line = new THREE.LineLoop(lineGeo, new THREE.LineBasicMaterial({ color: 0xffffff }));
  scene.add(line);
});

// GUI
const gui = new dat.GUI();
const options = { speed:1, pause:false };
gui.add(options,'speed',0,5);
gui.add(options,'pause');

// Tooltip
const tooltip = document.createElement('div');
tooltip.style.cssText = 'position:absolute;background:rgba(0,0,0,0.7);color:white;padding:5px 10px;border-radius:5px;pointer-events:none;display:none;z-index:1000;';
document.body.appendChild(tooltip);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX/innerWidth)*2-1;
  mouse.y = -(e.clientY/innerHeight)*2+1;
  tooltip.style.left = e.clientX+10+'px';
  tooltip.style.top = e.clientY+10+'px';
});

// Animation
const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  if (!options.pause) {
    sun.rotation.y += 0.002 * options.speed;
    planetObjects.forEach(p => {
      p.obj.rotation.y += p.orbitSpeed * options.speed * delta * 30;
      p.mesh.rotation.y += p.rotSpeed * options.speed * delta * 30;
    });
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([sun, ...planetObjects.map(p=>p.mesh)]);
  if (intersects.length) {
    const obj = intersects[0].object;
    if (obj === sun) tooltip.innerHTML = 'Sun';
    else {
      const found = planets.find(p => p.texture.includes(obj.material.map.image.currentSrc.split('/').pop().split('.')[0]));
      tooltip.innerHTML = found ? found.name : 'Planet';
    }
    tooltip.style.display = 'block';
  } else tooltip.style.display = 'none';

  orbit.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});