// =============================================
//   DREAMSCAPE GAMING CAFE — MAIN JAVASCRIPT
// =============================================

// ---- PARTICLES ----
(function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#b44fff', '#00f5ff', '#ff006e', '#39ff14'];
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${color};
      box-shadow: 0 0 ${size * 3}px ${color};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
})();

// ---- NAVBAR SCROLL ----
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---- TYPED TEXT ANIMATION ----
const lines = [
  '> Loading game library... ✓',
  '> Setting up stations... ✓',
  '> Brewing coffee... ✓',
  '> Configuring RGB... ✓',
  '> Almost ready...',
  '> Welcome to Dreamscape!',
];
let lineIdx = 0;
let charIdx = 0;
let isDeleting = false;
const typedEl = document.getElementById('typedText');

function typeEffect() {
  const current = lines[lineIdx];

  if (!isDeleting) {
    typedEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      setTimeout(() => { isDeleting = true; }, 1800);
      setTimeout(typeEffect, 1850);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      lineIdx = (lineIdx + 1) % lines.length;
    }
  }
  setTimeout(typeEffect, isDeleting ? 40 : 70);
}

typeEffect();

// ---- VOTING SYSTEM ----
const votes = {};

function vote(btn, key) {
  // Determine vote group
  const group = key.split('-')[0];
  const resultId = `vote-result-${group}`;
  const resultEl = document.getElementById(resultId);

  // Find all buttons in the same group
  const container = btn.closest('.vote-options');
  container.querySelectorAll('.vote-btn').forEach(b => b.classList.remove('voted'));
  btn.classList.add('voted');

  votes[group] = key;

  const labels = {
    'pc-budget': '💚 Budget Beast (₹60K–80K)',
    'pc-mid':    '💛 Mid Range (₹1L–1.5L)',
    'pc-high':   '🔴 High End (₹2L+)',
    'theme-cyber': '🌌 Cyberpunk Neon',
    'theme-space': '🚀 Sci-Fi Space',
    'theme-retro': '🏯 Retro Arcade',
  };

  if (resultEl) {
    resultEl.textContent = `✅ You voted for: ${labels[key]}`;
  }
}

// ---- CONTACT FORM ----
function handleContact(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const note = document.getElementById('form-note');

  // Simulate sending (in real use, connect to Formspree or similar)
  note.textContent = `✅ Thanks ${name}! Your message has been received. Basil will reach out soon!`;

  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMsg').value = '';

  setTimeout(() => { note.textContent = ''; }, 5000);
}

// ---- SCROLL ANIMATIONS ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

// Animate cards on scroll
document.querySelectorAll('.equip-card, .design-card, .game-card, .food-card, .update-card, .community-card, .service-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ---- ACTIVE NAV HIGHLIGHTING ----
const sections = document.querySelectorAll('section[id]');
const navA = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) {
      current = s.getAttribute('id');
    }
  });
  navA.forEach(a => {
    a.style.color = '';
    if (a.getAttribute('href') === `#${current}`) {
      a.style.color = '#00f5ff';
      a.style.textShadow = '0 0 10px #00f5ff';
    } else {
      a.style.textShadow = '';
    }
  });
});
