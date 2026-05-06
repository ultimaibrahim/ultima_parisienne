/* ══════════════════════════════════════════════════════════════
   auth.js · Portal Operativo LCP
   Login, sesión, roles y control de acceso
   ══════════════════════════════════════════════════════════════ */

let currentUser = null;

const $ = id => document.getElementById(id);
const isLeadership = u => u && LEADERSHIP_ROLES.includes(u.rol);
const isGerente    = u => u && u.rol === 'gerente';

/* ── Helpers de texto ─────────────────────────────────────── */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function todayStr() { return new Date().toISOString().slice(0,10); }
function formatDateShort(iso) {
  if (!iso) return '';
  try { const d = new Date(iso+'T00:00:00'); return d.toLocaleDateString('es-MX', {day:'numeric',month:'short',year:'numeric'}); }
  catch { return iso; }
}
function generateId() { return 'av_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); }

/* ── Sesión ───────────────────────────────────────────────── */
function getSession() {
  try {
    const raw = localStorage.getItem(SESS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (Date.now() > s.expires) { localStorage.removeItem(SESS_KEY); return null; }
    return s.user;
  } catch { return null; }
}

function saveSession(user) {
  localStorage.setItem(SESS_KEY, JSON.stringify({ user, expires: Date.now() + 86400000 * 7 }));
  localStorage.setItem(TOKEN_KEY, user.token || 'offline_demo');
}

/* ── Flujo de autenticación ───────────────────────────────── */
async function iniciarFlujoAuth() {
  const sess = getSession();
  if (sess) {
    currentUser = sess;
    // Activar los datos de la región del usuario
    activarRegion(currentUser.region || 'GDL');
    aplicarRoles();
    refrescarDatosBackend();
    return;
  }
  $('login-screen').classList.remove('hidden');
  const API_URL = REGIONES.GDL.apiUrl;
  if (API_URL) {
    const h = $('login-demo-hint'); if (h) h.style.display = 'none';
    try {
      const ping = await apiGet('ping');
      const badge = $('login-server-badge');
      if (badge) {
        badge.textContent = ping.ok ? '🟢 Servidor en línea' : '🔴 Servidor sin respuesta';
        badge.style.display = 'block';
      }
    } catch(e) {
      const badge = $('login-server-badge');
      if (badge) { badge.textContent = '🔴 Sin conexión al servidor'; badge.style.display = 'block'; }
    }
  }
}

async function doLogin() {
  const correo   = $('login-correo').value.trim().toLowerCase();
  const password = $('login-pass').value;
  const errEl    = $('login-err'), btnEl = $('login-btn-el');
  errEl.classList.remove('visible');
  btnEl.disabled = true; btnEl.textContent = 'Verificando...';

  let user = null, token = null;

  // 1. Intentar autenticación en el servidor (Apps Script)
  const API_URL = REGIONES.GDL.apiUrl;
  if (API_URL) {
    const resp = await apiCall('login', { correo, password });
    if (resp.ok && resp.user) { user = resp.user; token = resp.token; }
  }

  // 2. Fallback offline: USUARIOS_LOCALES (para demo y sin conexión)
  if (!user) {
    user = USUARIOS_LOCALES.find(u => u.correo === correo && u.password === password) || null;
  }

  btnEl.disabled = false; btnEl.textContent = 'Entrar al portal →';
  if (!user) { errEl.classList.add('visible'); return; }

  // Guardar sesión sin la contraseña
  const userSafe = { ...user };
  delete userSafe.password;
  // Asegurar que el usuario tenga región asignada
  if (!userSafe.region) userSafe.region = 'GDL';
  if (token) userSafe.token = token;

  currentUser = userSafe;
  saveSession(userSafe);

  // Activar datos de la región del usuario
  activarRegion(currentUser.region);

  $('login-screen').classList.add('hidden');

  // Si el portal no estaba cargado (primer login sin sesion previa),
  // cargar pages/ y app.js ahora. Si ya estaba cargado, ir directo.
  if (typeof window._cargarPortalCompleto === 'function') {
    await window._cargarPortalCompleto();
    window._cargarPortalCompleto = null;
  }

  aplicarRoles();
  pushNotif('\u{1F44B} Bienvenido, ' + userSafe.nombre.split(' ')[0] + '!', 'Sesi\u00f3n iniciada correctamente.');
  refrescarDatosBackend();
}

function doLogout() {
  cerrarUserMenu();
  localStorage.removeItem(SESS_KEY);
  localStorage.removeItem(TOKEN_KEY);
  currentUser = null;
  if ($('login-correo')) $('login-correo').value = '';
  if ($('login-pass'))   $('login-pass').value   = '';
  $('login-screen').classList.remove('hidden');
  ocultarPortal();
}

function ocultarPortal() {
  ['header','nav','#main-content','footer'].forEach(s => {
    const el = document.querySelector(s) || $(s.replace('#',''));
    if (el) el.style.display = 'none';
  });
}
function mostrarPortal() {
  ['header','nav','#main-content','footer'].forEach(s => {
    const el = document.querySelector(s) || $(s.replace('#',''));
    if (el) el.style.display = '';
  });
}

/* ── Aplicar roles ────────────────────────────────────────── */
function aplicarRoles() {
  if (!currentUser) return;
  mostrarPortal();
  const u = currentUser, lead = isLeadership(u), ger = isGerente(u);
  const iniciales = u.nombre.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase();
  $('user-avatar-el').textContent  = iniciales;
  $('user-name-el').textContent    = u.nombre.split(' ')[0];
  const rolLabel = {admin:'Admin',analista:'Analista',regional:'Regional',zonal:'Zonal',gerente:'Gerente'}[u.rol] || u.rol;
  $('user-role-el').textContent    = rolLabel;
  $('um-name').textContent         = u.nombre;
  $('um-email').textContent        = u.correo;
  $('um-meta').textContent         = rolLabel + (u.sucursal ? ' · ' + u.sucursal : '') + ' · ' + (REGIONES[u.region]?.nombre || 'GDL');
  if ($('um-mi-suc'))          $('um-mi-suc').style.display     = ger ? '' : 'none';
  if ($('btn-editar-avisos'))  $('btn-editar-avisos').style.display  = 'none';
  if ($('nav-admin'))          $('nav-admin').style.display          = 'none';
  if ($('checklist-entrega'))  $('checklist-entrega').style.display  = 'none';

  if (lead) {
    if ($('btn-editar-avisos'))  $('btn-editar-avisos').style.display = '';
    if ($('nav-admin'))          $('nav-admin').style.display         = '';
    if ($('checklist-entrega'))  $('checklist-entrega').style.display = '';
    renderChecklist(); renderAdminAvisos(); renderAdminLecturas([]);
  } else {
    if ($('admin-section').classList.contains('active')) showSection('inicio', null);
  }

  aplicarJuntasRol();
  const navSucTab = $('nav-sucursales-tab');
  const mnSucSpan = document.querySelector('#mn-sucursales span');
  const miSucBlock   = $('mi-suc-block');
  const fullSucBlock = $('full-suc-block');
  if (ger) {
    if (navSucTab) navSucTab.textContent = 'Mi Sucursal';
    if (mnSucSpan) mnSucSpan.textContent = 'Mi Sucursal';
    if (miSucBlock)   miSucBlock.style.display   = '';
    if (fullSucBlock) fullSucBlock.style.display  = 'none';
    construirMiSucursal(u);
  } else {
    if (navSucTab) navSucTab.textContent = 'Sucursales';
    if (mnSucSpan) mnSucSpan.textContent = 'Sucursales';
    if (miSucBlock)   miSucBlock.style.display   = 'none';
    if (fullSucBlock) fullSucBlock.style.display  = '';
    construirCardsCompletas();
  }

  if (u.sucursal && !ger) setTimeout(() => resaltarMiSucursal(u.sucursal), 50);
  if (ger) {
    document.querySelectorAll('.td-edit').forEach(i => { i.classList.add('readonly'); i.setAttribute('readonly','readonly'); i.setAttribute('tabindex','-1'); });
    const d = $('regional-desc'); if (d) d.textContent = 'Vista regional. Solo lectura.';
  } else {
    document.querySelectorAll('.td-edit').forEach(i => { i.classList.remove('readonly'); i.removeAttribute('readonly'); i.removeAttribute('tabindex'); });
    const d = $('regional-desc'); if (d) d.textContent = 'Haz clic en cualquier celda para editar. % avance, ticket y semáforo se calculan automáticamente.';
  }
  renderAvisos();
  initFechaHoy(); // Re-llamar aquí para asegurar que semana-label ya está en el DOM
  $('stat-version').textContent  = VERSION;
  $('footer-ver').textContent    = VERSION + '-beta · Portal LCP ' + (REGIONES[u.region]?.nombre || 'GDL') + ' · 2026';
}
