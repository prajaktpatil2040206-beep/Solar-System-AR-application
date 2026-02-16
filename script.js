// --- Wait for DOM ready ---
window.onload = function() {
    // --- Setup renderer, scene, camera ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();  // AR.js will set camera matrix

    // --- AR.js setup ---
    const arSource = new ARjs.Source({
        sourceType: 'webcam',
        deviceId: null,
        sourceWidth: 640,
        sourceHeight: 480,
        displayWidth: window.innerWidth,
        displayHeight: window.innerHeight,
    });

    const arContext = new ARjs.Context({
        cameraParametersUrl: ARjs.Context.baseURL + 'data/data/camera_para.dat',
        detectionMode: 'mono',
        matrixCodeType: '3x3',
        canvasWidth: window.innerWidth,
        canvasHeight: window.innerHeight,
    });

    arContext.init(arSource.domElement); // Initialize with video element

    // Create a root for the marker
    const markerRoot = new THREE.Group();
    scene.add(markerRoot);

    // Add marker controls (Hiro)
    const markerControls = new ARjs.MarkerControls(arContext, markerRoot, {
        preset: 'hiro',
        minConfidence: 0.6,
    });

    // --- Solar system group (will be placed inside markerRoot) ---
    const solarSystem = new THREE.Group();
    markerRoot.add(solarSystem);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    solarSystem.add(ambientLight);
    const sunLight = new THREE.PointLight(0xffaa00, 1.5, 10);
    sunLight.position.set(0, 0, 0);
    solarSystem.add(sunLight);

    // --- Texture loader ---
    const loader = new THREE.TextureLoader();

    // --- Sun ---
    const sunGeo = new THREE.SphereGeometry(0.25, 64, 64);
    const sunMat = new THREE.MeshStandardMaterial({
        map: loader.load('images/sun.jpg'),
        emissive: 0xff5500,
        emissiveIntensity: 0.5
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    solarSystem.add(sun);

    // --- Helper to create orbit path (line loop) ---
    function createOrbitPath(radius, color = 0xffffff, opacity = 0.3) {
        const points = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle)));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: color });
        const orbitLine = new THREE.LineLoop(geometry, material);
        orbitLine.visible = true; // controlled by GUI
        return orbitLine;
    }

    // --- Planet data (scaled for AR) ---
    // Each planet: { name, size, distance, texture, speedOrbit, speedRotate, ring? }
    const planetsData = [
        { name: 'Mercury', size: 0.05, distance: 0.5, texture: 'mercury.jpg', speedOrbit: 0.01, speedRotate: 0.02, color: 0xaaaaaa },
        { name: 'Venus',   size: 0.06, distance: 0.7, texture: 'venus.jpg',   speedOrbit: 0.007, speedRotate: 0.015, color: 0xf9c28d },
        { name: 'Earth',   size: 0.065, distance: 0.9, texture: 'earth.jpg',   speedOrbit: 0.005, speedRotate: 0.01, color: 0x2a7fff },
        { name: 'Mars',    size: 0.055, distance: 1.1, texture: 'mars.jpg',    speedOrbit: 0.004, speedRotate: 0.008, color: 0xc1440e },
        { name: 'Jupiter', size: 0.12, distance: 1.4, texture: 'jupiter.jpg', speedOrbit: 0.002, speedRotate: 0.02, color: 0xd8a27a },
        { name: 'Saturn',  size: 0.1, distance: 1.7, texture: 'saturn.jpg',   speedOrbit: 0.0015, speedRotate: 0.018, color: 0xe0bb87,
          ring: { inner: 0.15, outer: 0.25, texture: 'saturn_ring.png' } },
        { name: 'Uranus',  size: 0.08, distance: 2.0, texture: 'uranus.jpg',   speedOrbit: 0.001, speedRotate: 0.015, color: 0x7ec8e0,
          ring: { inner: 0.12, outer: 0.2, texture: 'uranus_ring.png' } },
        { name: 'Neptune', size: 0.08, distance: 2.3, texture: 'neptune.jpg', speedOrbit: 0.0008, speedRotate: 0.012, color: 0x4b70dd }
    ];

    // Store planet objects for animation
    const planets = [];

    planetsData.forEach(data => {
        // Create orbit path
        const orbitPath = createOrbitPath(data.distance, data.color);
        solarSystem.add(orbitPath);
        data.orbitPath = orbitPath;

        // Create planet group (to handle rotation around sun)
        const planetGroup = new THREE.Group();
        solarSystem.add(planetGroup);

        // Planet mesh
        const geo = new THREE.SphereGeometry(data.size, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ map: loader.load('images/' + data.texture) });
        const planet = new THREE.Mesh(geo, mat);
        planet.position.set(data.distance, 0, 0);
        planetGroup.add(planet);

        // Add ring if specified
        if (data.ring) {
            const ringGeo = new THREE.RingGeometry(data.ring.inner, data.ring.outer, 64);
            const ringMat = new THREE.MeshStandardMaterial({
                map: loader.load('images/' + data.ring.texture),
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.set(data.distance, 0, 0);
            planetGroup.add(ring);
        }

        // Store for animation
        planets.push({
            group: planetGroup,
            planet: planet,
            speedOrbit: data.speedOrbit,
            speedRotate: data.speedRotate
        });
    });

    // --- Stars (small decorative spheres) ---
    const stars = new THREE.Group();
    const starPositions = [
        [0.5, 0.3, 0.5], [-0.4, 0.5, 0.6], [0.3, -0.2, 1.0],
        [-0.6, 0.1, 0.8], [0.8, 0.4, -0.3], [-0.3, -0.4, 1.2]
    ];
    starPositions.forEach(pos => {
        const starGeo = new THREE.SphereGeometry(0.02, 8, 8);
        const starMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x444444 });
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(pos[0], pos[1], pos[2]);
        stars.add(star);
    });
    solarSystem.add(stars);

    // --- GUI Options ---
    const options = {
        showPaths: true,
        speed: 1.0,
        isPaused: false,
        ambientIntensity: 0.3,
        sunIntensity: 1.5
    };

    const gui = new dat.GUI();
    gui.add(options, 'showPaths').name('Show Orbits').onChange(val => {
        planetsData.forEach(p => p.orbitPath.visible = val);
    });
    gui.add(options, 'speed', 0, 5).name('Speed Multiplier');
    gui.add(options, 'isPaused').name('Pause Animation');
    gui.add(options, 'ambientIntensity', 0, 1).name('Ambient Light').onChange(val => ambientLight.intensity = val);
    gui.add(options, 'sunIntensity', 0, 3).name('Sun Light').onChange(val => sunLight.intensity = val);

    // Add per-planet speed controls
    planetsData.forEach((data, index) => {
        const folder = gui.addFolder(data.name);
        folder.add(planets[index], 'speedOrbit', 0, 0.05).name('Orbit Speed');
        folder.add(planets[index], 'speedRotate', 0, 0.05).name('Rotation Speed');
        folder.open();
    });

    // --- Animation loop ---
    function animate() {
        if (!options.isPaused) {
            // Sun rotation
            sun.rotation.y += 0.005 * options.speed;

            // Planets orbit and rotate
            planets.forEach(p => {
                p.group.rotation.y += p.speedOrbit * options.speed;
                p.planet.rotation.y += p.speedRotate * options.speed;
            });
        }

        // Update AR context (process marker detection)
        arContext.update(arSource.domElement);

        // Render
        renderer.render(scene, camera);

        requestAnimationFrame(animate);
    }

    animate();

    // --- Handle window resize ---
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        arSource.onResize(window.innerWidth, window.innerHeight);
    });

    // --- Debug info (optional) ---
    console.log('AR Solar System initialized. Point camera at Hiro marker.');
};