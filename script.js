/* ============================================================
   JOOD PORTFOLIO — script.js
   Sections:
     1. Counter Animation  (hero stats)
     2. Bar Chart          (coding activity)
     3. Scroll Animations  (fade-in on scroll)
     4. Skill Bar Reveal   (animate when dashboard visible)
     5. Toast Notification (popup helper)
     6. Send Message       (contact form)
     7. Download CV        (placeholder)
   ============================================================ */


/* ══════════════════════════════════════════════════════════
   1. COUNTER ANIMATION
   — Counts numbers up from 0 to target when page loads
   — To change stats: edit the numbers below
   ══════════════════════════════════════════════════════════ */

function animateCount(el, target, suffix = '') {
  let current = 0;
  const step = target / 60;          // run for ~60 frames

  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current) + suffix;

    if (current >= target) {
      clearInterval(timer);          // stop when we reach the target
    }
  }, 25);                            // runs every 25ms ≈ 40fps
}

// Wait 400ms after page load, then start counting
setTimeout(() => {
  animateCount(document.getElementById('cnt-projects'), 5);       // 5 projects
  animateCount(document.getElementById('cnt-clients'),  8);       // 8 clients
  animateCount(document.getElementById('cnt-commits'),  120, '+'); // 120+ commits
  animateCount(document.getElementById('cnt-hours'),    300, '+'); // 300+ hours
}, 400);


/* ══════════════════════════════════════════════════════════
   2. BAR CHART  (Coding Activity)
   — To change chart data: edit months[] and hours[] below
   ══════════════════════════════════════════════════════════ */

// Chart data — edit these arrays to update the chart
const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const hours  = [18,    25,    30,    42,    55,    68,    80   ];

// Bar colors — one per month (light → dark purple progression)
const barColors = [
  '#534AB7',
  '#6b5dd3',
  '#7c6aff',
  '#9381ff',
  '#a899ff',
  '#a78bfa',
  '#c4b5fd',
];

const maxHours  = Math.max(...hours);
const chartEl   = document.getElementById('bar-chart');

months.forEach((month, i) => {
  const heightPercent = (hours[i] / maxHours) * 100;
  const opacity       = 0.5 + (i / months.length) * 0.5; // bars get more opaque L→R

  // Create column wrapper
  const col = document.createElement('div');
  col.className = 'bar-col';

  col.innerHTML = `
    <div
      class="bar"
      title="${hours[i]}h"
      style="
        height:     ${heightPercent}%;
        background: ${barColors[i]};
        opacity:    ${opacity};
      "
    ></div>
    <span class="bar-lbl">${month}</span>
  `;

  chartEl.appendChild(col);
});


/* ══════════════════════════════════════════════════════════
   3. SCROLL ANIMATIONS
   — Elements with class "fade-in" start invisible
   — They become visible (.visible class) when scrolled into view
   ══════════════════════════════════════════════════════════ */

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }   // trigger when 10% of element is visible
);

document.querySelectorAll('.fade-in').forEach((el) => {
  fadeObserver.observe(el);
});


/* ══════════════════════════════════════════════════════════
   4. SKILL BAR REVEAL
   — Each .skill-fill starts at width: 0
   — When the dashboard scrolls into view, bars animate to
     their target width (set via data-width in HTML)
   ══════════════════════════════════════════════════════════ */

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {

        entry.target.querySelectorAll('.skill-fill').forEach((bar) => {
          // Small delay so the animation feels intentional
          setTimeout(() => {
            bar.style.width = bar.dataset.width;  // e.g. "90%"
          }, 200);
        });

      }
    });
  },
  { threshold: 0.3 }   // trigger when 30% of dashboard is visible
);

document.querySelectorAll('.dash-wrapper').forEach((el) => {
  skillObserver.observe(el);
});


/* ══════════════════════════════════════════════════════════
   5. TOAST NOTIFICATION
   — Call showToast('Your message') from anywhere
   ══════════════════════════════════════════════════════════ */

function showToast(message) {
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  toastMsg.textContent = message;
  toast.classList.add('show');

  // Auto-hide after 3.5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}


/* ══════════════════════════════════════════════════════════
   6. SEND MESSAGE  (Contact Form)
   — Validates fields then shows success toast
   — To connect to a real backend: replace the showToast
     call with a fetch() POST to your server
   ══════════════════════════════════════════════════════════ */

function sendMsg() {
  const name    = document.getElementById('f-name').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const message = document.getElementById('f-msg').value.trim();

  // Basic validation — make sure all fields are filled
  if (!name || !email || !message) {
    showToast('Please fill all fields first');
    return;
  }

  // ── Send to backend here (optional) ──────────────────
  // Example:
  // fetch('/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, email, message })
  // });
  // ─────────────────────────────────────────────────────

  // For now: show success and clear the form
  showToast("Message sent! I'll reply soon 👋");

  document.getElementById('f-name').value  = '';
  document.getElementById('f-email').value = '';
  document.getElementById('f-msg').value   = '';
}


/* ══════════════════════════════════════════════════════════
   7. DOWNLOAD CV
   — Currently shows a toast (CV not attached yet)
   — To enable real download: replace showToast() with:
     window.location.href = 'jood-cv.pdf';
   ══════════════════════════════════════════════════════════ */

function downloadCV(event) {
  event.preventDefault();
  showToast('CV download will be available soon!');

  // To enable:
  // window.location.href = 'jood-cv.pdf';
}
