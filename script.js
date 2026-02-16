// Wait until A-Frame fully loads
window.addEventListener('load', () => {

    const container = document.querySelector('#sphere-container');

    // Create sphere element
    const sphere = document.createElement('a-sphere');

    sphere.setAttribute('position', '0 0.5 0');
    sphere.setAttribute('radius', '0.5');
    sphere.setAttribute('color', '#4CC3D9');

    // Smooth rotation animation
    sphere.setAttribute('animation', {
        property: 'rotation',
        to: '0 360 0',
        loop: true,
        dur: 4000,
        easing: 'linear'
    });

    // Add sphere to marker
    container.appendChild(sphere);
});
