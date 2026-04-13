/**
 * Extract dominant color from an image using Canvas
 */
function extractDominantColor(imgEl) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 50; 
  canvas.height = 50;
  
  try {
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    let r = 0, g = 0, b = 0, count = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const rVal = data[i], gVal = data[i+1], bVal = data[i+2], aVal = data[i+3];
      if (aVal < 128) continue; 
      if ((rVal < 40 && gVal < 40 && bVal < 40) || (rVal > 230 && gVal > 230 && bVal > 230)) continue;
      
      r += rVal; g += gVal; b += bVal; count++;
    }
    
    if (count > 0) {
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      const max = Math.max(r, g, b);
      if (max < 150) {
        const factor = 150 / max;
        r = Math.min(255, Math.floor(r * factor));
        g = Math.min(255, Math.floor(g * factor));
        b = Math.min(255, Math.floor(b * factor));
      }
      return `${r}, ${g}, ${b}`;
    }
  } catch (e) {
    console.warn('Canvas color extraction failed (likely CORS), falling back to default color.', e);
  }
  return '10, 132, 255';
}

function applyExtractedColor(imageEl) {
  const rgbStr = extractDominantColor(imageEl);
  document.documentElement.style.setProperty('--primary-color-rgb', rgbStr);
  document.documentElement.style.setProperty('--primary-color', `rgb(${rgbStr})`);
}

/**
 * UTILS
 */
// Clamp a value between min and max
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Map a value from one range to another
const mapRange = (val, in_min, in_max, out_min, out_max) => {
  return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

/**
 * SCROLL ENGINE
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Color Extraction
  const img = document.getElementById('profileImage');
  if (img) {
    if (img.complete) applyExtractedColor(img);
    else img.addEventListener('load', () => applyExtractedColor(img));
  }

  // 2. Element References
  const nav = document.getElementById('navbar');
  const globalGlow = document.getElementById('globalGlow');
  
  // Frame 1
  const heroSection = document.getElementById('hero-section');
  const heroContent = document.getElementById('hero-content');
  const heroMacFrame = document.getElementById('hero-mac-frame');
  const heroBadge1 = document.getElementById('hero-badge-1');
  const heroBadge2 = document.getElementById('hero-badge-2');
  
  // Frame 2
  const aboutSection = document.getElementById('about-section');
  const aboutTextLines = [
    document.querySelector('#about-text-container h2'),
    document.getElementById('about-p1'),
    document.getElementById('about-p2'),
    document.getElementById('about-badges')
  ];
  const aboutChart = document.getElementById('about-chart-container');
  
  // Frame 3
  const projectsSection = document.getElementById('projects-section');
  const projectsHeader = document.getElementById('projects-header');
  const projectPanels = document.querySelectorAll('.project-panel');
  
  // Frame 4
  const certsSection = document.getElementById('certificates-section');
  const certsHeader = document.getElementById('certs-header');
  const certsTrack = document.getElementById('certs-track');
  const certCards = document.querySelectorAll('.cert-card');

  // Frame 5
  const contactSection = document.getElementById('contact-section');
  const contactContent = document.getElementById('contact-content');

  // Render Loop setup
  let scrollY = window.scrollY;
  let ticking = false;

  function onScroll() {
    scrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(render);
      ticking = true;
    }
  }

  function render() {
    const vh = window.innerHeight;

    // Nav Blur
    if (scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    // --- FRAME 1: HERO (0 to 1 progress) ---
    const hTop = heroSection.offsetTop;
    const hHeight = heroSection.offsetHeight;
    const hProgress = clamp((scrollY - hTop) / Math.max(1, hHeight - vh), 0, 1);
    
    // Zoom in Mac frame inside hero
    const macScale = mapRange(hProgress, 0, 1, 1, 1.4);
    heroMacFrame.style.transform = `scale3d(${macScale}, ${macScale}, 1)`;
    // Fade out text much later mapping to avoid visual gaps
    const contentOpacity = mapRange(hProgress, 0.6, 0.95, 1, 0);
    const contentY = mapRange(hProgress, 0.3, 0.9, 0, -50);
    heroContent.style.opacity = contentOpacity;
    heroContent.style.transform = `translate3d(0, ${contentY}px, 0)`;
    
    globalGlow.style.transform = `translate(-50%, -50%) scale3d(${1 + (hProgress * 0.5)}, ${1 + (hProgress * 0.5)}, 1)`;
    globalGlow.style.opacity = mapRange(hProgress, 0, 1, 1, 0.5);

    // Badges float away
    heroBadge1.style.transform = `translate3d(${hProgress * 100}px, ${hProgress * -100}px, 0)`;
    heroBadge1.style.opacity = 1 - hProgress;
    heroBadge2.style.transform = `translate3d(${hProgress * -100}px, ${hProgress * 100}px, 0)`;
    heroBadge2.style.opacity = 1 - hProgress;


    // --- FRAME 2: ABOUT ---
    // Start tracking when section arrives at bottom of viewport, finish when pinned
    const aTop = aboutSection.offsetTop;
    const aHeight = aboutSection.offsetHeight;
    // Calculate progress as scrub: 0 when pinning starts, 1 when pinning ends
    const aProgress = clamp((scrollY - aTop) / (aHeight - vh), 0, 1);
    
    // Animate lines staggered based on aProgress
    // Let's divide 0 to 1 into pieces.
    aboutTextLines.forEach((el, index) => {
      const startP = index * 0.06;
      const endP = startP + 0.20;
      const p = clamp(mapRange(aProgress, startP, endP, 0, 1), 0, 1);
      
      el.style.opacity = p;
      el.style.transform = `translate3d(0, ${(1 - p) * 30}px, 0)`;
    });
    
    // Chart reveals
    const chartP = clamp(mapRange(aProgress, 0.2, 0.6, 0, 1), 0, 1);
    aboutChart.style.opacity = chartP;
    aboutChart.style.transform = `translate3d(${(1 - chartP) * 50}px, 0, 0)`;


    // --- FRAME 3: PROJECTS ---
    const pTop = projectsSection.offsetTop;
    const pHeight = projectsSection.offsetHeight;
    const pProgress = clamp((scrollY - pTop) / (pHeight - vh), 0, 1);
    
    // Header fade
    projectsHeader.style.opacity = clamp(mapRange(pProgress, 0, 0.05, 0, 1), 0, 1);
    projectsHeader.style.transform = `translate3d(0, ${(1 - clamp(mapRange(pProgress, 0, 0.05, 0, 1), 0, 1)) * 20}px, 0)`;

    // Divide progress among panels
    // For 3 panels: ranges are roughly [0.05, 0.35], [0.35, 0.65], [0.65, 0.95]
    projectPanels.forEach((panel, i) => {
      const startP = 0.05 + (i * 0.3);
      const endP = startP + 0.2; // time to slide in
      const nextP = endP + 0.1; // time before next panel covers it
      
      const localP = clamp(mapRange(pProgress, startP, endP, 0, 1), 0, 1);
      
      if (pProgress < startP) {
        // Not yet active
        panel.style.opacity = 0;
        panel.style.transform = `translate3d(0, 100vh, 0) scale3d(0.9, 0.9, 1)`;
        panel.style.filter = `blur(0px)`;
      } else if (pProgress >= startP && pProgress <= endP) {
        // Sliding in
        const yOffset = (1 - localP) * 100; // vh
        panel.style.opacity = localP;
        panel.style.transform = `translate3d(0, ${yOffset}%, 0) scale3d(1, 1, 1)`;
        panel.style.filter = `blur(0px)`;
      } else if (pProgress > endP) {
        // Active and potentially being covered
        const distanceSinceNext = pProgress - endP;
        const pushBack = clamp(distanceSinceNext * 4, 0, 1); // 0 to 1 value
        
        panel.style.opacity = 1;
        const scale = 1 - (pushBack * 0.05); // shrink to 0.95
        const blur = pushBack * 8; // up to 8px blur
        const yOffset = pushBack * -5; // move slightly up%
        
        panel.style.transform = `translate3d(0, ${yOffset}%, -${pushBack * 100}px) scale3d(${scale}, ${scale}, 1)`;
        panel.style.filter = `blur(${blur}px)`;
      }
    });


    // --- FRAME 4: CERTIFICATES ---
    const cTop = certsSection.offsetTop;
    const cHeight = certsSection.offsetHeight;
    const cProgress = clamp((scrollY - cTop) / (cHeight - vh), 0, 1);

    certsHeader.style.opacity = clamp(mapRange(cProgress, 0, 0.1, 0, 1), 0, 1);

    // Circular 3D Carousel Motion for Certificates
    // Rotate the carousel by 360 degrees as we scroll
    const overallRotation = cProgress * 360; 
    
    // Ellipse radius responsive to screen width
    const radiusX = Math.min(window.innerWidth * 0.35, 400); 
    const radiusY = radiusX * 0.3; // Flattened for 3D depth

    certCards.forEach((card, index) => {
      // Evenly distribute cards (120 degrees apart for 3 cards)
      const angleOffset = index * (360 / certCards.length);
      const angleDeg = overallRotation + angleOffset;
      const angleRad = (angleDeg - 90) * (Math.PI / 180);
      
      const x = Math.cos(angleRad) * radiusX;
      const y = Math.sin(angleRad) * radiusY;
      
      // Depth calculation (sin(rad) ranges from -1 to 1) 
      // 1 = front (closest), -1 = back (furthest)
      const depth = Math.sin(angleRad);
      
      const scale = 1 + (depth * 0.2); // Front cards scale up to 1.2x, back to 0.8x
      const opacity = 0.4 + ((depth + 1) / 2) * 0.6; // Fade out back cards
      
      // Calculate zIndex so front cards correctly overlap back cards
      const zIndex = Math.round(depth * 100) + 100;
      
      card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
      
      if (depth > 0.8) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // --- FRAME 5: CONTACT ---
    const contactTop = contactSection.offsetTop;
    // Animate based on bounding client rect
    const contactRect = contactSection.getBoundingClientRect();
    if (contactRect.top < vh * 0.8) {
      const p = clamp(mapRange(contactRect.top, vh * 0.8, vh * 0.4, 0, 1), 0, 1);
      contactContent.style.opacity = p;
      contactContent.style.transform = `translate3d(0, ${(1 - p) * 30}px, 0)`;
    } else {
      contactContent.style.opacity = 0;
      contactContent.style.transform = `translate3d(0, 30px, 0)`;
    }

    ticking = false;
  }

  // Bind scroll event
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  
  // Initial render
  render();

  // Contact Form Setup Data
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusMsg = document.getElementById('formStatus');
      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const subject = document.getElementById('contactSubject').value;
      const message = document.getElementById('contactMessage').value;

      statusMsg.textContent = 'Sending message...';
      statusMsg.style.color = 'var(--text-main)';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message })
        });
        const data = await response.json();

        if (response.ok && data.success) {
          statusMsg.textContent = '✓ Message sent securely.';
          statusMsg.style.color = 'var(--primary-color)';
          contactForm.reset();
        } else {
          statusMsg.textContent = '⚠ ' + (data.error || 'Failed to send message');
          statusMsg.style.color = '#ff5f56';
        }
        setTimeout(() => statusMsg.textContent = '', 5000);
      } catch (error) {
        statusMsg.textContent = '⚠ Connection error. Message saved locally.';
        statusMsg.style.color = '#ffbd2e';
        const formData = { name, email, subject, message, timestamp: new Date().toISOString(), offline: true };
        const submissions = JSON.parse(localStorage.getItem('contactSubmissions')) || [];
        submissions.push(formData);
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
      }
    });
  }
});
