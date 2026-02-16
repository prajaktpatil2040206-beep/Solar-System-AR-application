# 🌌 Solar System Simulation - Geethika Gattu

This project is a **3D simulation of our Solar System** built using **Three.js**. It features realistic orbiting planets, interactive controls, and smooth animations — all rendered in the browser using pure JavaScript.

---

## 🚀 Features

- ☀️ Sun at the center with realistic texture
- 🪐 All 8 planets orbiting and rotating (Mercury to Neptune)
- 🌟 Background stars (skybox effect)
- 🔄 Adjustable orbit and rotation speeds for each planet
- 🎛️ Control panel with:
  - Speed slider
  - Pause/Resume button
  - Light/Dark mode toggle
  - Orbit visibility toggle
- 🖱️ Tooltip on hover for planet names (including the Sun)
- 📱 Mobile responsive

---

## 🎮 Controls & UI

- Use the **left-click and drag** to orbit the camera
- Use the **scroll wheel** to zoom in/out
- Use the **GUI panel (top-left)** to:
  - Adjust each planet's speed
  - Toggle orbit lines and real view
  - Switch between light/dark modes
  - Pause or resume animation

---

## 📂 Folder Structure

├── 📁 image/ # All planet and background textures
│ ├── sun.jpg
│ ├── earth.jpg
│ └── ...etc
├── index.html # Main HTML page
├── script.js # Main JavaScript (Three.js) logic
└── README.md # This file

---

## 🧪 How It Works

- Each planet is created using a `SphereGeometry` and a texture.
- All orbits are visualized with `LineLoop` circles.
- Animations are controlled via `THREE.Clock` and `requestAnimationFrame`.
- GUI built using [`dat.GUI`](https://github.com/dataarts/dat.gui).

---

## 💻 How to Run

1. **Open `index.html`** in a modern browser.
2. Or **deploy using GitHub Pages**:
   - Push this project to a GitHub repo
   - Go to `Settings > Pages` and select the root as the source
   - Your simulation will be live at:  
  deployed link = (https://geethikagattu.github.io/Solar_System_Simulation/)

---

## 🎥 Demo Video


https://github.com/user-attachments/assets/ae1077c6-af5d-4a04-a71a-e0d3646d4a8a

---

## ✨ Bonus Features Implemented

- ✅ Pause/Resume Animation!
- ✅ Background stars
- ✅ Tooltips on hover
- ✅ Dark/Light Mode Toggle

---

## 🧠 Created With

- [Three.js](https://threejs.org/)
- Pure HTML, JavaScript
- dat.GUI

---

## 🧑‍💻 Developed By

**Geethika Gattu**  
B.Tech 3rd Year | SRM University AP  
---
