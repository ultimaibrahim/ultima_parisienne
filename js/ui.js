/* ══════════════════════════════════════════════════════════════
   ui.js · Portal Operativo LCP
   Dark mode, toast, notificaciones, routing, onboarding
   ══════════════════════════════════════════════════════════════ */

/* ── Dark Mode ────────────────────────────────────────────── */
function initDark() { if (localStorage.getItem(DM_KEY) === '1') applyDark(true, false); }
function toggleDark() { applyDark(document.documentElement.getAttribute('data-theme') !== 'dark', true); }
function applyDark(on, save) {
  document.documentElement.setAttribute('data-theme', on ? 'dark' : 'light');
  $('dm-icon').textContent  = on ? '☀️' : '🌙';
  $('dm-label').textContent = on ? 'Claro' : 'Oscuro';
  if (save) localStorage.setItem(DM_KEY, on ? '1' : '0');
  if (typeof chartVentas !== 'undefined' && chartVentas) updateChartColors();
}
initDark();

/* ── Onboarding ───────────────────────────────────────────── */
let obActual = 0;
function initOnboarding() {
  if (localStorage.getItem(OB_KEY)) { $('onboarding').style.display = 'none'; iniciarFlujoAuth(); }
}
function nextOb(n) { $('ob-'+obActual).classList.remove('active'); obActual = n; $('ob-'+obActual).classList.add('active'); }
function cerrarOnboarding() {
  const ob = $('onboarding');
  ob.classList.add('fade-out');
  localStorage.setItem(OB_KEY, '1');
  setTimeout(() => { ob.style.display = 'none'; iniciarFlujoAuth(); }, 650);
}

/* ── Routing / Secciones ──────────────────────────────────── */
function showSection(id, btn) {
  if (id === 'admin-section' && !isLeadership(currentUser)) { id = 'inicio'; btn = null; }
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const sec = document.getElementById(id); if (!sec) return;
  sec.classList.add('active');
  if (btn) { btn.classList.add('active'); } else {
    const idx = SECCIONES.indexOf(id);
    if (idx >= 0) { const tabs = document.querySelectorAll('.nav-tab'); if (tabs[idx]) tabs[idx].classList.add('active'); }
  }
  // Mobile nav sync
  const mnId = MOBILE_MAP[id];
  document.querySelectorAll('.mobile-nav-tab').forEach(t => t.classList.remove('active'));
  if (mnId && $(mnId)) $(mnId).classList.add('active');
  sec.querySelectorAll('.anim').forEach(el => { el.style.animation = 'none'; void el.offsetHeight; el.style.animation = ''; });
  if (window.location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'dashboard') initDashboard();
  if (id === 'juntas')    cargarJuntas();
  if (id === 'admin-section' && typeof apiCall !== 'undefined' && isLeadership(currentUser)) {
    apiCall('getLecturas', {}).then(r => { if (r.ok) renderAdminLecturas(r.lecturas); });
  }
}

function setMobileTab(id) {
  document.querySelectorAll('.mobile-nav-tab').forEach(t => t.classList.remove('active'));
  const t = $(id); if (t) t.classList.add('active');
}

window.addEventListener('load', () => {
  const h = window.location.hash.replace('#', '');
  if (SECCIONES.includes(h) && currentUser) showSection(h, null);
});
window.addEventListener('hashchange', () => {
  const h = window.location.hash.replace('#', '');
  if (SECCIONES.includes(h)) showSection(h, null);
});

/* ── User Menu ────────────────────────────────────────────── */
function toggleUserMenu(e) {
  if (e) e.stopPropagation();
  const chip = $('user-chip-btn'), menu = $('user-menu'), open = !menu.classList.contains('visible');
  menu.classList.toggle('visible', open); chip.classList.toggle('open', open);
  chip.setAttribute('aria-expanded', open ? 'true' : 'false');
  $('notif-dropdown').classList.remove('visible');
}
function cerrarUserMenu() {
  $('user-menu').classList.remove('visible');
  $('user-chip-btn').classList.remove('open');
  $('user-chip-btn').setAttribute('aria-expanded', 'false');
}
function irAMiSucursal() { cerrarUserMenu(); showSection('sucursales', null); }

document.addEventListener('click', e => {
  const menu = $('user-menu'), chip = $('user-chip-btn');
  const nd = $('notif-dropdown'), nb = $('notif-btn');
  if (menu && menu.classList.contains('visible') && !menu.contains(e.target) && !chip.contains(e.target)) cerrarUserMenu();
  if (nd && nd.classList.contains('visible') && !nd.contains(e.target) && !nb.contains(e.target)) nd.classList.remove('visible');
});

function toggleNotifDropdown(e) {
  e.stopPropagation();
  $('notif-dropdown').classList.toggle('visible');
  cerrarUserMenu();
}

/* ── Notificaciones ───────────────────────────────────────── */
function getNotifs()       { try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); } catch { return []; } }
function saveNotifs(arr)   { localStorage.setItem(NOTIF_KEY, JSON.stringify(arr.slice(0, 20))); }
function pushNotif(titulo, texto) {
  const arr = getNotifs();
  arr.unshift({ id: Date.now(), titulo, texto, ts: Date.now(), leida: false });
  saveNotifs(arr); renderNotifs();
}
function limpiarNotifs() {
  const arr = getNotifs().map(n => ({...n, leida: true})); saveNotifs(arr); renderNotifs();
}
function formatRelTime(ts) {
  const diff = Date.now() - ts, m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
  if (m < 1) return 'Ahora'; if (m < 60) return m + 'min'; if (h < 24) return h + 'h'; return d + 'd';
}
function renderNotifs() {
  const arr = getNotifs();
  const unread = arr.filter(n => !n.leida).length;
  const badge = $('notif-badge');
  if (unread > 0) { badge.textContent = unread > 9 ? '9+' : String(unread); badge.classList.add('visible'); }
  else            { badge.classList.remove('visible'); }
  const list = $('notif-list');
  if (!arr.length) { list.innerHTML = '<div class="notif-empty">Sin notificaciones nuevas</div>'; return; }
  list.innerHTML = arr.map(n => `
    <div class="notif-item${n.leida ? '' : ' unread'}">
      ${n.leida ? '' : '<div class="notif-dot"></div>'}
      <div style="flex:1;">
        <div class="notif-item-text"><strong>${escapeHtml(n.titulo)}</strong><br>${escapeHtml(n.texto)}</div>
        <div class="notif-item-time">${formatRelTime(n.ts)}</div>
      </div>
    </div>`).join('');
}
renderNotifs();

/* ── Toast ────────────────────────────────────────────────── */
let toastTimeout = null;
function mostrarToast(msg) {
  let t = $('lcp-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'lcp-toast';
    t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--verde-deep);color:var(--crema);padding:11px 22px;border-radius:24px;font-size:13px;font-weight:500;z-index:1000;box-shadow:var(--shadow-lg);opacity:0;transition:opacity .25s;font-family:"DM Sans",sans-serif;pointer-events:none;white-space:nowrap;';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1'; clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

/* ── Instrucciones / Changelog ────────────────────────────── */
function toggleInstrucciones(btn) {
  const panel = $('instrucciones-panel'), v = panel.classList.toggle('visible');
  btn.textContent = v ? '✕ Cerrar instrucciones' : '📖 Instrucciones';
}
function cerrarInstrucciones() {
  $('instrucciones-panel').classList.remove('visible');
  const b = document.querySelector('.btn-instrucciones-global'); if (b) b.textContent = '📖 Instrucciones';
}
function toggleChangelog() { $('changelog-panel').classList.toggle('visible'); }

/* ── Fecha y semana actual ────────────────────────────────── */
function initFechaHoy() {
  const hoy   = new Date();
  $('fecha-hoy').textContent = hoy.toLocaleDateString('es-MX', {weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const lunes   = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay()+6) % 7));
  const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
  const fc = {day:'numeric', month:'short'};
  $('semana-label').textContent = `Sem. ${lunes.toLocaleDateString('es-MX',fc)} – ${domingo.toLocaleDateString('es-MX',fc)} · ${hoy.getFullYear()}`;
}
