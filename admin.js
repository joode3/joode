/* ============================================================
   admin.js — لوحة التحكم الكاملة
   ✅ رفع صور مباشر من الجهاز
   ✅ ضغط تلقائي (1200×800 / 75%)
   ✅ تصدير data.js للنشر على GitHub
   ✅ ترتيب بالسحب
   ============================================================ */

let ADMIN_USER = localStorage.getItem('jood_admin_user') || 'jood';
let ADMIN_PASS = localStorage.getItem('jood_admin_pass') || 'jood2025';

/* ── البيانات ── */
function getData() {
  const s = localStorage.getItem('jood_site_data');
  if (s) { try { return JSON.parse(s); } catch(e) {} }
  return JSON.parse(JSON.stringify(SITE_DATA));
}

function saveData(d) {
  localStorage.setItem('jood_site_data', JSON.stringify(d));
  updateOverviewCounts(d);
  updateStorageSize();
}

/* ══════════════════════════════════════
   LOGIN / LOGOUT
══════════════════════════════════════ */
function doLogin() {
  const u = document.getElementById('l-user').value.trim();
  const p = document.getElementById('l-pass').value;
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display    = 'block';
    document.getElementById('login-error').style.display = 'none';
    initAdmin();
  } else {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('l-pass').value = '';
  }
}

function doLogout() {
  document.getElementById('dashboard').style.display    = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('l-user').value = '';
  document.getElementById('l-pass').value = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none') doLogin();
});

/* ══════════════════════════════════════
   SIDEBAR
══════════════════════════════════════ */
const panelMeta = {
  overview:    ['نظرة عامة',         'أهلاً بك في لوحة التحكم 👋'],
  personal:    ['المعلومات الشخصية', 'عدّل اسمك ووصفك وأقسام الموقع'],
  skills:      ['المهارات',           'أضف أو عدّل مهاراتك'],
  projects:    ['المشاريع',           'أضف أو عدّل مشاريعك وصورها'],
  reviews:     ['التقييمات',          'آراء عملائك'],
  socials:     ['السوشيال ميديا',    'روابطك الاجتماعية'],
  timeline:    ['التسلسل الزمني',    'مسيرتك المهنية'],
  stats:       ['الإحصائيات',        'أرقام الهيرو'],
  export:      ['تصدير ونشر',        'حمّل data.js وارفعه على GitHub'],
  credentials: ['كلمة المرور',       'تغيير بيانات الدخول'],
};

function showPanel(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  const [title, sub] = panelMeta[name] || [name, ''];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-sub').textContent   = sub;
  if (name === 'export') updateStorageSize();
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
function initAdmin() {
  const d = getData();
  fillPersonal(d);
  buildSkillsEditor(d);
  buildProjectsEditor(d);
  buildReviewsEditor(d);
  buildSocialsEditor(d);
  buildTimelineEditor(d);
  fillStats(d);
  updateOverviewCounts(d);
  updateStorageSize();
  setText('curr-user', ADMIN_USER);
}

function updateOverviewCounts(d) {
  setText('ov-projects', d.projects.length);
  setText('ov-clients',  d.stats.clients.value);
  setText('ov-skills',   d.skills.length);
  setText('ov-reviews',  d.reviews.length);
}

/* ── مساعدات ── */
function setText(id, v) { const e = document.getElementById(id); if (e) e.textContent = v; }
function setVal(id, v)  { const e = document.getElementById(id); if (e) e.value = v || ''; }
function val(id)        { const e = document.getElementById(id); return e ? e.value.trim() : ''; }

/* ══════════════════════════════════════
   ضغط الصورة → Base64
══════════════════════════════════════ */
function compressImage(file, maxW, maxH, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ══════════════════════════════════════
   PERSONAL
══════════════════════════════════════ */
function fillPersonal(d) {
  const p = d.personal;
  setVal('p-name',      p.name);
  setVal('p-initial',   p.nameInitial);
  setVal('p-role',      p.role);
  setVal('p-available', p.available);
  setVal('p-desc',      p.desc);
  setVal('p-footer',    p.footerText);
  setVal('p-about1',    p.about1);
  setVal('p-about2',    p.about2);
  setVal('p-about3',    p.about3);
  // صورة البروفايل
  const previewEl = document.getElementById('p-photo-preview');
  if (previewEl) {
    if (p.photo) {
      previewEl.innerHTML = '<img src="' + p.photo + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block"/>';
    } else {
      previewEl.innerHTML = '<span style="font-size:28px">' + (p.nameInitial||'ج') + '</span>';
    }
  }
}

function savePersonal() {
  const d = getData();
  d.personal.name        = val('p-name')      || d.personal.name;
  d.personal.nameInitial = val('p-initial')   || d.personal.nameInitial;
  d.personal.role        = val('p-role')      || d.personal.role;
  d.personal.available   = val('p-available') || d.personal.available;
  d.personal.desc        = val('p-desc')      || d.personal.desc;
  d.personal.footerText  = val('p-footer')    || d.personal.footerText;
  d.personal.about1      = val('p-about1')    || d.personal.about1;
  d.personal.about2      = val('p-about2')    || d.personal.about2;
  d.personal.about3      = val('p-about3')    || d.personal.about3;
  saveData(d);
  showToast('✅ تم حفظ المعلومات الشخصية');
}

/* ── رفع صورة البروفايل ── */
async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('p-photo-status');
  statusEl.textContent = 'جاري الضغط...';
  statusEl.style.color = 'var(--text3)';

  try {
    // ضغط الصورة: 400×400، جودة 85%
    const compressed = await compressImage(file, 400, 400, 0.85);
    const d = getData();
    d.personal.photo = compressed;
    saveData(d);

    // تحديث المعاينة
    const previewEl = document.getElementById('p-photo-preview');
    previewEl.innerHTML = '<img src="' + compressed + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block"/>';

    statusEl.textContent = '✅ تم رفع الصورة';
    statusEl.style.color = 'var(--green)';
    showToast('✅ تم رفع صورتك الشخصية');
  } catch(err) {
    statusEl.textContent = '❌ فشل رفع الصورة';
    statusEl.style.color = 'var(--red)';
  }
  event.target.value = '';
}

/* ── حذف صورة البروفايل ── */
function deletePhoto() {
  const d = getData();
  d.personal.photo = '';
  saveData(d);
  const p = d.personal;
  const previewEl = document.getElementById('p-photo-preview');
  previewEl.innerHTML = '<span style="font-size:28px">' + (p.nameInitial||'ج') + '</span>';
  document.getElementById('p-photo-status').textContent = 'تم حذف الصورة';
  showToast('تم حذف الصورة الشخصية');
}

/* ══════════════════════════════════════
   SKILLS
══════════════════════════════════════ */
function buildSkillsEditor(d) {
  document.getElementById('skills-editor').innerHTML = d.skills.map((s, i) => `
    <div class="skill-edit-item">
      <div class="skill-edit-row">
        <input type="text"   value="${s.name}"  placeholder="اسم المهارة" id="sk-name-${i}" style="flex:2"/>
        <input type="number" value="${s.pct}"   min="0" max="100"          id="sk-pct-${i}"  style="width:70px"/>
        <input type="color"  value="${s.color}"                             id="sk-color-${i}" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--border2);cursor:pointer;flex-shrink:0;padding:2px"/>
        <button class="btn btn-danger btn-sm" onclick="deleteSkill(${i})"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
}

function addSkill() {
  const d = getData();
  d.skills.push({ name:'مهارة جديدة', pct:50, color:'#7c6aff' });
  saveData(d); buildSkillsEditor(d);
  showToast('تمت الإضافة');
}

function deleteSkill(i) {
  const d = getData();
  d.skills.splice(i, 1);
  saveData(d); buildSkillsEditor(d);
  showToast('تم الحذف');
}

function saveSkills() {
  const d = getData();
  d.skills = d.skills.map((s, i) => ({
    name:  document.getElementById(`sk-name-${i}`)?.value || s.name,
    pct:   parseInt(document.getElementById(`sk-pct-${i}`)?.value) || s.pct,
    color: document.getElementById(`sk-color-${i}`)?.value || s.color,
  }));
  saveData(d);
  showToast('✅ تم حفظ المهارات');
}

/* ══════════════════════════════════════
   PROJECTS EDITOR
══════════════════════════════════════ */
function buildProjectsEditor(d) {
  const el = document.getElementById('projects-editor');
  el.innerHTML = d.projects.map((p, i) => {
    const imgs = p.images || [];
    const thumbs = imgs.map((src, j) => `
      <div class="img-thumb-wrap">
        <img src="${src}" class="img-thumb-preview" onclick="previewImg('${src}')" title="اضغط للمعاينة"/>
        <button class="img-thumb-del" onclick="deleteProjectImage(${i},${j})" title="حذف">×</button>
      </div>`).join('');

    return `
    <div class="proj-card drag-item" draggable="true" data-index="${i}"
      ondragstart="dragStart(event,${i})" ondragover="dragOver(event)"
      ondrop="dragDrop(event,${i})" ondragend="dragEnd()">

      <div class="proj-card-head">
        <div style="display:flex;align-items:center;gap:8px">
          <i class="fas fa-grip-vertical drag-handle"></i>
          <span class="proj-card-num">${i + 1}</span>
          <span class="proj-card-title-text">${p.emoji || '📁'} ${p.title}</span>
          ${imgs.length > 0 ? `<span class="imgs-badge"><i class="fas fa-image"></i> ${imgs.length}</span>` : ''}
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="toggleProjCard(${i})" title="فتح/إغلاق">
            <i class="fas fa-chevron-down" id="proj-arrow-${i}" style="transition:transform .2s"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteProject(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </div>

      <div class="proj-card-body" id="proj-body-${i}">

        <!-- صف: إيموجي + سنة + رابط -->
        <div class="proj-row-3">
          <div>
            <label class="field-label-sm">إيموجي</label>
            <input value="${p.emoji||''}" id="pr-emoji-${i}" placeholder="🎯" style="text-align:center;font-size:20px"/>
          </div>
          <div>
            <label class="field-label-sm">السنة</label>
            <input value="${p.year||''}" id="pr-year-${i}" placeholder="2025" style="direction:ltr"/>
          </div>
          <div>
            <label class="field-label-sm">الرابط</label>
            <input value="${p.link||''}" id="pr-link-${i}" placeholder="https://..." style="direction:ltr"/>
          </div>
        </div>

        <div>
          <label class="field-label-sm">اسم المشروع</label>
          <input value="${p.title||''}" id="pr-title-${i}" placeholder="اسم المشروع"/>
        </div>

        <div>
          <label class="field-label-sm">الوصف</label>
          <textarea id="pr-desc-${i}" placeholder="وصف قصير">${p.desc||''}</textarea>
        </div>

        <div>
          <label class="field-label-sm">التاقات (مفصولة بفاصلة)</label>
          <input value="${(p.tags||[]).join(', ')}" id="pr-tags-${i}" placeholder="HTML, CSS, تصميم"/>
        </div>

        <div>
          <label class="field-label-sm"><i class="fab fa-youtube" style="color:#f87171"></i> فيديو يوتيوب (اختياري)</label>
          <input value="${p.youtube||''}" id="pr-yt-${i}" placeholder="https://youtu.be/..." style="direction:ltr"/>
        </div>

        <!-- ══ قسم الصور ══ -->
        <div class="imgs-section">
          <div class="imgs-section-head">
            <span>
              <i class="fas fa-images"></i> الصور
              <span class="imgs-count-badge" id="imgs-count-${i}">${imgs.length}</span>
            </span>
            <span style="font-size:10px;color:var(--text3)">يتم الضغط تلقائياً · max 1200px</span>
          </div>

          <!-- شبكة الصور + زر الرفع -->
          <div class="imgs-thumbs-grid" id="imgs-grid-${i}">
            ${thumbs}
            <label class="img-upload-zone">
              <input type="file" accept="image/*" multiple style="display:none"
                onchange="handleImgUpload(event,${i})"/>
              <i class="fas fa-plus" style="font-size:20px;margin-bottom:4px"></i>
              <span>رفع صورة</span>
              <span style="font-size:9px;color:var(--text3)">أو اسحب هنا</span>
            </label>
          </div>

          <!-- شريط تقدم الرفع -->
          <div class="upload-progress" id="upload-progress-${i}" style="display:none">
            <div class="upload-progress-fill" id="upload-bar-${i}"></div>
            <span class="upload-progress-txt" id="upload-text-${i}">جاري الضغط...</span>
          </div>
        </div>

      </div>
    </div>`;
  }).join('');
}

/* ── فتح/إغلاق ── */
function toggleProjCard(i) {
  const body  = document.getElementById(`proj-body-${i}`);
  const arrow = document.getElementById(`proj-arrow-${i}`);
  const open  = body.style.display !== 'none' && body.style.display !== '';
  body.style.display    = open ? 'none' : 'flex';
  arrow.style.transform = open ? 'rotate(-90deg)' : 'rotate(0deg)';
}

/* ── رفع الصور مع الضغط ── */
async function handleImgUpload(event, projIndex) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  const prog = document.getElementById(`upload-progress-${projIndex}`);
  const bar  = document.getElementById(`upload-bar-${projIndex}`);
  const txt  = document.getElementById(`upload-text-${projIndex}`);
  prog.style.display = 'flex';

  _saveProjectRow(projIndex);
  const d = getData();
  if (!d.projects[projIndex].images) d.projects[projIndex].images = [];

  for (let fi = 0; fi < files.length; fi++) {
    const file = files[fi];
    const pct  = Math.round((fi / files.length) * 90);
    bar.style.width      = pct + '%';
    txt.textContent      = `${fi + 1}/${files.length} — ضغط: ${file.name}`;

    try {
      const compressed = await compressImage(file, 1200, 800, 0.75);
      d.projects[projIndex].images.push(compressed);
      saveData(d);
      const countEl = document.getElementById(`imgs-count-${projIndex}`);
      if (countEl) countEl.textContent = d.projects[projIndex].images.length;
    } catch(err) {
      showToast(`⚠️ فشل: ${file.name}`);
    }
  }

  bar.style.width  = '100%';
  txt.textContent  = `✅ تم رفع ${files.length} صورة بنجاح`;
  setTimeout(() => { prog.style.display = 'none'; bar.style.width = '0'; }, 2500);

  buildProjectsEditor(getData());
  showToast(`✅ ${files.length} صورة مضغوطة ومحفوظة`);
  event.target.value = '';
}

/* ── معاينة صورة ── */
function previewImg(src) {
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  o.onclick = () => o.remove();
  o.innerHTML = `<img src="${src}" style="max-width:92vw;max-height:92vh;border-radius:10px;object-fit:contain"/>`;
  document.body.appendChild(o);
}

/* ── حذف صورة ── */
function deleteProjectImage(projIndex, imgIndex) {
  if (!confirm('حذف هذه الصورة؟')) return;
  _saveProjectRow(projIndex);
  const d = getData();
  d.projects[projIndex].images.splice(imgIndex, 1);
  saveData(d);
  buildProjectsEditor(d);
  showToast('تم الحذف');
}

/* ── حفظ صف مشروع ── */
function _saveProjectRow(i) {
  const d = getData();
  if (!d.projects[i]) return;
  d.projects[i].emoji   = document.getElementById(`pr-emoji-${i}`)?.value || d.projects[i].emoji;
  d.projects[i].title   = document.getElementById(`pr-title-${i}`)?.value || d.projects[i].title;
  d.projects[i].desc    = document.getElementById(`pr-desc-${i}`)?.value  || d.projects[i].desc;
  d.projects[i].tags    = (document.getElementById(`pr-tags-${i}`)?.value || '').split(',').map(t=>t.trim()).filter(Boolean);
  d.projects[i].year    = document.getElementById(`pr-year-${i}`)?.value  || d.projects[i].year;
  d.projects[i].link    = document.getElementById(`pr-link-${i}`)?.value  || d.projects[i].link;
  d.projects[i].youtube = document.getElementById(`pr-yt-${i}`)?.value    || '';
  saveData(d);
}

/* ── إضافة مشروع ── */
function addProject() {
  const d = getData();
  d.projects.push({ emoji:'🚀', bg:'linear-gradient(135deg,#0a001a,#1a003d)', title:'مشروع جديد', desc:'وصف المشروع', tags:['HTML','CSS'], year:'2025', link:'#', images:[], youtube:'' });
  saveData(d); buildProjectsEditor(d);
  showToast('تمت إضافة مشروع');
}

/* ── حذف مشروع ── */
function deleteProject(i) {
  if (!confirm('حذف هذا المشروع؟')) return;
  const d = getData();
  d.projects.splice(i, 1);
  saveData(d); buildProjectsEditor(d);
  showToast('تم الحذف');
}

/* ── حفظ كل المشاريع ── */
function saveProjects() {
  const d = getData();
  d.projects = d.projects.map((p, i) => ({
    emoji:   document.getElementById(`pr-emoji-${i}`)?.value || p.emoji,
    bg:      p.bg,
    title:   document.getElementById(`pr-title-${i}`)?.value || p.title,
    desc:    document.getElementById(`pr-desc-${i}`)?.value  || p.desc,
    tags:    (document.getElementById(`pr-tags-${i}`)?.value||'').split(',').map(t=>t.trim()).filter(Boolean),
    year:    document.getElementById(`pr-year-${i}`)?.value  || p.year,
    link:    document.getElementById(`pr-link-${i}`)?.value  || p.link,
    youtube: document.getElementById(`pr-yt-${i}`)?.value    || '',
    images:  p.images || [],
  }));
  saveData(d);
  showToast('✅ تم حفظ المشاريع');
}

/* ══════════════════════════════════════
   DRAG & DROP
══════════════════════════════════════ */
let _dragFrom = null;
function dragStart(e, i) { _dragFrom = i; e.currentTarget.style.opacity='0.4'; e.dataTransfer.effectAllowed='move'; }
function dragOver(e)     { e.preventDefault(); e.dataTransfer.dropEffect='move'; }
function dragEnd()       { _dragFrom=null; document.querySelectorAll('.drag-item').forEach(el=>el.style.opacity='1'); }
function dragDrop(e, to) {
  e.preventDefault();
  if (_dragFrom===null || _dragFrom===to) return;
  const d = getData();
  d.projects.forEach((_,i) => _saveProjectRow(i));
  const fresh = getData();
  const moved = fresh.projects.splice(_dragFrom,1)[0];
  fresh.projects.splice(to,0,moved);
  saveData(fresh); buildProjectsEditor(fresh);
  showToast('✅ تم تغيير الترتيب');
  _dragFrom = null;
}

/* ══════════════════════════════════════
   REVIEWS
══════════════════════════════════════ */
function buildReviewsEditor(d) {
  document.getElementById('reviews-editor').innerHTML = d.reviews.map((r,i) => `
    <div class="list-item">
      <div class="list-item-head">
        <p class="list-item-title">${r.name}</p>
        <button class="btn btn-danger btn-sm" onclick="deleteReview(${i})"><i class="fas fa-trash"></i></button>
      </div>
      <div class="list-item-body">
        <input value="${r.initials}" placeholder="الأحرف: TS"    id="rv-init-${i}"/>
        <input value="${r.name}"     placeholder="الاسم الكامل"  id="rv-name-${i}"/>
        <input value="${r.role}"     placeholder="المسمى الوظيفي" id="rv-role-${i}"/>
        <textarea placeholder="نص التقييم" id="rv-text-${i}">${r.text}</textarea>
      </div>
    </div>`).join('');
}
function addReview() {
  const d=getData(); d.reviews.push({initials:'XX',name:'اسم العميل',role:'صاحب عمل',text:'تقييم رائع!',avatarBg:'rgba(124,106,255,0.15)',avatarColor:'var(--accent2)'});
  saveData(d); buildReviewsEditor(d); showToast('تمت الإضافة');
}
function deleteReview(i) { const d=getData(); d.reviews.splice(i,1); saveData(d); buildReviewsEditor(d); showToast('تم الحذف'); }
function saveReviews() {
  const d=getData();
  d.reviews=d.reviews.map((r,i)=>({initials:document.getElementById(`rv-init-${i}`)?.value||r.initials,name:document.getElementById(`rv-name-${i}`)?.value||r.name,role:document.getElementById(`rv-role-${i}`)?.value||r.role,text:document.getElementById(`rv-text-${i}`)?.value||r.text,avatarBg:r.avatarBg,avatarColor:r.avatarColor}));
  saveData(d); showToast('✅ تم الحفظ');
}

/* ══════════════════════════════════════
   SOCIALS — إضافة وحذف وتعديل
══════════════════════════════════════ */

// قائمة كل أيقونات السوشيال المتاحة
const SOCIAL_OPTIONS = [
  { label: 'فيسبوك',      icon: 'fab fa-facebook-f',   placeholder: 'https://facebook.com/...' },
  { label: 'إنستغرام',   icon: 'fab fa-instagram',    placeholder: 'https://instagram.com/...' },
  { label: 'تيليغرام',   icon: 'fab fa-telegram',     placeholder: 'https://t.me/...' },
  { label: 'واتساب',     icon: 'fab fa-whatsapp',     placeholder: 'https://wa.me/...' },
  { label: 'يوتيوب',     icon: 'fab fa-youtube',      placeholder: 'https://youtube.com/...' },
  { label: 'تيك توك',    icon: 'fab fa-tiktok',       placeholder: 'https://tiktok.com/@...' },
  { label: 'تويتر/X',   icon: 'fab fa-x-twitter',    placeholder: 'https://x.com/...' },
  { label: 'لينكد إن',   icon: 'fab fa-linkedin-in',  placeholder: 'https://linkedin.com/in/...' },
  { label: 'سناب شات',   icon: 'fab fa-snapchat',     placeholder: 'https://snapchat.com/add/...' },
  { label: 'لينك تري',   icon: 'fas fa-link',         placeholder: 'https://linktr.ee/...' },
  { label: 'GitHub',      icon: 'fab fa-github',       placeholder: 'https://github.com/...' },
  { label: 'بينترست',    icon: 'fab fa-pinterest',    placeholder: 'https://pinterest.com/...' },
];

function buildSocialsEditor(d) {
  const opts = SOCIAL_OPTIONS.map((o,i) =>
    '<option value="' + i + '">' + o.label + '</option>'
  ).join('');

  const items = d.socials.map((s, i) => {
    // إيجاد index الأيقونة الحالية
    const optIdx = SOCIAL_OPTIONS.findIndex(o => o.icon === s.icon);
    const optsHtml = SOCIAL_OPTIONS.map((o, oi) =>
      '<option value="' + oi + '" ' + (oi === optIdx ? 'selected' : '') + '>' + o.label + '</option>'
    ).join('');

    return '<div class="social-edit-row" id="sc-row-' + i + '">' +
      '<div class="social-icon-preview" id="sc-icon-prev-' + i + '"><i class="' + s.icon + '"></i></div>' +
      '<select id="sc-type-' + i + '" onchange="changeSocialType(' + i + ',this.value)" style="background:var(--bg4);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font);font-size:12px;padding:6px 8px;outline:none;width:110px;flex-shrink:0">' +
        optsHtml +
      '</select>' +
      '<input value="' + s.link + '" id="sc-link-' + i + '" placeholder="https://..." style="flex:1;direction:ltr"/>' +
      '<button class="btn btn-danger btn-sm" onclick="deleteSocial(' + i + ')" title="حذف"><i class="fas fa-trash"></i></button>' +
    '</div>';
  }).join('');

  // زر إضافة جديد
  const addRow =
    '<div class="social-add-row">' +
      '<select id="sc-new-type" style="background:var(--bg4);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--font);font-size:12px;padding:6px 8px;outline:none;flex:1">' +
        opts +
      '</select>' +
      '<button class="btn btn-accent btn-sm" onclick="addSocial()" style="white-space:nowrap">' +
        '<i class="fas fa-plus"></i> إضافة' +
      '</button>' +
    '</div>';

  document.getElementById('socials-editor').innerHTML = items + addRow;
}

function changeSocialType(i, optIdx) {
  const opt = SOCIAL_OPTIONS[parseInt(optIdx)];
  if (!opt) return;
  // تحديث الأيقونة
  const prev = document.getElementById('sc-icon-prev-' + i);
  if (prev) prev.innerHTML = '<i class="' + opt.icon + '"></i>';
  // تحديث placeholder
  const input = document.getElementById('sc-link-' + i);
  if (input) input.placeholder = opt.placeholder;
}

function addSocial() {
  const sel = document.getElementById('sc-new-type');
  const opt = SOCIAL_OPTIONS[parseInt(sel.value)];
  if (!opt) return;
  // حفظ الحالي أولاً
  saveSocials(false);
  const d = getData();
  d.socials.push({ icon: opt.icon, label: opt.label, link: '' });
  saveData(d);
  buildSocialsEditor(d);
  showToast('تمت إضافة ' + opt.label);
}

function deleteSocial(i) {
  saveSocials(false);
  const d = getData();
  const name = d.socials[i] ? d.socials[i].label : '';
  d.socials.splice(i, 1);
  saveData(d);
  buildSocialsEditor(d);
  showToast('تم حذف ' + name);
}

function saveSocials(showMsg) {
  if (showMsg === undefined) showMsg = true;
  const d = getData();
  d.socials = d.socials.map(function(s, i) {
    const optIdx  = document.getElementById('sc-type-' + i);
    const linkEl  = document.getElementById('sc-link-' + i);
    const selOpt  = optIdx ? SOCIAL_OPTIONS[parseInt(optIdx.value)] : null;
    return {
      icon:  selOpt ? selOpt.icon  : s.icon,
      label: selOpt ? selOpt.label : s.label,
      link:  linkEl ? linkEl.value.trim() : s.link,
    };
  });
  saveData(d);
  if (showMsg) showToast('✅ تم حفظ الروابط');
}

/* ══════════════════════════════════════
   TIMELINE
══════════════════════════════════════ */
function buildTimelineEditor(d) {
  document.getElementById('timeline-editor').innerHTML = d.timeline.map((t,i)=>`
    <div class="tl-edit-item">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:12px;color:var(--text3)">${t.year} — ${t.title}</span>
        <button class="btn btn-danger btn-sm" onclick="deleteTimelineItem(${i})"><i class="fas fa-trash"></i></button>
      </div>
      <div class="tl-edit-grid">
        <input value="${t.year}"  placeholder="السنة"   id="tl-year-${i}"/>
        <input value="${t.title}" placeholder="العنوان" id="tl-title-${i}"/>
        <input value="${t.desc}"  placeholder="الوصف"   id="tl-desc-${i}"/>
      </div>
    </div>`).join('');
}
function addTimelineItem() { const d=getData(); d.timeline.push({year:'2025',title:'حدث جديد',desc:'وصف'}); saveData(d); buildTimelineEditor(d); showToast('تمت الإضافة'); }
function deleteTimelineItem(i) { const d=getData(); d.timeline.splice(i,1); saveData(d); buildTimelineEditor(d); showToast('تم الحذف'); }
function saveTimeline() {
  const d=getData();
  d.timeline=d.timeline.map((t,i)=>({year:document.getElementById(`tl-year-${i}`)?.value||t.year,title:document.getElementById(`tl-title-${i}`)?.value||t.title,desc:document.getElementById(`tl-desc-${i}`)?.value||t.desc}));
  saveData(d); showToast('✅ تم الحفظ');
}

/* ══════════════════════════════════════
   STATS
══════════════════════════════════════ */
function fillStats(d) { setVal('st-projects',d.stats.projects.value); setVal('st-clients',d.stats.clients.value); setVal('st-commits',d.stats.commits.value); setVal('st-hours',d.stats.hours.value); }
function saveStats() {
  const d=getData();
  d.stats.projects.value=parseInt(val('st-projects'))||d.stats.projects.value;
  d.stats.clients.value =parseInt(val('st-clients')) ||d.stats.clients.value;
  d.stats.commits.value =parseInt(val('st-commits')) ||d.stats.commits.value;
  d.stats.hours.value   =parseInt(val('st-hours'))   ||d.stats.hours.value;
  saveData(d); showToast('✅ تم الحفظ');
}

/* ══════════════════════════════════════
   CREDENTIALS
══════════════════════════════════════ */
function saveCredentials() {
  const nu=val('new-user'), np=val('new-pass'), cp=val('confirm-pass');
  if (!nu && !np) { showToast('أدخل بيانات جديدة'); return; }
  if (np && np!==cp) { showToast('❌ كلمتا المرور غير متطابقتان'); return; }
  if (nu) { ADMIN_USER=nu; localStorage.setItem('jood_admin_user',nu); setText('curr-user',nu); }
  if (np) { ADMIN_PASS=np; localStorage.setItem('jood_admin_pass',np); }
  setVal('new-user',''); setVal('new-pass',''); setVal('confirm-pass','');
  showToast('✅ تم حفظ بيانات الدخول');
}

/* ══════════════════════════════════════
   ✅ تصدير data.js
   — يولد الملف ويحمله — ارفعه على GitHub
══════════════════════════════════════ */
function exportDataJs() {
  const d = getData();
  let totalImgs = 0;
  d.projects.forEach(p => { totalImgs += (p.images||[]).length; });

  const content =
`/* ================================================================
   data.js — محتوى موقع جود
   تاريخ التصدير: ${new Date().toLocaleString('ar-IQ')}
   عدد الصور المضمنة: ${totalImgs} صورة
   ================================================================ */

const SITE_DATA = ${JSON.stringify(d, null, 2)};
`;
  const blob = new Blob([content], { type: 'text/javascript;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'data.js'; a.click();
  URL.revokeObjectURL(url);
  showToast('✅ تم تحميل data.js — ارفعه الآن على GitHub');
}

/* ── حساب حجم التخزين ── */
function updateStorageSize() {
  const d    = getData();
  const json = JSON.stringify(d);
  const kb   = Math.round(json.length / 1024);
  const pct  = Math.min(Math.round((kb / 5000) * 100), 100);
  const color = kb > 4000 ? 'var(--red)' : kb > 2500 ? 'var(--orange)' : 'var(--green)';

  const sizeEl = document.getElementById('storage-size');
  if (sizeEl) sizeEl.innerHTML = `<span style="color:${color};font-weight:600">${kb} KB</span> من 5,000 KB`;

  const barEl = document.getElementById('storage-bar');
  if (barEl) { barEl.style.width = pct+'%'; barEl.style.background = color; }

  let totalImgs = 0;
  d.projects.forEach(p => { totalImgs += (p.images||[]).length; });
  setText('export-img-count',  totalImgs);
  setText('export-proj-count', d.projects.length);
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}
