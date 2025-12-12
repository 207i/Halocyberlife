// ===============================
// HaloCyberlife v2.0.2 Navigation
// ===============================

// Neon nav mobile toggle
const neonToggle = document.querySelector('.neon-nav-toggle');
const neonNav = document.querySelector('.neon-nav');

if (neonToggle && neonNav) {
    neonToggle.addEventListener('click', () => {
        neonNav.classList.toggle('open');
    });
}

