/* ═══════════════════════════════════════════
   KIRAN EDITS — script.js
═══════════════════════════════════════════ */

/* ── Set current year in footer ── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ══════════════════════════════════════════
   PARTICLE CANVAS BACKGROUND
══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x       = Math.random() * W;
      this.y       = init ? Math.random() * H : H + 10;
      this.size    = Math.random() * 1.2 + 0.3;
      this.speed   = Math.random() * 0.4 + 0.1;
      this.opacity = Math.random() * 0.4 + 0.05;
      this.flicker = Math.random() * 0.02;
      this.dx      = (Math.random() - 0.5) * 0.15;
    }
    update() {
      this.y -= this.speed;
      this.x += this.dx;
      this.opacity += Math.sin(Date.now() * this.flicker) * 0.003;
      if (this.y < -5) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,168,67,${Math.max(0, Math.min(0.5, this.opacity))})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ══════════════════════════════════════════
   LOADER — hide after page load
══════════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('out'), 2000);
});

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
function initReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.12 }).observe(el);
  });
}
initReveal();

/* ══════════════════════════════════════════
   NAV ACTIVE LINK ON SCROLL
══════════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(s => {
    const top    = s.offsetTop;
    const bottom = top + s.offsetHeight;
    const link   = document.querySelector(`.nav-links a[href="#${s.id}"]`);
    if (link) link.style.color = (scrollY >= top && scrollY < bottom) ? 'var(--gold)' : '';
  });
}, { passive: true });

/* ══════════════════════════════════════════
   ADMIN PANEL
══════════════════════════════════════════ */
const ADMIN_PASS = 'chinnuboysaaho';
let isLoggedIn = false;
let currentPreviewId = null;

function openAdmin() {
  document.getElementById('admin-panel').classList.add('open');
  if (isLoggedIn) showUploadPanel();
}

function closeAdmin() {
  document.getElementById('admin-panel').classList.remove('open');
  document.getElementById('adminPassword').value = '';
  document.getElementById('loginError').style.display = 'none';
  document.getElementById('ytUrl').value = '';
  document.getElementById('ytPreview').style.display = 'none';
  document.getElementById('ytPreviewImg').src = '';
  currentPreviewId = null;
  document.getElementById('videoTitle').value = '';
  document.getElementById('videoType').value = '';
}

function checkLogin() {
  if (document.getElementById('adminPassword').value === ADMIN_PASS) {
    isLoggedIn = true;
    document.getElementById('loginError').style.display = 'none';
    showUploadPanel();
    document.body.classList.add('admin-mode');
    renderVideos();
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('adminPassword').value = '';
  }
}

function showUploadPanel() {
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-upload').style.display = 'block';
  updateSlotStatus();
}

function logout() {
  isLoggedIn = false;
  document.body.classList.remove('admin-mode');
  document.getElementById('admin-upload').style.display = 'none';
  document.getElementById('admin-login').style.display = 'block';
  renderVideos();
  closeAdmin();
}

/* Backdrop click closes admin panel */
document.getElementById('admin-panel').addEventListener('click', function (e) {
  if (e.target === this) closeAdmin();
});

/* ══════════════════════════════════════════
   YOUTUBE HELPERS
══════════════════════════════════════════ */
function extractYTId(input) {
  input = (input || '').trim();
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /embed\/([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

function previewYT() {
  const id      = extractYTId(document.getElementById('ytUrl').value);
  const preview = document.getElementById('ytPreview');
  const img     = document.getElementById('ytPreviewImg');
  currentPreviewId = id;
  if (id) {
    img.src      = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    img.onerror  = () => { img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`; };
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
    img.src = '';
  }
}

/* ══════════════════════════════════════════
   VIDEO STORAGE (localStorage)
══════════════════════════════════════════ */
let videos = [];
try {
  videos = JSON.parse(localStorage.getItem('kiranEditsYT') || '[]');
} catch (e) {
  videos = [];
}

function saveVideos() {
  try { localStorage.setItem('kiranEditsYT', JSON.stringify(videos)); } catch (e) {}
}

function updateSlotStatus() {
  const n   = videos.length;
  const rem = 9 - n;
  document.getElementById('slotStatus').textContent =
    n >= 9
      ? '⚠ Grid full (9/9) — remove a video to add a new one'
      : `${n}/9 slots used — ${rem} slot${rem !== 1 ? 's' : ''} remaining`;
  document.getElementById('addBtn').disabled = n >= 9;
  document.getElementById('videoCountBadge').textContent = `${n} / 9`;
}

function addVideo() {
  if (videos.length >= 9) { alert('Portfolio grid is full! Remove a video first.'); return; }
  const ytId = extractYTId(document.getElementById('ytUrl').value);
  if (!ytId) { alert('Please enter a valid YouTube URL or video ID.'); return; }
  if (videos.find(v => v.ytId === ytId)) { alert('This video is already in your portfolio.'); return; }
  const title = document.getElementById('videoTitle').value.trim() || 'Demo Video';
  const type  = document.getElementById('videoType').value.trim()  || 'Invitation';
  videos.push({ id: Date.now(), ytId, title, type });
  saveVideos();
  renderVideos();
  updateSlotStatus();
  /* Clear form */
  document.getElementById('ytUrl').value = '';
  document.getElementById('ytPreview').style.display = 'none';
  document.getElementById('ytPreviewImg').src = '';
  currentPreviewId = null;
  document.getElementById('videoTitle').value = '';
  document.getElementById('videoType').value  = '';
}

function removeVideo(id) {
  if (!confirm('Remove this video from portfolio?')) return;
  videos = videos.filter(v => v.id !== id);
  saveVideos();
  renderVideos();
  if (isLoggedIn) updateSlotStatus();
}

/* ══════════════════════════════════════════
   VIDEO LIGHTBOX MODAL
══════════════════════════════════════════ */
function openVideoModal(ytId, title, type, isPortrait) {
  const modal      = document.getElementById('video-modal');
  const inner      = document.getElementById('videoModalInner');
  const frame      = document.getElementById('videoModalFrame');
  const modalTitle = document.getElementById('modalTitle');
  const modalType  = document.getElementById('modalType');
  const ytLink     = document.getElementById('modalYtLink');

  frame.src             = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
  modalTitle.textContent = title;
  modalType.textContent  = type;
  ytLink.href            = `https://www.youtube.com/watch?v=${ytId}`;

  inner.classList.toggle('portrait-modal', isPortrait);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  const frame = document.getElementById('videoModalFrame');
  modal.classList.remove('open');
  frame.src = '';
  document.body.style.overflow = '';
}

/* Close modal on ESC or backdrop click */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoModal(); });
document.getElementById('video-modal').addEventListener('click', function (e) {
  if (e.target === this) closeVideoModal();
});

/* ══════════════════════════════════════════
   RENDER VIDEO GRID
   Row 1 (videos 1-3)  → landscape 16:9
   Row 2 (videos 4-6)  → portrait  9:16
   Row 3 (videos 7-9)  → landscape 16:9
══════════════════════════════════════════ */
function renderVideos() {
  const grid    = document.getElementById('videoGrid');
  const section = document.getElementById('portfolio');
  const navLi   = document.getElementById('navPortfolioLi');
  const badge   = document.getElementById('videoCountBadge');
  const limited = videos.slice(0, 9);

  if (limited.length === 0) {
    section.style.display = 'none';
    navLi.style.display   = 'none';
    grid.innerHTML = '';
    if (badge) badge.textContent = '0 / 9';
    return;
  }

  section.style.display = 'block';
  navLi.style.display   = 'list-item';
  if (badge) badge.textContent = `${limited.length} / 9`;

  function makeCard(v, isPortrait) {
    const format      = isPortrait ? 'PORTRAIT' : 'LANDSCAPE';
    const safeTitle   = v.title.replace(/'/g, "\\'");
    const safeType    = v.type.replace(/'/g, "\\'");
    return `
      <div class="video-card">
        <div class="video-thumb"
             onclick="openVideoModal('${v.ytId}','${safeTitle}','${safeType}',${isPortrait})">
          <img
            src="https://img.youtube.com/vi/${v.ytId}/maxresdefault.jpg"
            alt="${v.title}"
            onerror="this.src='https://img.youtube.com/vi/${v.ytId}/hqdefault.jpg'"
          >
          <div class="play-overlay">
            <div class="play-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <div class="video-type-tag">${v.type}</div>
          <div class="video-format-tag">${format}</div>
        </div>
        <div class="video-info">
          <span class="video-title">${v.title}</span>
          <span class="video-type-label">${v.type}</span>
        </div>
        <button class="video-remove" onclick="removeVideo(${v.id})">✕ REMOVE VIDEO</button>
      </div>
    `;
  }

  const row1 = limited.slice(0, 3);  /* landscape */
  const row2 = limited.slice(3, 6);  /* portrait  */
  const row3 = limited.slice(6, 9);  /* landscape */

  let html = '';
  if (row1.length) html += `<div class="video-row landscape-row">${row1.map(v => makeCard(v, false)).join('')}</div>`;
  if (row2.length) html += `<div class="video-row portrait-row">${row2.map(v => makeCard(v, true)).join('')}</div>`;
  if (row3.length) html += `<div class="video-row landscape-row">${row3.map(v => makeCard(v, false)).join('')}</div>`;

  grid.innerHTML = html;
  initReveal();
}

/* ── Init on page load ── */
renderVideos();
