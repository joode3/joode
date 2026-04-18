/* ============================================================
   script.js — يقرأ من data.js ويبني الصفحة
   ============================================================ */

/* ══════════════════════════════════════
   تحميل البيانات (من localStorage إذا عُدِّلت، وإلا من data.js)
══════════════════════════════════════ */
function getData() {
  const saved = localStorage.getItem('jood_site_data');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  return SITE_DATA;
}

const D = getData();

/* ══════════════════════════════════════
   بناء الصفحة
══════════════════════════════════════ */
function buildPage() {
  const d = getData();

  // ── Personal
  const p = d.personal;
  setText('hero-name',      p.name);
  // صورة الهيرو
  const avatarEl = document.getElementById('hero-initial');
  if (avatarEl) {
    if (p.photo) {
      avatarEl.innerHTML = '<img src="' + p.photo + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block"/>';
      avatarEl.style.fontSize = '0';
    } else {
      avatarEl.innerHTML = p.nameInitial || 'ج';
      avatarEl.style.fontSize = '';
    }
  }
  setText('hero-role',      p.role);
  setText('hero-available', p.available);
  setText('hero-desc',      p.desc);
  setText('about-p1',       p.about1);
  setText('about-p2',       p.about2);
  setText('about-p3',       p.about3);
  setText('footer-copy',    p.footerText);
  setText('nav-name',       p.nameInitial + '<span>.</span>' + p.name.slice(1));

  // ── Timeline
  const tlEl = document.getElementById('timeline-container');
  if (tlEl) {
    tlEl.innerHTML = d.timeline.map(t => `
      <div class="tl-item">
        <p class="tl-year">${t.year}</p>
        <p class="tl-title">${t.title}</p>
        <p class="tl-desc">${t.desc}</p>
      </div>`).join('');
  }

  // ── Dash cards
  const dc = document.getElementById('dash-cards');
  if (dc) {
    dc.innerHTML = d.dashCards.map(c => `
      <div class="dash-card">
        <p class="dash-card-label">${c.label}</p>
        <p class="dash-card-value" style="color:${c.color}">${c.value}</p>
        <p class="dash-card-change ${c.up ? 'up' : 'warn'}">
          <i class="fas fa-${c.up ? 'arrow-up' : 'fire'}"></i> ${c.change}
        </p>
      </div>`).join('');
  }

  // ── Skills
  const sk = document.getElementById('skills-container');
  if (sk) {
    sk.innerHTML = d.skills.map(s => `
      <div class="skill-item">
        <div class="skill-header">
          <span class="skill-name">${s.name}</span>
          <span class="skill-pct">${s.pct}%</span>
        </div>
        <div class="skill-track">
          <div class="skill-fill" data-width="${s.pct}%" style="background:${s.color};width:0"></div>
        </div>
      </div>`).join('');
  }

  // ── Bar chart
  buildBarChart(d);

  // ── Projects
  const pr = document.getElementById('projects-container');
  if (pr) {
    pr.innerHTML = d.projects.map((p, i) => {
      const hasImages  = p.images && p.images.length > 0;
      const hasYoutube = p.youtube && p.youtube.trim() !== '';
      const thumbHtml  = hasImages
        ? '<img src="' + p.images[0] + '" alt="' + p.title + '" style="width:100%;height:100%;object-fit:cover;display:block"/>'
        : '<span style="font-size:48px">' + p.emoji + '</span>';

      return '<div class="project-card" onclick="openProjectModal(' + i + ')" style="cursor:pointer">' +
        '<div class="project-thumb" style="background:' + p.bg + '">' +
          thumbHtml +
          (hasImages && p.images.length > 1 ? '<span class="img-count"><i class="fas fa-images"></i> ' + p.images.length + '</span>' : '') +
          (hasYoutube ? '<span class="img-count" style="left:auto;right:10px"><i class="fab fa-youtube"></i></span>' : '') +
        '</div>' +
        '<div class="project-body">' +
          '<div class="project-tags">' + p.tags.map(function(t){ return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' +
          '<p class="project-title">' + p.title + '</p>' +
          '<p class="project-desc">' + p.desc + '</p>' +
          '<div class="project-footer">' +
            '<span>' + p.year + '</span>' +
            '<span class="project-link">تفاصيل <i class="fas fa-arrow-left"></i></span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  // ── Reviews
  const rv = document.getElementById('reviews-container');
  if (rv) {
    rv.innerHTML = d.reviews.map(r => `
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p class="review-text">"${r.text}"</p>
        <div class="reviewer-info">
          <div class="rev-avatar" style="background:${r.avatarBg};color:${r.avatarColor}">${r.initials}</div>
          <div>
            <p class="rev-name">${r.name}</p>
            <p class="rev-role">${r.role}</p>
          </div>
        </div>
      </div>`).join('');
  }

  // ── Social links
  const sl = document.getElementById('social-links');
  if (sl) {
    sl.innerHTML = d.socials.map(s => `
      <a href="${s.link}" class="contact-link" target="_blank">
        <div class="contact-link-icon"><i class="${s.icon}"></i></div>
        <span>${s.label}</span>
      </a>`).join('');
  }

  // ── Footer socials
  const fs = document.getElementById('footer-socials');
  if (fs) {
    fs.innerHTML = d.socials.map(s => `
      <a href="${s.link}" class="soc" target="_blank"><i class="${s.icon}"></i></a>`).join('');
  }
}

/* ══════════════════════════════════════
   رسم الرسم البياني
══════════════════════════════════════ */
function buildBarChart(d) {
  const el = document.getElementById('bar-chart');
  if (!el) return;
  el.innerHTML = '';
  const act  = d.activity;
  const maxH = Math.max(...act.hours);
  act.months.forEach((m, i) => {
    const pct = (act.hours[i] / maxH) * 100;
    const col = document.createElement('div');
    col.className = 'bar-col';
    col.innerHTML = `
      <div class="bar" title="${act.hours[i]}h"
        style="height:${pct}%;background:${act.colors[i]};opacity:${0.5+(i/act.months.length)*0.5}"></div>
      <span class="bar-lbl">${m}</span>`;
    el.appendChild(col);
  });
}

/* ══════════════════════════════════════
   مساعدات
══════════════════════════════════════ */
function setText(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* ══════════════════════════════════════
   عدادات الأرقام
══════════════════════════════════════ */
function animateCount(el, target, suffix) {
  let cur = 0;
  const step = target / 60;
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = Math.round(cur) + suffix;
    if (cur >= target) clearInterval(t);
  }, 25);
}

/* ══════════════════════════════════════
   Scroll animations
══════════════════════════════════════ */
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(b => {
        setTimeout(() => { b.style.width = b.dataset.width; }, 200);
      });
    }
  });
}, { threshold: 0.3 });


/* ══════════════════════════════════════
   PROJECT MODAL — نافذة تفاصيل المشروع
══════════════════════════════════════ */
function openProjectModal(index) {
  const d = getData();
  const p = d.projects[index];
  if (!p) return;

  const hasImages  = p.images && p.images.length > 0;
  const hasYoutube = p.youtube && p.youtube.trim() !== '';
  const hasLink    = p.link && p.link !== '#';

  // ── بناء معرض الصور ──
  let galleryHtml = '';
  let allMedia = [];

  if (hasYoutube) {
    const ytId = extractYoutubeId(p.youtube);
    if (ytId) allMedia.push({ type: 'youtube', id: ytId });
  }
  if (hasImages) {
    p.images.forEach(src => allMedia.push({ type: 'image', src }));
  }

  if (allMedia.length > 0) {
    // الصورة/الفيديو الرئيسي
    const firstMedia = allMedia[0];
    const mainHtml = firstMedia.type === 'youtube'
      ? '<div style="position:relative;padding-bottom:56.25%;height:0;border-radius:10px;overflow:hidden"><iframe src="https://www.youtube.com/embed/' + firstMedia.id + '" style="position:absolute;inset:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>'
      : '<img src="' + firstMedia.src + '" id="modal-main-img" style="width:100%;max-height:420px;object-fit:cover;border-radius:10px;display:block;cursor:zoom-in" onclick="zoomImg(this.src)"/>';

    // thumbnails
    const thumbsHtml = allMedia.length > 1
      ? '<div class="modal-thumbs">' +
          allMedia.map(function(m, mi) {
            if (m.type === 'youtube') {
              return '<div class="modal-thumb ' + (mi===0?'active':'') + '" onclick="switchModalMedia(' + index + ',' + mi + ',this)">' +
                '<div style="background:#1a1a2e;width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:5px">' +
                '<i class="fab fa-youtube" style="color:#f87171;font-size:16px"></i></div></div>';
            }
            return '<div class="modal-thumb ' + (mi===0?'active':'') + '" onclick="switchModalMedia(' + index + ',' + mi + ',this)">' +
              '<img src="' + m.src + '" style="width:100%;height:100%;object-fit:cover;border-radius:5px"/></div>';
          }).join('') +
        '</div>'
      : '';

    galleryHtml =
      '<div class="modal-gallery">' +
        '<div id="modal-main-media">' + mainHtml + '</div>' +
        thumbsHtml +
      '</div>';
  } else {
    // لا صور — عرض إيموجي كبير
    galleryHtml =
      '<div class="modal-emoji-hero" style="background:' + p.bg + '">' +
        '<span style="font-size:72px">' + p.emoji + '</span>' +
      '</div>';
  }

  // ── بناء التاقات ──
  const tagsHtml = (p.tags || []).map(function(t) {
    return '<span class="tag">' + t + '</span>';
  }).join('');

  // ── HTML كامل للـ modal ──
  const modalHtml =
    '<div class="proj-modal-overlay" id="proj-modal" onclick="closeProjModal(event)">' +
      '<div class="proj-modal-box">' +

        // زر الإغلاق
        '<button class="proj-modal-close" onclick="closeProjModal()">' +
          '<i class="fas fa-times"></i>' +
        '</button>' +

        // قسم اليسار: المعرض
        '<div class="proj-modal-left">' +
          galleryHtml +
        '</div>' +

        // قسم اليمين: التفاصيل
        '<div class="proj-modal-right">' +
          '<div class="proj-modal-tags">' + tagsHtml + '</div>' +
          '<h2 class="proj-modal-title">' + p.emoji + ' ' + p.title + '</h2>' +
          '<p class="proj-modal-year"><i class="fas fa-calendar-alt"></i> ' + p.year + '</p>' +
          '<p class="proj-modal-desc">' + p.desc + '</p>' +

          // زر رابط المشروع
          (hasLink
            ? '<a href="' + p.link + '" target="_blank" class="proj-modal-btn">' +
                '<i class="fas fa-external-link-alt"></i> زيارة الموقع' +
              '</a>'
            : '<span class="proj-modal-btn-disabled">' +
                '<i class="fas fa-clock"></i> قريباً' +
              '</span>'
          ) +

          // معلومات إضافية
          '<div class="proj-modal-meta">' +
            (hasImages
              ? '<div class="proj-meta-item"><i class="fas fa-images"></i> ' + p.images.length + ' صورة</div>'
              : '') +
            (hasYoutube
              ? '<div class="proj-meta-item"><i class="fab fa-youtube" style="color:#f87171"></i> فيديو يوتيوب</div>'
              : '') +
          '</div>' +
        '</div>' +

      '</div>' +
    '</div>';

  // أضف الـ modal للصفحة
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  setTimeout(function() {
    document.getElementById('proj-modal').classList.add('open');
  }, 10);

  // حفظ بيانات الـ modal للتنقل بين الصور
  window._modalMedia  = allMedia;
  window._modalCurrent = 0;

  // إغلاق بـ ESC
  document.addEventListener('keydown', _modalEscHandler);
}

function _modalEscHandler(e) {
  if (e.key === 'Escape') closeProjModal();
}

function closeProjModal(event) {
  // إذا الضغط على الـ overlay وليس الـ box
  if (event && event.target.id !== 'proj-modal') return;
  const modal = document.getElementById('proj-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(function() { modal.remove(); }, 300);
  document.removeEventListener('keydown', _modalEscHandler);
}

function switchModalMedia(projIndex, mediaIndex, thumbEl) {
  const allMedia = window._modalMedia;
  if (!allMedia || !allMedia[mediaIndex]) return;

  const media = allMedia[mediaIndex];
  const mainEl = document.getElementById('modal-main-media');
  if (!mainEl) return;

  if (media.type === 'youtube') {
    mainEl.innerHTML =
      '<div style="position:relative;padding-bottom:56.25%;height:0;border-radius:10px;overflow:hidden">' +
        '<iframe src="https://www.youtube.com/embed/' + media.id + '" style="position:absolute;inset:0;width:100%;height:100%;border:none" allowfullscreen></iframe>' +
      '</div>';
  } else {
    mainEl.innerHTML =
      '<img src="' + media.src + '" id="modal-main-img" style="width:100%;max-height:420px;object-fit:cover;border-radius:10px;display:block;cursor:zoom-in" onclick="zoomImg(this.src)"/>';
  }

  // تحديث thumbnails
  document.querySelectorAll('.modal-thumb').forEach(function(t, i) {
    t.classList.toggle('active', i === mediaIndex);
  });
  window._modalCurrent = mediaIndex;
}

function zoomImg(src) {
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  o.onclick = function() { o.remove(); };
  o.innerHTML = '<img src="' + src + '" style="max-width:95vw;max-height:95vh;border-radius:8px;object-fit:contain"/>';
  document.body.appendChild(o);
}

function extractYoutubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/);
  return m ? m[1] : null;
}


/* ══════════════════════════════════════
   معرض الصور (Lightbox) — قديم متروك
══════════════════════════════════════ */
function openGallery(projectIndex) {
  const d = getData();
  const p = d.projects[projectIndex];
  if (!p) return;

  const hasImages  = p.images && p.images.length > 0;
  const hasYoutube = p.youtube && p.youtube.trim() !== '';
  if (!hasImages && !hasYoutube) return;

  let currentImg = 0;

  // بناء محتوى المعرض
  let mediaHtml = '';

  if (hasYoutube) {
    const ytId = extractYoutubeId(p.youtube);
    if (ytId) {
      mediaHtml += `
        <div class="gallery-media-item" id="yt-slide">
          <div style="position:relative;padding-bottom:56.25%;height:0;border-radius:12px;overflow:hidden">
            <iframe src="https://www.youtube.com/embed/${ytId}" style="position:absolute;inset:0;width:100%;height:100%;border:none" allowfullscreen></iframe>
          </div>
          <p style="text-align:center;font-size:12px;color:var(--text3);margin-top:8px;font-family:var(--font-mono)">فيديو يوتيوب</p>
        </div>`;
    }
  }

  if (hasImages) {
    mediaHtml += p.images.map((src, i) => `
      <div class="gallery-media-item" id="img-slide-${i}" style="${i > 0 ? 'display:none' : ''}">
        <img src="${src}" alt="صورة ${i+1}" style="width:100%;max-height:500px;object-fit:contain;border-radius:12px;display:block"/>
        <p style="text-align:center;font-size:12px;color:var(--text3);margin-top:8px;font-family:var(--font-mono)">صورة ${i+1} من ${p.images.length}</p>
      </div>`).join('');
  }

  // بناء أزرار التنقل
  const totalSlides = (hasYoutube ? 1 : 0) + (hasImages ? p.images.length : 0);
  const navHtml = totalSlides > 1 ? `
    <div class="gallery-nav">
      <button class="gallery-nav-btn" onclick="gallerySlidePrev()"><i class="fas fa-chevron-right"></i></button>
      <span class="gallery-counter" id="gallery-counter">1 / ${totalSlides}</span>
      <button class="gallery-nav-btn" onclick="gallerySlideNext()"><i class="fas fa-chevron-left"></i></button>
    </div>` : '';

  // بناء thumbnails
  let thumbsHtml = '';
  if (totalSlides > 1) {
    thumbsHtml = '<div class="gallery-thumbs">';
    if (hasYoutube) {
      const ytId = extractYoutubeId(p.youtube);
      thumbsHtml += `<div class="gallery-thumb active" onclick="galleryGoTo(0)" id="thumb-0">
        <div style="background:#1a1a2e;width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:6px">
          <i class="fab fa-youtube" style="color:#f87171;font-size:18px"></i>
        </div></div>`;
    }
    if (hasImages) {
      const offset = hasYoutube ? 1 : 0;
      p.images.forEach((src, i) => {
        thumbsHtml += `<div class="gallery-thumb ${!hasYoutube && i===0 ? 'active' : ''}" onclick="galleryGoTo(${i+offset})" id="thumb-${i+offset}">
          <img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/></div>`;
      });
    }
    thumbsHtml += '</div>';
  }

  // إنشاء الـ overlay
  const overlay = document.createElement('div');
  overlay.id = 'gallery-overlay';
  overlay.innerHTML = `
    <div class="gallery-backdrop" onclick="closeGallery()"></div>
    <div class="gallery-modal">
      <div class="gallery-header">
        <p class="gallery-title">${p.title}</p>
        <button class="gallery-close" onclick="closeGallery()"><i class="fas fa-times"></i></button>
      </div>
      <div class="gallery-slides" id="gallery-slides">${mediaHtml}</div>
      ${navHtml}
      ${thumbsHtml}
    </div>`;
  document.body.appendChild(overlay);

  // حفظ المتغيرات للتنقل
  window._galleryTotal  = totalSlides;
  window._galleryCurrent = 0;
  window._galleryHasYt  = hasYoutube;
  window._galleryImgCount = hasImages ? p.images.length : 0;

  setTimeout(() => overlay.classList.add('open'), 10);
}

function extractYoutubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/);
  return m ? m[1] : null;
}

function closeGallery() {
  const o = document.getElementById('gallery-overlay');
  if (o) { o.classList.remove('open'); setTimeout(() => o.remove(), 300); }
}

function galleryGoTo(index) {
  const total = window._galleryTotal || 0;
  if (index < 0 || index >= total) return;

  // إخفاء الكل
  const hasYt    = window._galleryHasYt;
  const imgCount = window._galleryImgCount;
  if (hasYt) document.getElementById('yt-slide')?.style.setProperty('display','none');
  for (let i = 0; i < imgCount; i++) document.getElementById(`img-slide-${i}`)?.style.setProperty('display','none');

  // إظهار المطلوب
  if (hasYt && index === 0) document.getElementById('yt-slide').style.display = 'block';
  else {
    const imgIndex = hasYt ? index - 1 : index;
    document.getElementById(`img-slide-${imgIndex}`).style.display = 'block';
  }

  // تحديث counter
  const counter = document.getElementById('gallery-counter');
  if (counter) counter.textContent = `${index + 1} / ${total}`;

  // تحديث thumbnails
  document.querySelectorAll('.gallery-thumb').forEach((t, i) => t.classList.toggle('active', i === index));

  window._galleryCurrent = index;
}

function gallerySlideNext() { galleryGoTo((window._galleryCurrent + 1) % window._galleryTotal); }
function gallerySlidePrev() { galleryGoTo((window._galleryCurrent - 1 + window._galleryTotal) % window._galleryTotal); }

// إغلاق بـ ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeGallery();
  if (e.key === 'ArrowLeft')  gallerySlideNext();
  if (e.key === 'ArrowRight') gallerySlidePrev();
});


/* ══════════════════════════════════════
   Toast
══════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ══════════════════════════════════════
   إرسال الرسالة
══════════════════════════════════════ */
function sendMsg() {
  const n = document.getElementById('f-name').value.trim();
  const e = document.getElementById('f-email').value.trim();
  const m = document.getElementById('f-msg').value.trim();
  if (!n || !e || !m) { showToast('الرجاء ملء جميع الحقول'); return; }
  showToast('تم إرسال رسالتك! سأرد قريباً 👋');
  document.getElementById('f-name').value  = '';
  document.getElementById('f-email').value = '';
  document.getElementById('f-msg').value   = '';
}



/* ══════════════════════════════════════
   التهيئة عند تحميل الصفحة
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildPage();

  // عدادات
  const d = getData();
  setTimeout(() => {
    animateCount(document.getElementById('cnt-projects'), d.stats.projects.value, d.stats.projects.suffix);
    animateCount(document.getElementById('cnt-clients'),  d.stats.clients.value,  d.stats.clients.suffix);
    animateCount(document.getElementById('cnt-commits'),  d.stats.commits.value,  d.stats.commits.suffix);
    animateCount(document.getElementById('cnt-hours'),    d.stats.hours.value,    d.stats.hours.suffix);
  }, 400);

  // Scroll animations
  document.querySelectorAll('.fade-in').forEach(el => fadeObs.observe(el));
  document.querySelectorAll('.dash-wrapper').forEach(el => skillObs.observe(el));
});
