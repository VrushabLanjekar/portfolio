// ── CURSOR ──
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, .project-card, .skill-cell, .tool-item, .badge').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('big'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
});

// ── MARQUEE ──
const items = ['Data Analytics', 'Machine Learning', 'Python', 'SQL', 'Tableau', 'Power BI', 'Snowflake', 'A/B Testing', 'Data Engineering', 'Statistical Modeling', 'Dashboard Design', 'ETL Pipelines'];
const track = document.getElementById('marqueeTrack');
const doubled = [...items, ...items];
track.innerHTML = doubled.map(i => `<span class="marquee-item"><span class="marquee-dot"></span>${i}</span>`).join('');

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// ── COUNTER ANIMATION ──
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  let current = 0;
  const step = target / 50;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current) + suffix;
    if (current >= target) clearInterval(timer);
  }, 30);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); }
  });
}, { threshold: .5 });
document.querySelectorAll('.metric-num[data-target]').forEach(el => counterObserver.observe(el));

// ── PARALLAX ON HERO BLOBS ──
document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth - .5) * 20;
  const y = (e.clientY / window.innerHeight - .5) * 20;
  document.querySelectorAll('.blob').forEach((b, i) => {
    const f = (i + 1) * .4;
    b.style.transform = `translate(${x * f}px, ${y * f}px)`;
  });
});

// ── PARTICLE SYSTEM ON HERO CANVAS ──
const canvas = document.getElementById('heroParticles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  const hero = document.getElementById('hero');
  canvas.width = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
  canvas.style.position = 'absolute';
  canvas.style.top = hero.offsetTop + 'px';
  canvas.style.left = '0';
}

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.4 + 0.1,
    color: ['#1a6bff', '#00d4a0', '#ff3c5f'][Math.floor(Math.random() * 3)]
  };
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
for (let i = 0; i < 60; i++) particles.push(createParticle());

function animParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(animParticles);
}
animParticles();

// ── CONTACT FORM HANDLER ──
async function handleContactSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('contactForm');
  const statusMsg = document.getElementById('formStatus');

  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value;

  // Show loading state
  statusMsg.textContent = 'Sending message...';
  statusMsg.style.color = 'var(--accent)';
  statusMsg.style.opacity = '1';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, subject, message })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      statusMsg.textContent = '✓ Message sent! I\'ll get back to you soon.';
      statusMsg.style.color = 'var(--accent3)';
      form.reset();
    } else {
      statusMsg.textContent = '⚠ ' + (data.error || 'Failed to send message');
      statusMsg.style.color = 'var(--accent2)';
    }

    // Hide message after 5 seconds
    setTimeout(() => {
      statusMsg.style.opacity = '0';
    }, 5000);

  } catch (error) {
    console.error('Form submission error:', error);
    statusMsg.textContent = '⚠ Connection error. Please try again.';
    statusMsg.style.color = 'var(--accent2)';
    statusMsg.style.opacity = '1';

    // Fallback: store in localStorage if server is down
    const formData = { name, email, subject, message, timestamp: new Date().toISOString(), offline: true };
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions')) || [];
    submissions.push(formData);
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
  }
}
