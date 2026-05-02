/* ══════════════════════════════════════════════════════════════
   Portal GDL · v0.6.0-beta
   La Crêpe Parisienne · Región Guadalajara
   Ibrahim Garcia · 01 may 2026
   ══════════════════════════════════════════════════════════════ */

const VERSION   = 'v0.6.0';
const API_URL   = 'https://script.google.com/macros/s/AKfycbwnfhrIGKaAy3LuRdKx7J_QIRH-GelnbazmpoEeaxmbabMcEW9Ue3BcM5X1nCVd0euZ/exec';
const OB_KEY    = 'lcp_gdl_ob_v1';
const DM_KEY    = 'lcp_gdl_dm';
const AV_KEY    = 'lcp_gdl_avisos_v3';
const HIST_KEY  = 'lcp_gdl_avisos_hist_v3';
const SESS_KEY  = 'lcp_gdl_session_v1';
const TOKEN_KEY = 'lcp_gdl_token_v1';
const CHK_KEY   = 'lcp_gdl_checklist';
const VISIT_KEY = 'lcp_gdl_last_visit';
const LEIDO_KEY = 'lcp_gdl_leidos_v1';
const NOTIF_KEY = 'lcp_gdl_notifs_v1';
const NUEVO_WINDOW_MS = 86400000;
const LEADERSHIP_ROLES = ['admin','analista','regional','zonal'];

const DEMO_USERS = [
  {id:1, nombre:'Oliver González',  correo:'oliver@lcp.mx',   sucursal:null, rol:'regional', password:'lcp2026'},
  {id:3, nombre:'Gerente Santa Anita', correo:'galeriassantaanita@lacrepeparisienne.com', sucursal:'Santa Anita', rol:'gerente', password:'grupomyt2025'},
  {id:4, nombre:'Gerente Andares', correo:'andares@lacrepeparisienne.com', sucursal:'Andares', rol:'gerente', password:'grupomyt2025'},
  {id:5, nombre:'Gerente Mercado Andares', correo:'mercadoandares@lacrepeparisienne.com', sucursal:'Mercado Andares', rol:'gerente', password:'grupomyt2025'},
  {id:6, nombre:'Gerente La Perla', correo:'laperla@lacrepeparisienne.com', sucursal:'La Perla', rol:'gerente', password:'grupomyt2025'},
  {id:7, nombre:'Gerente Forum', correo:'forumtlaquepaque@lacrepeparisienne.com', sucursal:'Forum Tlaquepaque', rol:'gerente', password:'grupomyt2025'},
  {id:8, nombre:'Gerente Patria', correo:'plazapatria@lacrepeparisienne.com', sucursal:'Plaza Patria', rol:'gerente', password:'grupomyt2025'},
  {id:9, nombre:'Gerente Galerías', correo:'galeriasguadalajara@lacrepeparisienne.com', sucursal:'Galerías Guadalajara', rol:'gerente', password:'grupomyt2025'},
  {id:10, nombre:'Gerente Midtown', correo:'midtown@lacrepeparisienne.com', sucursal:'Midtown', rol:'gerente', password:'grupomyt2025'},
  {id:11, nombre:'Gerente Via Viva', correo:'viaviva@lacrepeparisienne.com', sucursal:'Via Viva', rol:'gerente', password:'grupomyt2025'},
  {id:12, nombre:'Ibrahim Garcia', correo:'ultima.ibrahim@proton.me', sucursal:null, rol:'admin', password:'grupomyt2025'},
  {id:13, nombre:'Oliver Gonzalez', correo:'oliver.gonzalez@lacrepeparisienne.com', sucursal:null, rol:'regional', password:'grupomyt2025'}
];

const SUCURSALES = ['Andares','Mercado Andares','Via Viva','Midtown','La Perla','Plaza Patria','Santa Anita','Galerías Guadalajara','Forum Tlaquepaque'];
const SECCIONES  = ['inicio','dashboard','sucursales','regional','juntas','formatos','about','admin-section'];
const MOBILE_MAP = {'inicio':'mn-inicio','dashboard':'mn-dashboard','sucursales':'mn-sucursales','regional':'mn-regional','juntas':'mn-juntas','formatos':'mn-formatos'};

const SUCURSAL_DATA = {
  'Andares':           {code:'AND',root:'12W9Q93CPZ2-HxQsVja7mGgR4WA5UKuOV',ventas:'1mqzW6X7p1mosxahnmfp97rnKuV8J4KsR',inv:'1gW4JMJde4PukMNZZDEA4Ylhn-XGqHCtW',inc:'1WQQUYzjiUuxTb8bQ4og4VRyWSGugqUEV',hor:'1u3ghNzkza1QGid0kAhpTarnbhedXUyUQ'},
  'Mercado Andares':   {code:'MAN',root:'1EKnE_CnT8z4Jbj0U7-C_GiZjiPZZs447',ventas:'18-90ajjPs-g_eJaWG1tch88TaRrN3LmP',inv:'1eWEgQKLUonmN1t3zfcKrZRQIbAMbYB9h',inc:'1RL4kFDT-OtlpzSyQIV4jNUOd1_qejZKz',hor:'1g-I2lttpFWUF5HANgNvXfp2RJGEjNFne'},
  'Via Viva':          {code:'VIV',root:'1QhvpWf9iioXBYB40AAENFxKqnvMvgnm0',ventas:'1cIJVEGZho1Qc21CS8NZUUXW75vPl8A6G',inv:'1TtWQDaIevn4KO9smiQe7zK20trihlFWl',inc:'1Z5pZ97nn6xj-dFUw6Oaef7c5R_rWhHFi',hor:'1NtE7nDOs9rITTJar7p0j1p1o77_nFM1w'},
  'Midtown':           {code:'MID',root:'16VFQ-oWDvuDHTnjIPcJOP4eVPge7eAeB',ventas:'1W3UcwmizLvfkULAgFERQ0tHtTrPJ1DnM',inv:'1l02l3MN5pXF514_b4Qe3qPZEQN4xhQxQ',inc:'19bDJCiWf1kCQxL7KYl-Sue7nbBK4Ztm4',hor:'18dkjZAS4VZBlgCo6f6Oa8ewUOV-5q6a_'},
  'La Perla':          {code:'PER',root:'1xgbwp2IS-Itp3JCxPaCUO4aLs_R0HacW',ventas:'1gtm44_lvtf3Jx-T_DYUO_jcUBrD24mId',inv:'1K9cnl4Ez2jPEC2zuRKzoDkLIhg_uDUKj',inc:'1D2TcA-dWkeBdZ-XMhCJvaQdLKV40Z9iG',hor:'1z_-amQqoctcbUE5fQ1wuId76CwujB8ei'},
  'Plaza Patria':      {code:'PAT',root:'1Z3rN3AZvNdVfrTadZ-Rg2VT0iuwC_NFG',ventas:'1379j-uzf8tmqIe5tz8Lo5VPDTvgK4hM8',inv:'1LogHJEJsgFiYr52t0HvffS-dXdIazaXI',inc:'17yEfrEhH_aU2avs0xkRb5Mqv4sVT4Oyg',hor:'16S4ItW3XueNzCwup6FhDcqO9G5kqwEWC'},
  'Santa Anita':       {code:'ANI',root:'17hAbt1Gb1hsbZht-1SGusX23UGTwtbvB',ventas:'1vJZND7QsSKdgzkS0eqSDhNXqecDUD5sw',inv:'1as_3F1kqS4SXeJ9x4k7bZDTCeCortuCC',inc:'1O1AqtoAddpO1EONYSyp3F7TVQnzr0HqY',hor:'1hhnuRm8t5wSnyUtWsJwXyFPx1_2kwzV7'},
  'Galerías Guadalajara':      {code:'GAL',root:'1x7GL78aCuSwIS4Q-1dhzj80vi2i4sHHe',ventas:'1zqnO-cu67Q2jamBnV8gFp6U6EmKiY3U4',inv:'1_M7FHAhBb4L9O2ByqxgI5X4u_4-wQVg9',inc:'1o8K1aCZRCXMT6OMg4D2SXWJaSLIChE2R',hor:'14t1sWZteBqo6h9A5uDwxBOfhdq8HCMuc'},
  'Forum Tlaquepaque': {code:'FOR',root:'1mg7hJu2-wtRn4YiCdW9C6uZqwUalSKQH',ventas:'1DOo4tqN38Vm02jprGI6YOG-4f7L0XEpI',inv:'1n6UO7P8iW0p2xD4l89Uf5p6T9XWHqflR',inc:'1ed0_DtGc_xWW7-gc6g7AVK8IWLuMJmxb',hor:'1i3y-Fcsxx_EY4yxGIE0-O0MjiFmrl02c'}
};

let currentUser = null;
let chartVentas = null, chartEntregas = null, chartTendencia = null;
let lecturasGlobal = [];

/* ── HELPERS ──────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const isLeadership = u => u && LEADERSHIP_ROLES.includes(u.rol);
const isGerente    = u => u && u.rol === 'gerente';
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function todayStr(){return new Date().toISOString().slice(0,10);}
function formatDateShort(iso){if(!iso)return '';try{const d=new Date(iso+'T00:00:00');return d.toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'});}catch{return iso;}}
function generateId(){return 'av_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);}

/* ── API CALL ─────────────────────────────────────────────── */
async function apiCall(action, payload) {
  if (!API_URL) return { ok: false, demo: true };
  const token = localStorage.getItem(TOKEN_KEY) || '';
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token, ...(payload || {}) })
    });
    return await response.json();
  } catch (e) {
    console.warn('apiCall fail:', action, e);
    return { ok: false, error: String(e) };
  }
}

async function apiGet(action, params) {
  if (!API_URL) return { ok: false, demo: true };
  try {
    const queryParams = new URLSearchParams({ action, ...(params || {}) }).toString();
    const response = await fetch(`${API_URL}?${queryParams}`);
    return await response.json();
  } catch (e) {
    console.warn('apiGet fail:', action, e);
    return { ok: false, error: String(e) };
  }
}
/* ── DARK MODE ────────────────────────────────────────────── */
function initDark(){if(localStorage.getItem(DM_KEY)==='1')applyDark(true,false);}
function toggleDark(){applyDark(document.documentElement.getAttribute('data-theme')!=='dark',true);}
function applyDark(on,save){
  document.documentElement.setAttribute('data-theme',on?'dark':'light');
  $('dm-icon').textContent=on?'☀️':'🌙';
  $('dm-label').textContent=on?'Claro':'Oscuro';
  if(save)localStorage.setItem(DM_KEY,on?'1':'0');
  if(chartVentas)updateChartColors();
}
initDark();

/* ── ONBOARDING ───────────────────────────────────────────── */
let obActual=0;
function initOnboarding(){
  if(localStorage.getItem(OB_KEY)){$('onboarding').style.display='none';iniciarFlujoAuth();}
}
function nextOb(n){$('ob-'+obActual).classList.remove('active');obActual=n;$('ob-'+obActual).classList.add('active');}
function cerrarOnboarding(){
  const ob=$('onboarding');
  ob.classList.add('fade-out');
  localStorage.setItem(OB_KEY,'1');
  setTimeout(()=>{ob.style.display='none';iniciarFlujoAuth();},650);
}

/* ── AUTH ─────────────────────────────────────────────────── */
function iniciarFlujoAuth(){
  const sess=getSession();
  if(sess){currentUser=sess;aplicarRoles();refrescarDatosBackend();return;}
  $('login-screen').classList.remove('hidden');
  if(API_URL){const h=$('login-demo-hint');if(h)h.style.display='none';}
}
function getSession(){
  try{const raw=localStorage.getItem(SESS_KEY);if(!raw)return null;const s=JSON.parse(raw);if(Date.now()>s.expires){localStorage.removeItem(SESS_KEY);return null;}return s.user;}
  catch{return null;}
}
function saveSession(user){localStorage.setItem(SESS_KEY,JSON.stringify({user,expires:Date.now()+86400000*7}));localStorage.setItem(TOKEN_KEY,user.correo||'');}

async function doLogin(){
  const correo=$('login-correo').value.trim().toLowerCase();
  const password=$('login-pass').value;
  const errEl=$('login-err'),btnEl=$('login-btn-el');
  errEl.classList.remove('visible');
  btnEl.disabled=true;btnEl.textContent='Verificando...';
  let user=null,token=null;
  if(API_URL){const resp=await apiCall('login',{correo,password});if(resp.ok&&resp.user){user=resp.user;token=resp.token;}}
  if(!user)user=DEMO_USERS.find(u=>u.correo===correo&&u.password===password)||null;
  btnEl.disabled=false;btnEl.textContent='Entrar al portal →';
  if(!user){errEl.classList.add('visible');return;}
  const userSafe={...user};delete userSafe.password;
  currentUser=userSafe;saveSession(userSafe);
  if(token)localStorage.setItem(TOKEN_KEY,token);
  $('login-screen').classList.add('hidden');
  aplicarRoles();
  pushNotif('👋 Bienvenido, '+userSafe.nombre.split(' ')[0]+'!','Sesión iniciada correctamente.');
  refrescarDatosBackend();
}

async function refrescarDatosBackend(){
  if(!API_URL)return;
  const resp=await apiGet('avisos');
  if(resp.ok&&Array.isArray(resp.data)){
    avisos=resp.data;saveAvisos();
    renderAvisos();renderAdminAvisos();
  }
  if(isLeadership(currentUser)){
    const lr=await apiCall('getLecturas',{});
    if(lr.ok&&Array.isArray(lr.lecturas)){
      lecturasGlobal = lr.lecturas;
      renderAdminLecturas(lr.lecturas);
      if(document.getElementById('dashboard').classList.contains('active')) renderHeatmap();
    }
  }
  // Cargar juntas si la sección está activa o precargar
  cargarJuntas();
}

function doLogout(){
  cerrarUserMenu();
  localStorage.removeItem(SESS_KEY);localStorage.removeItem(TOKEN_KEY);
  currentUser=null;
  if($('login-correo'))$('login-correo').value='';
  if($('login-pass'))$('login-pass').value='';
  $('login-screen').classList.remove('hidden');
  ocultarPortal();
}
function ocultarPortal(){['header','nav','#main-content','footer'].forEach(s=>{const el=document.querySelector(s)||$(s.replace('#',''));if(el)el.style.display='none';});}
function mostrarPortal(){['header','nav','#main-content','footer'].forEach(s=>{const el=document.querySelector(s)||$(s.replace('#',''));if(el)el.style.display='';});}

/* ── ROLES ────────────────────────────────────────────────── */
function aplicarRoles(){
  if(!currentUser)return;
  mostrarPortal();
  const u=currentUser,lead=isLeadership(u),ger=isGerente(u);
  const iniciales=u.nombre.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
  $('user-avatar-el').textContent=iniciales;
  $('user-name-el').textContent=u.nombre.split(' ')[0];
  const rolLabel={admin:'Admin',analista:'Analista',regional:'Regional',zonal:'Zonal',gerente:'Gerente'}[u.rol]||u.rol;
  $('user-role-el').textContent=rolLabel;
  $('um-name').textContent=u.nombre;$('um-email').textContent=u.correo;
  $('um-meta').textContent=rolLabel+(u.sucursal?' · '+u.sucursal:'');
  $('um-mi-suc').style.display=ger?'':'none';
  $('btn-editar-avisos').style.display='none';
  $('nav-admin').style.display='none';
  $('checklist-entrega').style.display='none';
  if(lead){
    $('btn-editar-avisos').style.display='';
    $('nav-admin').style.display='';
    $('checklist-entrega').style.display='';
    renderChecklist();renderAdminAvisos();
    renderAdminLecturas([]);
  }else{
    if($('admin-section').classList.contains('active'))showSection('inicio',null);
  }
  aplicarJuntasRol();
  const navSucTab=$('nav-sucursales-tab');
  if(ger){
    navSucTab.textContent='Mi Sucursal';
    $('mi-suc-block').style.display='';$('full-suc-block').style.display='none';
    construirMiSucursal(u);
  }else{
    navSucTab.textContent='Sucursales';
    $('mi-suc-block').style.display='none';$('full-suc-block').style.display='';
    construirCardsCompletas();
  }
  if(u.sucursal&&!ger)setTimeout(()=>resaltarMiSucursal(u.sucursal),50);
  if(ger){
    document.querySelectorAll('.td-edit').forEach(i=>{i.classList.add('readonly');i.setAttribute('readonly','readonly');i.setAttribute('tabindex','-1');});
    const d=$('regional-desc');if(d)d.textContent='Vista regional. Solo lectura.';
  }else{
    document.querySelectorAll('.td-edit').forEach(i=>{i.classList.remove('readonly');i.removeAttribute('readonly');i.removeAttribute('tabindex');});
    const d=$('regional-desc');if(d)d.textContent='Haz clic en cualquier celda para editar. % avance, ticket y semáforo se calculan automáticamente.';
  }
  renderAvisos();
  // dashboard disponible para todos
  $('stat-version').textContent=VERSION;
  $('footer-ver').textContent=VERSION+'-beta · Portal GDL · 2026';
}

function resaltarMiSucursal(nombre){
  document.querySelectorAll('#sucursales-grid .card').forEach(card=>{
    const titulo=card.querySelector('.card-title')?.textContent||'';
    if(titulo.toLowerCase()===nombre.toLowerCase()){
      card.classList.add('mi-sucursal');
      const header=card.querySelector('.card-header');
      if(header&&!header.querySelector('.mi-suc-badge')){
        const badge=document.createElement('span');badge.className='mi-suc-badge';badge.textContent='Mi sucursal';header.appendChild(badge);
      }
    }
  });
}

/* ── USER MENU & NOTIFS ───────────────────────────────────── */
function toggleUserMenu(e){
  if(e)e.stopPropagation();
  const chip=$('user-chip-btn'),menu=$('user-menu'),open=!menu.classList.contains('visible');
  menu.classList.toggle('visible',open);chip.classList.toggle('open',open);
  chip.setAttribute('aria-expanded',open?'true':'false');
  $('notif-dropdown').classList.remove('visible');
}
function cerrarUserMenu(){$('user-menu').classList.remove('visible');$('user-chip-btn').classList.remove('open');$('user-chip-btn').setAttribute('aria-expanded','false');}
function irAMiSucursal(){cerrarUserMenu();showSection('sucursales',null);}
document.addEventListener('click',e=>{
  const menu=$('user-menu'),chip=$('user-chip-btn'),nd=$('notif-dropdown'),nb=$('notif-btn');
  if(menu&&menu.classList.contains('visible')&&!menu.contains(e.target)&&!chip.contains(e.target))cerrarUserMenu();
  if(nd&&nd.classList.contains('visible')&&!nd.contains(e.target)&&!nb.contains(e.target))nd.classList.remove('visible');
});
function toggleNotifDropdown(e){
  e.stopPropagation();
  $('notif-dropdown').classList.toggle('visible');
  cerrarUserMenu();
}

/* ── SISTEMA DE NOTIFICACIONES ───────────────────────────── */
function getNotifs(){try{return JSON.parse(localStorage.getItem(NOTIF_KEY)||'[]');}catch{return[];}}
function saveNotifs(arr){localStorage.setItem(NOTIF_KEY,JSON.stringify(arr.slice(0,20)));}
function pushNotif(titulo,texto){
  const arr=getNotifs();
  arr.unshift({id:Date.now(),titulo,texto,ts:Date.now(),leida:false});
  saveNotifs(arr);renderNotifs();
}
function limpiarNotifs(){
  const arr=getNotifs().map(n=>({...n,leida:true}));saveNotifs(arr);renderNotifs();
}
function renderNotifs(){
  const arr=getNotifs();
  const unread=arr.filter(n=>!n.leida).length;
  const badge=$('notif-badge');
  if(unread>0){badge.textContent=unread>9?'9+':String(unread);badge.classList.add('visible');}
  else{badge.classList.remove('visible');}
  const list=$('notif-list');
  if(!arr.length){list.innerHTML='<div class="notif-empty">Sin notificaciones nuevas</div>';return;}
  list.innerHTML=arr.map(n=>`
    <div class="notif-item${n.leida?'':' unread'}">
      ${n.leida?'':'<div class="notif-dot"></div>'}
      <div style="flex:1;">
        <div class="notif-item-text"><strong>${escapeHtml(n.titulo)}</strong><br>${escapeHtml(n.texto)}</div>
        <div class="notif-item-time">${formatRelTime(n.ts)}</div>
      </div>
    </div>`).join('');
}
function formatRelTime(ts){
  const diff=Date.now()-ts,m=Math.floor(diff/60000),h=Math.floor(m/60),d=Math.floor(h/24);
  if(m<1)return'Ahora';if(m<60)return m+'min';if(h<24)return h+'h';return d+'d';
}
renderNotifs();

/* ── SECCIÓN: navegación ──────────────────────────────────── */
function showSection(id,btn){
  if(id==='admin-section'&&!isLeadership(currentUser)){id='inicio';btn=null;}
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  const sec=document.getElementById(id);if(!sec)return;
  sec.classList.add('active');
  if(btn){btn.classList.add('active');}else{
    const idx=SECCIONES.indexOf(id);
    if(idx>=0){const tabs=document.querySelectorAll('.nav-tab');if(tabs[idx])tabs[idx].classList.add('active');}
  }
  // mobile nav sync
  const mnId=MOBILE_MAP[id];
  document.querySelectorAll('.mobile-nav-tab').forEach(t=>t.classList.remove('active'));
  if(mnId&&$(mnId))$(mnId).classList.add('active');
  sec.querySelectorAll('.anim').forEach(el=>{el.style.animation='none';void el.offsetHeight;el.style.animation='';});
  if(window.location.hash!=='#'+id)history.replaceState(null,'','#'+id);
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='dashboard')initDashboard();
  if(id==='juntas')cargarJuntas();
  if(id==='admin-section'&&API_URL&&isLeadership(currentUser)){
    apiCall('getLecturas',{}).then(r=>{if(r.ok)renderAdminLecturas(r.lecturas);});
  }
}
function setMobileTab(id){document.querySelectorAll('.mobile-nav-tab').forEach(t=>t.classList.remove('active'));const t=$(id);if(t)t.classList.add('active');}
window.addEventListener('load',()=>{const h=window.location.hash.replace('#','');if(SECCIONES.includes(h))showSection(h,null);});
window.addEventListener('hashchange',()=>{const h=window.location.hash.replace('#','');if(SECCIONES.includes(h))showSection(h,null);});

/* ── CHECKLIST ────────────────────────────────────────────── */
function getChecklistData(){try{const r=localStorage.getItem(CHK_KEY);if(r)return JSON.parse(r);}catch{}return SUCURSALES.reduce((acc,s)=>{acc[s]=false;return acc;},{});}
function setChecklistData(d){localStorage.setItem(CHK_KEY,JSON.stringify(d));}
function renderChecklist(){
  const grid=$('checklist-grid');if(!grid)return;
  const d=getChecklistData();
  grid.innerHTML=SUCURSALES.map(nombre=>{
    const ok=!!d[nombre];
    return`<div class="checklist-item"><div class="ci-dot ${ok?'entrego':'pendiente'}"></div><span>${escapeHtml(nombre)}</span></div>`;
  }).join('');
  const n=SUCURSALES.filter(s=>d[s]).length;
  $('checklist-meta').textContent=`${n} / ${SUCURSALES.length} entregaron`;
}
async function alternarMiEntrega(){
  if(!currentUser||!currentUser.sucursal)return;
  const d=getChecklistData();d[currentUser.sucursal]=!d[currentUser.sucursal];
  setChecklistData(d);actualizarMiSucursalStatus();
  if(API_URL)await apiCall('setEntrega',{sucursal:currentUser.sucursal,entrego:d[currentUser.sucursal]});
}
function actualizarMiSucursalStatus(){
  if(!currentUser||!currentUser.sucursal)return;
  const d=getChecklistData(),ok=!!d[currentUser.sucursal];
  const pill=$('mi-suc-status-pill');
  pill.classList.toggle('entregado',ok);pill.classList.toggle('pendiente',!ok);
  $('mi-suc-status-text').textContent=ok?'Reporte de esta semana: entregado ✓':'Reporte de esta semana: pendiente';
}

/* ── SUCURSALES CARDS ─────────────────────────────────────── */
function construirCardsCompletas(){
  const grid=$('sucursales-grid');if(grid.dataset.built==='1')return;
  grid.innerHTML=SUCURSALES.map(nombre=>{
    const d=SUCURSAL_DATA[nombre],dataNombre=(nombre+' '+d.code).toLowerCase();
    return`<div class="card" data-nombre="${dataNombre}">
      <div class="card-header"><span class="card-title">${escapeHtml(nombre)}</span><span class="card-code">${d.code}</span></div>
      <div class="card-body">
        <div class="card-links">
          <a class="drive-link" href="https://drive.google.com/drive/folders/${d.ventas}" target="_blank" rel="noopener"><span class="icon">📊</span> Ventas</a>
          <a class="drive-link" href="https://drive.google.com/drive/folders/${d.inv}" target="_blank" rel="noopener"><span class="icon">📦</span> Inventarios</a>
          <a class="drive-link" href="https://drive.google.com/drive/folders/${d.inc}" target="_blank" rel="noopener"><span class="icon">📋</span> Incidencias</a>
          <a class="drive-link" href="https://drive.google.com/drive/folders/${d.hor}" target="_blank" rel="noopener"><span class="icon">🗓</span> Horarios</a>
        </div>
        <button class="copy-btn" onclick="copiarLink('https://drive.google.com/drive/folders/${d.root}',this)">📋 Copiar link</button>
      </div></div>`;
  }).join('');
  grid.dataset.built='1';
}
function construirMiSucursal(u){
  const suc=u.sucursal;if(!suc||!SUCURSAL_DATA[suc])return;
  const d=SUCURSAL_DATA[suc];
  $('mi-suc-titulo').textContent=suc;$('mi-suc-codigo-fmt').textContent=d.code;
  const acciones=[
    {titulo:'Reporte de Ventas',desc:'Sube tu archivo Excel semanal aquí. Llénalo a diario.',icon:'📊',folder:d.ventas,prim:true},
    {titulo:'Inventarios',desc:'Conteo físico programado por Oliver.',icon:'📦',folder:d.inv},
    {titulo:'Incidencias',desc:'Merma, ausentismo, eventos con cliente.',icon:'📋',folder:d.inc},
    {titulo:'Horarios',desc:'Plantilla semanal del equipo.',icon:'🗓',folder:d.hor}
  ];
  $('mi-suc-actions-grid').innerHTML=acciones.map(a=>`
    <div class="mi-suc-action">
      <div class="mi-suc-action-header"><div class="mi-suc-action-title">${escapeHtml(a.titulo)}</div><div class="mi-suc-action-icon">${a.icon}</div></div>
      <div class="mi-suc-action-desc">${escapeHtml(a.desc)}</div>
      ${a.prim?`<div class="mi-suc-action-status" id="mi-suc-action-status">⏱ Pendiente esta semana</div>`:''}
      <div class="mi-suc-action-buttons">
        <button class="mi-suc-btn mi-suc-btn-primary" onclick="clickUploadFile('${escapeHtml(a.titulo)}')">📤 Subir archivo</button>
        <a class="mi-suc-btn mi-suc-btn-ghost" href="https://drive.google.com/drive/folders/${a.folder}" target="_blank" rel="noopener">👁 Ver carpeta</a>
      </div>
    </div>`).join('');

  // Inject hidden file input if not exists
  if(!document.getElementById('lcp-file-input')) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'lcp-file-input';
    fileInput.style.display = 'none';
    fileInput.accept = '.xlsx, .xls, .csv, application/pdf';
    fileInput.onchange = handleFileUpload;
    document.body.appendChild(fileInput);
  }
}

let currentUploadAction = null;
function clickUploadFile(actionTitle) {
  currentUploadAction = actionTitle;
  document.getElementById('lcp-file-input').click();
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if(!file) return;
  
  if(currentUploadAction === 'Reporte de Ventas') {
    if(!file.name.toLowerCase().includes('venta') && !file.name.toLowerCase().includes('.xlsx')) {
      alert("Formato inválido. Sube el Excel con nombre: VentaSemanal_[SUC]_[MES][AÑO]_S[#].xlsx");
      e.target.value = '';
      return;
    }
  }

  const reader = new FileReader();
  reader.onload = async function(event) {
    const base64 = event.target.result;
    mostrarToast('⏳ Subiendo archivo a Drive...');
    
    if(API_URL) {
       const res = await apiCall('uploadFile', {
         fileData: base64,
         fileName: file.name,
         mimeType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         sucursal: currentUser.sucursal,
         semana: document.getElementById('semana-label').textContent.trim()
       });
       
       if(res.ok) {
         mostrarToast('✓ Archivo procesado con éxito');
         if(currentUploadAction === 'Reporte de Ventas') {
           const d = getChecklistData();
           if(!d[currentUser.sucursal]) alternarMiEntrega();
         }
       } else {
         mostrarToast('❌ Error: ' + (res.error || 'Fallo de conexión'));
       }
    } else {
       setTimeout(() => {
         mostrarToast('✓ Archivo validado localmente');
         if(currentUploadAction === 'Reporte de Ventas') {
           const d = getChecklistData();
           if(!d[currentUser.sucursal]) alternarMiEntrega();
         }
       }, 1500);
    }
  };
  reader.readAsDataURL(file);
  e.target.value = '';
  actualizarMiSucursalStatus();
}
function filtrarSucursales(q){
  const cards=document.querySelectorAll('#sucursales-grid .card'),term=q.toLowerCase().trim();
  let vis=0;cards.forEach(c=>{const m=c.dataset.nombre.includes(term);c.classList.toggle('hidden',!m);if(m)vis++;});
  $('search-empty').style.display=vis===0?'block':'none';
}
function copiarLink(url,btn){
  const fb=()=>{btn.textContent='✓ Copiado';btn.classList.add('copied');setTimeout(()=>{btn.textContent='📋 Copiar link';btn.classList.remove('copied');},2000);};
  if(navigator.clipboard)navigator.clipboard.writeText(url).then(fb).catch(()=>{fbCopy(url,fb);});
  else fbCopy(url,fb);
}
function fbCopy(url,cb){const ta=document.createElement('textarea');ta.value=url;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);cb();}

/* ── AVISOS ────────────────────────────────────────────────── */
const AVISOS_DEFAULT=[
  {id:'av_seed_1',tag:'📢 Operativo',fecha:'28 abr 2026 · Oliver Gnz.',texto:'Bienvenidos al nuevo portal operativo de la Región GDL. A partir de esta semana, <strong>todos los reportes semanales de ventas deben subirse a Drive</strong> antes del lunes a las 10:00 AM.',fechaLimite:'',fechaBorrado:'2026-06-30',creado:Date.now(), critico: false},
  {id:'av_seed_2',tag:'📦 Inventario',fecha:'01 may 2026 · Oliver Gnz.',texto:'Conteo de inventario el <strong>miércoles 06 de mayo</strong> en todas las sucursales. Subir el archivo antes del jueves a mediodía en la carpeta Inventarios.',fechaLimite:'2026-05-06',fechaBorrado:'2026-05-08',creado:Date.now(), critico: true},
  {id:'av_seed_3',tag:'🔄 Portal',fecha:'01 may 2026 · Saúl Ibrahim',texto:'Portal actualizado a <strong>v0.5.1-beta</strong>. Corrección de bugs, persistencia de tabla regional, y modo demo mejorado.',fechaLimite:'',fechaBorrado:'2026-06-15',creado:Date.now(), critico: false}
];
let avisos=[],historico=[],avActual=0,avTimer=null,avProgressTimer=null,avResumeTimeout=null,avHovered=false,avProgress=0;
const AV_INTERVAL=10000,AV_RESUME_DELAY=12000;

function loadHistorico(){try{const r=localStorage.getItem(HIST_KEY);historico=r?JSON.parse(r):[];}catch{historico=[];}}
function saveHistorico(){localStorage.setItem(HIST_KEY,JSON.stringify(historico));}
function getLeidosLocales(){try{return JSON.parse(localStorage.getItem(LEIDO_KEY)||'{}');}catch{return{};}}
function setLeidoLocal(id){const m=getLeidosLocales();m[id]=Date.now();localStorage.setItem(LEIDO_KEY,JSON.stringify(m));}

async function cargarAvisos(){
  loadHistorico();
  if(API_URL) {
    try {
      const res = await apiGet('avisos');
      if(res.ok && Array.isArray(res.data)) {
        avisos = res.data;
        renderAvisos();
        return;
      }
    } catch(e) { console.warn("Error cargando avisos", e); }
  }
  const raw=localStorage.getItem(AV_KEY);
  if(raw===null){avisos=AVISOS_DEFAULT.map(a=>({...a}));saveAvisos();}
  else{try{avisos=JSON.parse(raw);}catch{avisos=[];}if(!Array.isArray(avisos))avisos=[];}
  const hoy=todayStr(),vivos=[];let arch=0;
  avisos.forEach(a=>{if(a.fechaBorrado&&a.fechaBorrado<=hoy){historico.unshift({...a,archivadoEn:Date.now()});arch++;}else vivos.push(a);});
  avisos=vivos;if(arch>0){saveAvisos();saveHistorico();}
  renderAvisos();
}
function saveAvisos(){localStorage.setItem(AV_KEY,JSON.stringify(avisos));}
function venceBadge(av){
  if(!av.fechaLimite)return'';
  const hoy=todayStr(),fl=av.fechaLimite,diff=(new Date(fl)-new Date(hoy))/86400000;
  let cls='',label='VENCE: '+formatDateShort(fl);
  if(diff<0){cls='vencido';label='VENCIÓ: '+formatDateShort(fl);}
  else if(diff<=2){cls='urgente';label='URGENTE · '+formatDateShort(fl);}
  return`<span class="aviso-vence ${cls}">${label}</span>`;
}
function nuevoBadge(av){
  if(!av.creado||Date.now()-av.creado>NUEVO_WINDOW_MS)return'';
  return`<span class="aviso-nuevo">✨ NUEVO</span>`;
}
function actualizarContadorNuevos(){
  const last=parseInt(localStorage.getItem(VISIT_KEY)||'0',10);
  const n=avisos.filter(a=>a.creado&&a.creado>last).length;
  const pill=$('avisos-nuevos-pill');if(!pill)return;
  if(n>0&&last>0){$('avisos-nuevos-count').textContent=n;pill.classList.remove('hidden');}
  else pill.classList.add('hidden');
}
function marcarVisitaAvisos(){setTimeout(()=>{localStorage.setItem(VISIT_KEY,String(Date.now()));actualizarContadorNuevos();},4000);}

function renderAvisos(){
  const track=$('avisos-track'),dotsEl=$('avisos-dots');
  track.innerHTML='';dotsEl.innerHTML='';
  if(!avisos.length){
    track.innerHTML=`<div class="aviso-empty"><div class="aviso-empty-icon">📭</div><div>Sin avisos recientes</div><div style="font-size:11px;margin-top:4px;">Cuando alguien publique un aviso aparecerá aquí.</div></div>`;
    $('av-counter').textContent='0 / 0';$('av-prev').disabled=true;$('av-next').disabled=true;
    pausarAutoplay();$('aviso-fill').style.width='0%';return;
  }
  avisos.forEach((av,i)=>{
    const slide=document.createElement('div');
    slide.className='aviso-slide'+(i===0?' active':'');
    const criticoMarker=av.critico?`<span class="aviso-critico-marker">🚨 CRÍTICO</span>`:'';
    let leidoBlock='';
    if(av.critico&&currentUser&&isGerente(currentUser)){
      const leidos=getLeidosLocales(),leido=!!leidos[av.id];
      const fecha=leido?new Date(leidos[av.id]).toLocaleDateString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';
      leidoBlock=`<div class="aviso-leido-row">${leido
        ?`<button class="btn-marcar-leido leido" disabled>✓ Leído</button><span class="aviso-leido-meta">Marcado · ${escapeHtml(fecha)}</span>`
        :`<button class="btn-marcar-leido" onclick="marcarComoLeido('${av.id}',this)">✓ Marcar como leído</button><span class="aviso-leido-meta">Confirma que viste este aviso crítico</span>`
      }</div>`;
    }
    slide.innerHTML=`
      <div class="aviso-meta">
        <span class="aviso-tag">${escapeHtml(av.tag||'')}</span>
        <span class="aviso-fecha-txt">${escapeHtml(av.fecha||'')}</span>
        ${criticoMarker}${nuevoBadge(av)}${venceBadge(av)}
      </div>
      <div class="aviso-texto">${av.texto||''}</div>${leidoBlock}`;
    track.appendChild(slide);
    const dot=document.createElement('div');
    dot.className='avisos-dot-item'+(i===0?' active':'');
    dot.onclick=()=>{pausarAutoplay();irAviso(i);programarReanudar();};
    dotsEl.appendChild(dot);
  });
  avActual=0;$('av-counter').textContent=`1 / ${avisos.length}`;
  $('av-prev').disabled=true;$('av-next').disabled=avisos.length<=1;
  actualizarContadorNuevos();marcarVisitaAvisos();iniciarAutoplay();
}
function irAviso(n){
  const slides=document.querySelectorAll('.aviso-slide'),dots=document.querySelectorAll('.avisos-dot-item');
  if(!slides.length)return;
  slides[avActual].classList.remove('active');dots[avActual].classList.remove('active');
  avActual=n;slides[avActual].classList.add('active');dots[avActual].classList.add('active');
  $('av-counter').textContent=(avActual+1)+' / '+avisos.length;
  $('av-prev').disabled=avActual===0;$('av-next').disabled=avActual===avisos.length-1;
}
function moverAviso(dir){const n=avActual+dir;if(n<0||n>=avisos.length)return;pausarAutoplay();irAviso(n);programarReanudar();}
function pausarAutoplay(){clearInterval(avTimer);clearInterval(avProgressTimer);clearTimeout(avResumeTimeout);avTimer=null;avProgressTimer=null;avResumeTimeout=null;avProgress=0;$('aviso-fill').style.width='0%';}
function programarReanudar(){clearTimeout(avResumeTimeout);if(avHovered)return;avResumeTimeout=setTimeout(()=>{if(!avHovered)iniciarAutoplay();},AV_RESUME_DELAY);}
function iniciarAutoplay(){
  pausarAutoplay();if(!avisos.length||avisos.length<=1||avHovered)return;
  avTimer=setInterval(()=>{if(avHovered)return;irAviso((avActual+1)%avisos.length);avProgress=0;$('aviso-fill').style.width='0%';},AV_INTERVAL);
  avProgressTimer=setInterval(()=>{if(avHovered)return;avProgress+=100/(AV_INTERVAL/100);if(avProgress>100)avProgress=100;$('aviso-fill').style.width=avProgress+'%';},100);
}
function hoverAvisos(on){avHovered=on;$('avisos-paused-badge').classList.toggle('visible',on);if(on)pausarAutoplay();else programarReanudar();}
window.addEventListener('load',()=>{
  const card=$('avisos-card-el');if(!card)return;
  card.addEventListener('touchstart',()=>hoverAvisos(true),{passive:true});
  card.addEventListener('touchend',()=>{setTimeout(()=>hoverAvisos(false),1500);},{passive:true});
});

/* ── ADMIN EDITOR DE AVISOS ───────────────────────────────── */
let adminAvisoIdx=-1,adminPendingDelete=false,pendingDeleteIdx=-1;
const NEW_AVISO_DRAFT={tag:'📢 Operativo',fecha:'',texto:'',fechaLimite:'',fechaBorrado:''};
function abrirAdmin(){if(!isLeadership(currentUser))return;pausarAutoplay();if(!avisos.length){abrirAdminNuevo();return;}$('admin-overlay').classList.add('visible');mostrarFormAdmin(0);}
function abrirAdminNuevo(){if(!isLeadership(currentUser))return;pausarAutoplay();$('admin-overlay').classList.add('visible');mostrarFormAdmin(-1);}
function abrirAdminEditar(idx){if(!isLeadership(currentUser))return;pausarAutoplay();$('admin-overlay').classList.add('visible');mostrarFormAdmin(idx);}
function hoyAutorString(){const d=new Date().toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'});return d+(currentUser?' · '+currentUser.nombre.split(' ').slice(0,2).join(' '):'');}
function cerrarAdmin(e){if(e&&e.target!==$('admin-overlay'))return;$('admin-overlay').classList.remove('visible');resetDeleteBtn();if(!avHovered)iniciarAutoplay();}
function mostrarFormAdmin(idx){
  adminAvisoIdx=idx;resetDeleteBtn();$('admin-form').classList.add('visible');
  const av=idx===-1?{...NEW_AVISO_DRAFT,fecha:hoyAutorString()}:avisos[idx];
  $('af-tag').value=av.tag||'';$('af-fecha').value=av.fecha||'';
  $('af-texto').value=(av.texto||'').replace(/<strong>|<\/strong>/g,'');
  $('af-fecha-limite').value=av.fechaLimite||'';$('af-fecha-borrado').value=av.fechaBorrado||'';
  $('af-critico').checked=!!av.critico;
  const tabs=$('admin-aviso-tabs');tabs.innerHTML='';
  avisos.forEach((_,i)=>{const btn=document.createElement('button');btn.className='admin-tab-btn'+(i===idx?' active':'');btn.textContent='Aviso '+(i+1);btn.onclick=()=>mostrarFormAdmin(i);tabs.appendChild(btn);});
  const addBtn=document.createElement('button');addBtn.className='admin-tab-btn admin-tab-add'+(idx===-1?' active':'');addBtn.textContent=idx===-1?'+ Nuevo (sin guardar)':'+ Nuevo';addBtn.onclick=()=>mostrarFormAdmin(-1);tabs.appendChild(addBtn);
  $('admin-aviso-delete-wrap').style.display=idx===-1?'none':'';
}
async function guardarAviso() {
  const data = {
    tag:          $('af-tag').value.trim(),
    fecha:        $('af-fecha').value.trim(),
    texto:        $('af-texto').value.trim(),
    fechalimite:  $('af-fecha-limite').value || '',   // Sincronizado con Code.gs
    fechaborrado: $('af-fecha-borrado').value || '', // Sincronizado con Code.gs
    critico:      $('af-critico').checked
  };
  
  if (!data.tag && !data.texto) { 
    mostrarToast('⚠️ El aviso necesita al menos una etiqueta o texto.'); 
    return; 
  }

  let nuevoAviso;
  if (adminAvisoIdx === -1) {
    nuevoAviso = { id: generateId(), creado: Date.now(), ...data };
    avisos.push(nuevoAviso);
  } else {
    avisos[adminAvisoIdx] = { ...avisos[adminAvisoIdx], ...data };
    nuevoAviso = avisos[adminAvisoIdx];
  }
  saveAvisos();

  if (API_URL) {
    const r = await apiCall('saveAviso', nuevoAviso); 
    if (r.ok && r.aviso) {
      const i = avisos.findIndex(a => a.id === r.aviso.id);
      if (i >= 0) avisos[i] = r.aviso;
      saveAvisos();
    }
  }

  $('admin-overlay').classList.remove('visible');
  resetDeleteBtn();
  renderAvisos();
  renderAdminAvisos();
  mostrarToast('✓ Aviso guardado');
  if (!avHovered) iniciarAutoplay();
}
function pedirConfirmarBorrar(){if(adminAvisoIdx===-1||adminAvisoIdx>=avisos.length)return;adminPendingDelete=true;$('admin-aviso-delete').style.display='none';$('admin-aviso-delete-confirm').style.display='';$('admin-aviso-delete-cancel').style.display='';}
function cancelarConfirmarBorrar(){resetDeleteBtn();}
function resetDeleteBtn(){adminPendingDelete=false;const d=$('admin-aviso-delete');if(d)d.style.display='';const c=$('admin-aviso-delete-confirm');if(c)c.style.display='none';const x=$('admin-aviso-delete-cancel');if(x)x.style.display='none';}
function confirmarBorrarModal(){
  if(adminAvisoIdx<0||adminAvisoIdx>=avisos.length)return;
  const removed=avisos[adminAvisoIdx];
  setTimeout(async()=>{
    avisos.splice(adminAvisoIdx,1);
    if(removed&&(removed.tag||removed.texto)){historico.unshift({...removed,archivadoEn:Date.now()});saveHistorico();}
    saveAvisos();if(API_URL&&removed?.id)await apiCall('deleteAviso',{id:removed.id});
    $('admin-overlay').classList.remove('visible');resetDeleteBtn();renderAvisos();renderAdminAvisos();mostrarToast('✓ Aviso eliminado');
  },30);
}
function renderAdminAvisos(){
  const el=$('admin-avisos-preview');if(!el)return;
  pendingDeleteIdx=-1;
  if(!avisos.length){el.innerHTML=`<div style="padding:14px 0;color:var(--text-muted);">Sin avisos activos.</div><div style="margin-top:6px;"><button onclick="abrirAdminNuevo()" style="background:var(--verde);color:var(--crema);border:none;padding:8px 18px;border-radius:20px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;">+ Crear primer aviso</button></div>`;return;}
  el.innerHTML=avisos.map((a,i)=>`
    <div class="admin-aviso-row" data-row-idx="${i}">
      <span class="admin-aviso-row-tag">${escapeHtml(a.tag||'')}</span>
      <span class="admin-aviso-row-text">${escapeHtml((a.texto||'').replace(/<[^>]+>/g,'')).slice(0,90)}${(a.texto||'').length>90?'…':''}</span>
      <span class="admin-aviso-row-fecha">${escapeHtml(a.fecha||'')}${a.fechaLimite?' · vence '+formatDateShort(a.fechaLimite):''}</span>
      <span class="admin-aviso-row-actions" id="row-actions-${i}">
        <button class="admin-aviso-row-btn" onclick="abrirAdminEditar(${i})">Editar</button>
        <button class="admin-aviso-row-btn danger" onclick="pedirConfirmarBorrarRow(${i})">Eliminar</button>
      </span>
    </div>`).join('');
}
function pedirConfirmarBorrarRow(idx){
  if(pendingDeleteIdx!==-1&&pendingDeleteIdx!==idx)cancelarConfirmarBorrarRow(pendingDeleteIdx);
  pendingDeleteIdx=idx;
  const cont=$('row-actions-'+idx);if(!cont)return;
  cont.innerHTML=`<button class="admin-aviso-row-btn confirm" onclick="confirmarBorrarRow(${idx})">✓ Confirmar borrar</button><button class="admin-aviso-row-btn" onclick="cancelarConfirmarBorrarRow(${idx})">✕ Cancelar</button>`;
}
function cancelarConfirmarBorrarRow(idx){
  pendingDeleteIdx=-1;const cont=$('row-actions-'+idx);if(!cont)return;
  cont.innerHTML=`<button class="admin-aviso-row-btn" onclick="abrirAdminEditar(${idx})">Editar</button><button class="admin-aviso-row-btn danger" onclick="pedirConfirmarBorrarRow(${idx})">Eliminar</button>`;
}
function confirmarBorrarRow(idx){
  if(idx<0||idx>=avisos.length)return;
  const removed=avisos[idx];
  setTimeout(async()=>{
    avisos.splice(idx,1);
    if(removed&&(removed.tag||removed.texto)){historico.unshift({...removed,archivadoEn:Date.now()});saveHistorico();}
    saveAvisos();if(API_URL&&removed?.id)await apiCall('deleteAviso',{id:removed.id});
    renderAvisos();renderAdminAvisos();mostrarToast('✓ Aviso eliminado');
  },30);
}

/* ── HISTÓRICO ────────────────────────────────────────────── */
function abrirHistorico(){$('hist-overlay').classList.add('visible');renderHistorico();}
function cerrarHistorico(e){if(e&&e.target!==$('hist-overlay'))return;$('hist-overlay').classList.remove('visible');}
function renderHistorico(){
  const body=$('hist-body');
  if(!historico.length){body.innerHTML=`<div class="hist-empty">📭<br>No hay avisos archivados todavía.</div>`;return;}
  body.innerHTML=historico.map(a=>`
    <div class="hist-item">
      <div class="hist-item-meta">
        <span class="aviso-tag">${escapeHtml(a.tag||'')}</span>
        <span class="aviso-fecha-txt">${escapeHtml(a.fecha||'')}</span>
        ${a.archivadoEn?`<span class="aviso-fecha-txt">· archivado ${formatDateShort(new Date(a.archivadoEn).toISOString().slice(0,10))}</span>`:''}
      </div>
      <div class="hist-item-text">${a.texto||''}</div>
    </div>`).join('');
}

/* ── LECTURAS ─────────────────────────────────────────────── */
async function marcarComoLeido(avisoId,btn){
  if(!avisoId)return;setLeidoLocal(avisoId);
  if(btn){btn.disabled=true;btn.classList.add('leido');btn.textContent='✓ Leído';const m=btn.parentElement.querySelector('.aviso-leido-meta');if(m)m.textContent='Marcado · ahora';}
  if(API_URL){const r=await apiCall('markLeido',{avisoId});if(r.ok)mostrarToast('✓ Lectura confirmada');}
}
function renderAdminLecturas(lecturas){
  const body=$('admin-lecturas-body');if(!body)return;
  const criticos=avisos.filter(a=>a.critico);
  if(!criticos.length){body.innerHTML='<div style="color:var(--text-muted);padding:14px 0;">No hay avisos críticos activos.</div>';$('lecturas-meta').textContent='—';return;}
  const map={};(lecturas||[]).forEach(l=>{if(!map[l.avisoId])map[l.avisoId]=[];map[l.avisoId].push(l);});
  const totalGerentes = SUCURSALES.length;
  body.innerHTML=criticos.map(a=>{
    const lect=map[a.id]||[],pct=Math.round((lect.length/totalGerentes)*100);
    const pills=lect.map(l=>`<span class="lectura-pill"><span class="dot"></span>${escapeHtml(l.userNombre||'')}${l.userSucursal?' · '+escapeHtml(l.userSucursal):''}</span>`).join(' ');
    return`<div style="padding:12px 0;border-bottom:1px solid var(--card-border);">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
        <div><span class="aviso-tag">${escapeHtml(a.tag)}</span><span style="font-size:13px;color:var(--text);margin-left:8px;">${escapeHtml((a.texto||'').replace(/<[^>]+>/g,'')).slice(0,60)}…</span></div>
        <span style="font-size:13px;font-weight:700;color:${pct>=80?'#2e7d32':pct>=50?'#b35a00':'#c62828'};">${lect.length}/${totalGerentes} (${pct}%)</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">${pills||'<span style="color:var(--text-muted);font-size:11px;">Nadie ha confirmado todavía.</span>'}</div>
    </div>`;
  }).join('');
  $('lecturas-meta').textContent=`${criticos.length} crítico${criticos.length>1?'s':''} activo${criticos.length>1?'s':''}`;
}
async function enviarNewsletterAhora(){
  if(!isLeadership(currentUser))return;
  if(!API_URL){mostrarToast('⚠️ Conecta Apps Script primero');return;}
  mostrarToast('📧 Enviando...');
  const r=await apiCall('sendNewsletterNow',{});
  mostrarToast(r.ok?'✓ Newsletter enviado':'❌ Falló: '+(r.error||'error'));
}

/* ── TABLA CONSOLIDADO ────────────────────────────────────── */
const tbody=$('tabla-body');
SUCURSALES.forEach(nombre=>{
  const tr=document.createElement('tr');
  tr.innerHTML=`
    <td class="td-suc">${nombre}</td>
    <td><input class="td-edit" type="text" placeholder="—" oninput="rc(this)" onblur="rc(this)" data-col="meta" aria-label="Meta ${nombre}"></td>
    <td><input class="td-edit" type="text" placeholder="—" oninput="rc(this)" onblur="rc(this)" data-col="venta" aria-label="Venta ${nombre}"></td>
    <td class="td-avance" style="font-variant-numeric:tabular-nums">—</td>
    <td><input class="td-edit" type="text" placeholder="—" oninput="rc(this)" onblur="rc(this)" data-col="acumulado" aria-label="Acum. Mes ${nombre}"></td>
    <td><input class="td-edit" type="text" placeholder="—" oninput="rc(this)" onblur="rc(this)" data-col="trx" aria-label="TRX ${nombre}"></td>
    <td class="td-ticket" style="font-variant-numeric:tabular-nums">—</td>
    <td class="td-tendencia" style="font-variant-numeric:tabular-nums">—</td>
    <td><input class="td-edit" type="text" placeholder="Pendiente" oninput="rc(this)" onblur="rc(this)" data-col="entrego" aria-label="Entregó ${nombre}"></td>
    <td class="td-badge"><span class="badge badge-gray">Sin dato</span></td>`;
  tbody.appendChild(tr);
});
async function guardarConsolidadoLocal(){
  const data = getTablaData();
  const sem = document.getElementById('semana-label').textContent.trim();
  if(API_URL) {
    await apiCall('saveConsolidado', { semana: sem, data: data });
  }
  const allData = JSON.parse(localStorage.getItem('lcp_gdl_consolidado') || '{}');
  allData[sem] = data;
  localStorage.setItem('lcp_gdl_consolidado', JSON.stringify(allData));
}
async function cargarConsolidadoLocal(){
  const sem = document.getElementById('semana-label').textContent.trim();
  if (API_URL) {
    const res = await apiGet('getConsolidado', { semana: sem });
    if (res.ok && res.data.length > 0) {
      document.querySelectorAll('#tabla-body tr').forEach((tr,i)=>{
        const rowData = res.data.find(r => r.nombre === SUCURSALES[i]);
        if(rowData){
          if(rowData.meta) tr.querySelector('[data-col="meta"]').value = rowData.meta;
          if(rowData.venta) tr.querySelector('[data-col="venta"]').value = rowData.venta;
          if(rowData.acumulado) tr.querySelector('[data-col="acumulado"]').value = rowData.acumulado;
          if(rowData.trx) tr.querySelector('[data-col="trx"]').value = rowData.trx;
          tr.querySelector('[data-col="entrego"]').value = String(rowData.entrego).toLowerCase()==='true' ? "entregado" : "pendiente";
          rc(tr.querySelector('[data-col="meta"]'), false);
        }
      });
      return;
    }
  }
  const allData = JSON.parse(localStorage.getItem('lcp_gdl_consolidado') || '{}');
  const data = allData[sem];
  if(data && Array.isArray(data)){
    document.querySelectorAll('#tabla-body tr').forEach((tr,i)=>{
      const rowData = data.find(r => r.nombre === SUCURSALES[i]);
      if(rowData){
        if(rowData.meta) tr.querySelector('[data-col="meta"]').value = rowData.meta;
        if(rowData.venta) tr.querySelector('[data-col="venta"]').value = rowData.venta;
        if(rowData.acumulado) tr.querySelector('[data-col="acumulado"]').value = rowData.acumulado;
        if(rowData.trx) tr.querySelector('[data-col="trx"]').value = rowData.trx;
        tr.querySelector('[data-col="entrego"]').value = rowData.entrego ? "entregado" : "pendiente";
        rc(tr.querySelector('[data-col="meta"]'), false);
      }
    });
  }
}
let debounceTimer = null;
function actualizarFechaConsolidado() {
  const ts = 'Actualizado: ' + new Date().toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'});
  if(document.getElementById('tabla-update-meta')) document.getElementById('tabla-update-meta').textContent = ts;
  if(document.getElementById('dash-update-meta')) document.getElementById('dash-update-meta').textContent = ts;
}
function rc(input, save = true){
  const tr=input.closest('tr');
  const meta=p(tr.querySelector('[data-col="meta"]').value);
  const venta=p(tr.querySelector('[data-col="venta"]').value);
  const trx=p(tr.querySelector('[data-col="trx"]').value);
  const acum=p(tr.querySelector('[data-col="acumulado"]').value);
  const avEl=tr.querySelector('.td-avance');
  if(meta>0&&venta>0){const pct=(venta/meta*100).toFixed(1);avEl.textContent=pct+'%';avEl.style.color=sc(parseFloat(pct));}
  else{avEl.textContent='—';avEl.style.color='';}
  
  const ticket = (venta>0&&trx>0)?(venta/trx):0;
  tr.querySelector('.td-ticket').textContent=ticket?'$'+ticket.toFixed(0):'—';
  
  let tend = '—';
  if(ticket > 0) {
    if(ticket >= 150) tend = '<span style="color:#2e7d32;font-size:12px;">🟢 Alza</span>';
    else if(ticket >= 135) tend = '<span style="color:#b35a00;font-size:12px;">🟡 Estable</span>';
    else tend = '<span style="color:#c62828;font-size:12px;">🔴 Baja</span>';
  }
  tr.querySelector('.td-tendencia').innerHTML = tend;

  const bEl=tr.querySelector('.td-badge');
  if(meta>0&&venta>0){const pct=venta/meta*100;bEl.innerHTML=pct>=90?'<span class="badge badge-verde">✓ En meta</span>':pct>=70?'<span class="badge badge-amber">⚡ Atención</span>':'<span class="badge badge-rojo">✗ Bajo meta</span>';}
  else bEl.innerHTML='<span class="badge badge-gray">Sin dato</span>';
  
  if(save) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      guardarConsolidadoLocal();
      actualizarFechaConsolidado();
      if(document.getElementById('dashboard').classList.contains('active'))initDashboard();
    }, 400);
  }
}
function p(v){return parseFloat((v||'').replace(/[$,\s]/g,''))||0;}
function sc(p){return p>=90?'#2e7d32':p>=70?'#b35a00':'#c62828';}

/* ── DASHBOARD ────────────────────────────────────────────── */
function getTablaData(){
  const rows=[];
  document.querySelectorAll('#tabla-body tr').forEach((tr,i)=>{
    const nombre=SUCURSALES[i]||'';
    const meta=p(tr.querySelector('[data-col="meta"]')?.value||'');
    const venta=p(tr.querySelector('[data-col="venta"]')?.value||'');
    const acumulado=p(tr.querySelector('[data-col="acumulado"]')?.value||'');
    const trx=p(tr.querySelector('[data-col="trx"]')?.value||'');
    const entrego=(tr.querySelector('[data-col="entrego"]')?.value||'').trim().toLowerCase();
    rows.push({nombre,meta,venta,acumulado,trx,entrego:entrego&&entrego!=='pendiente'&&entrego!==''});
  });
  return rows;
}
function getChecklistForDash(){
  const d=getChecklistData();return SUCURSALES.filter(s=>d[s]).length;}

function initDashboard(){
  const data=getTablaData();
  const conDatos=data.filter(r=>r.meta>0&&r.venta>0);
  const entregas=getChecklistForDash();
  const entPct=Math.round(entregas/9*100);

  // KPIs
  $('kpi-entregas').textContent=entregas+'/9';
  $('kpi-entregas-sub').textContent=entPct+'% completado';
  $('kpi-bar-entregas').style.width=entPct+'%';

  const avances=conDatos.map(r=>r.venta/r.meta*100);
  const avgAvance=avances.length?Math.round(avances.reduce((a,b)=>a+b,0)/avances.length):0;
  $('kpi-avance').textContent=avgAvance+'%';
  $('kpi-avance-sub').textContent=conDatos.length+' suc. con datos';
  $('kpi-bar-avance').style.width=Math.min(avgAvance,100)+'%';

  const tickets=conDatos.filter(r=>r.trx>0).map(r=>r.venta/r.trx);
  const avgTicket=tickets.length?Math.round(tickets.reduce((a,b)=>a+b,0)/tickets.length):0;
  $('kpi-ticket').textContent=avgTicket?'$'+avgTicket.toLocaleString('es-MX'):'—';
  $('kpi-bar-ticket').style.width=avgTicket?Math.min(avgTicket/500*100,100)+'%':'0%';

  const totalTrx=data.reduce((a,r)=>a+r.trx,0);
  $('kpi-trx').textContent=totalTrx?totalTrx.toLocaleString('es-MX'):'—';
  $('kpi-bar-trx').style.width=totalTrx?Math.min(totalTrx/5000*100,100)+'%':'0%';

  const criticos=avisos.filter(a=>a.critico);
  const leidos=getLeidosLocales();
  const lCount=criticos.filter(a=>leidos[a.id]).length;
  const cobertura=criticos.length?Math.round(lCount/criticos.length*100):100;
  $('kpi-criticos').textContent=cobertura+'%';
  $('kpi-criticos-sub').textContent=criticos.length?lCount+'/'+criticos.length+' avisos leídos':'Sin críticos activos';
  $('kpi-bar-criticos').style.width=cobertura+'%';

  if (!conDatos.length && entregas === 0) {
    if(document.getElementById('dash-empty-state')) document.getElementById('dash-empty-state').style.display='block';
    if(document.getElementById('dash-charts-row')) document.getElementById('dash-charts-row').style.display='none';
    if(document.getElementById('dash-bottom-row')) document.getElementById('dash-bottom-row').style.display='none';
    if(document.getElementById('dash-tendencia-row')) document.getElementById('dash-tendencia-row').style.display='none';
  } else {
    if(document.getElementById('dash-empty-state')) document.getElementById('dash-empty-state').style.display='none';
    if(document.getElementById('dash-charts-row')) document.getElementById('dash-charts-row').style.display='';
    if(document.getElementById('dash-bottom-row')) document.getElementById('dash-bottom-row').style.display='';
    if(document.getElementById('dash-tendencia-row')) document.getElementById('dash-tendencia-row').style.display='';
    
    renderChartVentas(data);
    renderChartEntregas(entregas);
    renderHeatmap();
    renderRanking(data);
    renderChartTendencia();
  }
}

function getChartColors(){
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  return{
    grid:dark?'rgba(122,158,138,0.12)':'rgba(61,90,71,0.08)',
    text:dark?'#7a9e8a':'#7a8a82',
    verde:'#3D5A47',sage:'#7A9E8A',amber:'#c97d10',
    ventaBg:dark?'rgba(122,158,138,0.7)':'rgba(61,90,71,0.75)',
    metaBg:dark?'rgba(122,158,138,0.2)':'rgba(61,90,71,0.15)',
  };
}

function renderChartVentas(data){
  const ctx=document.getElementById('chart-ventas');if(!ctx)return;
  const c=getChartColors();
  const labels=data.map(r=>r.nombre.split(' ')[0]);
  const ventas=data.map(r=>r.venta||0);
  const metas=data.map(r=>r.meta||0);
  if(chartVentas){chartVentas.destroy();}
  chartVentas=new Chart(ctx,{
    type:'bar',
    data:{labels,datasets:[
      {label:'Venta neta',data:ventas,backgroundColor:c.ventaBg,borderRadius:5,borderSkipped:false},
      {label:'Meta',data:metas,backgroundColor:c.metaBg,borderRadius:5,borderSkipped:false,borderWidth:1,borderColor:c.sage}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:c.text,font:{family:'DM Sans',size:11}}},tooltip:{callbacks:{label:ctx=>'$'+ctx.parsed.y.toLocaleString('es-MX')}}},
    scales:{x:{ticks:{color:c.text,font:{family:'DM Sans',size:10},maxRotation:40},grid:{color:c.grid}},y:{ticks:{color:c.text,font:{family:'DM Sans',size:10},callback:v=>'$'+(v/1000).toFixed(0)+'k'},grid:{color:c.grid}}}}
  });
}

function renderChartEntregas(entregas){
  const ctx=document.getElementById('chart-entregas');if(!ctx)return;
  const c=getChartColors();
  const pendientes=9-entregas;
  if(chartEntregas)chartEntregas.destroy();
  chartEntregas=new Chart(ctx,{
    type:'doughnut',
    data:{labels:['Entregaron','Pendientes'],datasets:[{data:[entregas,pendientes],backgroundColor:[c.verde,'rgba(122,158,138,0.2)'],borderWidth:0,hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.label+': '+ctx.parsed}}}}
  });
  const leg=$('chart-entregas-legend');
  if(leg)leg.innerHTML=`<strong style="color:var(--verde)">${entregas}</strong> de 9 sucursales entregaron`;
}

function renderChartTendencia(){
  const ctx=document.getElementById('chart-tendencia');if(!ctx)return;
  const c=getChartColors();
  // datos demo de tendencia (6 semanas)
  const semanas=['S1','S2','S3','S4','S5','S6 (actual)'];
  const demo=[820000,910000,875000,950000,885000,930000];
  if(chartTendencia)chartTendencia.destroy();
  chartTendencia=new Chart(ctx,{
    type:'line',
    data:{labels:semanas,datasets:[{label:'Venta neta regional',data:demo,borderColor:c.sage,backgroundColor:'rgba(122,158,138,0.1)',borderWidth:2.5,pointBackgroundColor:c.verde,pointRadius:4,fill:true,tension:0.4}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:c.text,font:{family:'DM Sans',size:11}}}},
    scales:{x:{ticks:{color:c.text,font:{family:'DM Sans',size:10}},grid:{color:c.grid}},y:{ticks:{color:c.text,font:{family:'DM Sans',size:10},callback:v=>'$'+(v/1000).toFixed(0)+'k'},grid:{color:c.grid}}}}
  });
}

function renderHeatmap(){
  const cont=$('heatmap-container');if(!cont)return;
  const leidos=getLeidosLocales();
  const criticos=avisos.filter(a=>a.critico).slice(0,5);
  if(!criticos.length){cont.innerHTML='<div style="color:var(--text-muted);font-size:12px;padding:12px 0;">No hay avisos críticos para mostrar en el heatmap.</div>';return;}
  const colHeaders=`<div class="heatmap-col-headers">${criticos.map(a=>`<div class="heatmap-col-header">${escapeHtml((a.tag||'').replace(/[^\w\s]/g,'').trim().slice(0,6))}</div>`).join('')}</div>`;
  const rows=SUCURSALES.map(suc=>{
    const cells=criticos.map(a=>{
      const readLocal = !!leidos[a.id] && (!currentUser || currentUser.sucursal === suc);
      const readGlobal = lecturasGlobal.some(l => l.avisoId === a.id && l.userSucursal === suc);
      const read = readLocal || readGlobal;
      const nivel=read?3:0;
      return`<div class="heatmap-cell nivel-${nivel}" title="${suc} · ${escapeHtml(a.tag)}">${nivel>0?nivel:''}</div>`;
    }).join('');
    return`<div class="heatmap-row"><div class="heatmap-label">${escapeHtml(suc.split(' ')[0])}</div><div class="heatmap-cells">${cells}</div></div>`;
  }).join('');
  cont.innerHTML=colHeaders+`<div class="heatmap-grid">${rows}</div>`;
}

function renderRanking(data){
  const list=$('ranking-list');if(!list)return;
  const conDatos=data.filter(r=>r.meta>0&&r.venta>0).map(r=>({...r,pct:Math.round(r.venta/r.meta*100)})).sort((a,b)=>b.pct-a.pct);
  if(!conDatos.length){list.innerHTML='<div style="color:var(--text-muted);font-size:12px;">Sin datos en el consolidado todavía.</div>';return;}
  const max=conDatos[0]?.pct||100;
  list.innerHTML=conDatos.map((r,i)=>{
    const posClass=i===0?'gold':i===1?'silver':i===2?'bronze':'';
    const barPct=Math.min(r.pct/max*100,100);
    const color=r.pct>=90?'var(--verde)':r.pct>=70?'var(--amber)':'var(--rojo-soft)';
    return`<div class="ranking-item">
      <div class="ranking-pos ${posClass}">${i+1}</div>
      <div style="flex:2;">
        <div class="ranking-name">${escapeHtml(r.nombre)}</div>
        <div class="ranking-bar-wrap"><div class="ranking-bar" style="width:${barPct}%;background:${color}"></div></div>
      </div>
      <div class="ranking-pct" style="color:${color}">${r.pct}%</div>
    </div>`;
  }).join('');
}

function updateChartColors(){
  if(chartVentas)initDashboard();
}

/* ── INSTRUCCIONES ────────────────────────────────────────── */
function toggleInstrucciones(btn){
  const panel=$('instrucciones-panel'),v=panel.classList.toggle('visible');
  btn.textContent=v?'✕ Cerrar instrucciones':'📖 Instrucciones';
}
function cerrarInstrucciones(){
  $('instrucciones-panel').classList.remove('visible');
  const b=document.querySelector('.btn-instrucciones-global');if(b)b.textContent='📖 Instrucciones';
}
function toggleChangelog(){$('changelog-panel').classList.toggle('visible');}

/* ── TOAST ────────────────────────────────────────────────── */
let toastTimeout=null;
function mostrarToast(msg){
  let t=$('lcp-toast');
  if(!t){t=document.createElement('div');t.id='lcp-toast';t.style.cssText='position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--verde-deep);color:var(--crema);padding:11px 22px;border-radius:24px;font-size:13px;font-weight:500;z-index:1000;box-shadow:var(--shadow-lg);opacity:0;transition:opacity .25s;font-family:"DM Sans",sans-serif;pointer-events:none;white-space:nowrap;';document.body.appendChild(t);}
  t.textContent=msg;t.style.opacity='1';clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>{t.style.opacity='0';},2500);
}

/* ── FECHA Y SEMANA ───────────────────────────────────────── */
const hoy=new Date();
$('fecha-hoy').textContent=hoy.toLocaleDateString('es-MX',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
const lunes=new Date(hoy);lunes.setDate(hoy.getDate()-((hoy.getDay()+6)%7));
const domingo=new Date(lunes);domingo.setDate(lunes.getDate()+6);
const fc={day:'numeric',month:'short'};
$('semana-label').textContent=`Sem. ${lunes.toLocaleDateString('es-MX',fc)} – ${domingo.toLocaleDateString('es-MX',fc)} · ${hoy.getFullYear()}`;
$('stat-version').textContent=VERSION;
$('footer-ver').textContent=VERSION+'-beta · Portal GDL · 2026';

/* ── KICKOFF ──────────────────────────────────────────────── */
ocultarPortal();
cargarAvisos();
cargarConsolidadoLocal();
initOnboarding();

/* ══ JUNTAS Y ACUERDOS — lógica ════════════════════════════════ */
let juntasData = [];
let juntaFiltroActivo = 'todos';

const JUNTAS_DEMO = [
  {id:'jt_001', fecha:'2026-04-22', tipo:'regional', tema:'Revisión de metas Q2 y ajuste de operación verano', acuerdos:'• Se ajustan metas de venta un 8% al alza para junio.\n• Todas las sucursales deben enviar su formato de inventario antes del viernes.\n• Se implementará nuevo checklist de apertura a partir del 1 de mayo.\n• Próxima junta regional: 20 de mayo.', responsable:'Oliver González', estado:'en-proceso', autor:'Oliver González'},
  {id:'jt_002', fecha:'2026-04-10', tipo:'encargados', tema:'Protocolo de atención al cliente y uniformes', acuerdos:'• A partir del 15 de abril, todos los colaboradores deben portar gafete.\n• Se actualizó el script de saludo para caja.\n• Los encargados deben revisar uniformes al inicio de cada turno.\n• Se documentó el proceso de queja de cliente.', responsable:'Saúl Ibrahim', estado:'completado', autor:'Saúl Ibrahim'},
  {id:'jt_003', fecha:'2026-03-28', tipo:'operativa', tema:'Mantenimiento de equipos y reporte de incidencias', acuerdos:'• Se programa mantenimiento preventivo para la primera semana de abril.\n• Las incidencias de equipo deben reportarse en el formato dentro de las primeras 2 horas.\n• Contacto de mantenimiento: ext. 4412.', responsable:'Oliver González', estado:'completado', autor:'Oliver González'},
];

async function cargarJuntas(){
  const listEl=$('juntas-list');
  const emptyEl=$('juntas-empty');
  const loadEl=$('juntas-loading');
  if(!listEl)return;

  if(loadEl)loadEl.style.display='flex';
  if(listEl)listEl.style.display='none';
  if(emptyEl)emptyEl.style.display='none';

  if(API_URL){
    const r=await apiGet('juntas');
    juntasData=r.ok&&Array.isArray(r.data)?r.data:JUNTAS_DEMO;
  } else {
    juntasData=JUNTAS_DEMO;
  }

  if(loadEl)loadEl.style.display='none';
  renderJuntas();
}

function renderJuntas(){
  const listEl=$('juntas-list');
  const emptyEl=$('juntas-empty');
  if(!listEl)return;

  const filtered = juntaFiltroActivo==='todos'
    ? juntasData
    : juntasData.filter(j=>j.tipo===juntaFiltroActivo);

  if(!filtered.length){
    listEl.style.display='none';
    if(emptyEl)emptyEl.style.display='block';
    return;
  }
  if(emptyEl)emptyEl.style.display='none';
  listEl.style.display='flex';

  const esLider = isLeadership(currentUser);
  listEl.innerHTML = filtered.map(j=>{
    const estadoLabel={pendiente:'Pendiente',  'en-proceso':'En proceso', completado:'Completado'}[j.estado]||j.estado;
    const tipoLabel  ={regional:'Regional', encargados:'Encargados', operativa:'Operativa'}[j.tipo]||j.tipo;
    const fechaFmt   = j.fecha ? new Date(j.fecha+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}) : '—';
    return `<div class="junta-card">
      <div class="junta-card-header">
        <div class="junta-card-meta">
          <span class="junta-tipo-pill">${tipoLabel}</span>
          <span class="junta-fecha">${fechaFmt}</span>
          <span class="junta-estado-pill ${j.estado}">${estadoLabel}</span>
        </div>
        ${esLider?`<div class="junta-acciones"><button class="junta-edit-btn" onclick="abrirModalJunta('${j.id}')">Editar</button></div>`:''}
      </div>
      <div class="junta-card-tema">${j.tema||'Sin tema'}</div>
      <div class="junta-card-acuerdos">${(j.acuerdos||'Sin acuerdos registrados.')}</div>
      <div class="junta-card-footer">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Publicado por ${j.autor||j.responsable||'—'}
      </div>
    </div>`;
  }).join('');
}

function filtrarJuntas(tipo, btn){
  juntaFiltroActivo=tipo;
  document.querySelectorAll('.jfiltro').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  renderJuntas();
}

function abrirModalJunta(id){
  const overlay=$('junta-overlay');
  if(!overlay)return;
  const junta = id ? juntasData.find(j=>j.id===id) : null;
  $('junta-modal-titulo').textContent = junta ? 'Editar minuta' : 'Nueva minuta';
  $('jf-id').value       = junta ? junta.id   : '';
  $('jf-fecha').value    = junta ? junta.fecha : new Date().toISOString().split('T')[0];
  $('jf-tipo').value     = junta ? junta.tipo  : 'regional';
  $('jf-tema').value     = junta ? junta.tema  : '';
  $('jf-acuerdos').value = junta ? junta.acuerdos : '';
  $('jf-responsable').value = junta ? junta.responsable : (currentUser?.nombre||'');
  $('jf-estado').value   = junta ? junta.estado : 'pendiente';
  overlay.classList.add('visible');
}

function cerrarModalJunta(e){
  if(e && e.target !== $('junta-overlay'))return;
  $('junta-overlay').classList.remove('visible');
}

async function guardarJunta(){
  const id          = $('jf-id').value||null;
  const fecha       = $('jf-fecha').value;
  const tipo        = $('jf-tipo').value;
  const tema        = $('jf-tema').value.trim();
  const acuerdos    = $('jf-acuerdos').value.trim();
  const responsable = $('jf-responsable').value.trim();
  const estado      = $('jf-estado').value;
  const autor       = currentUser?.nombre||currentUser?.correo||'—';

  if(!tema){mostrarToast('⚠️ El tema es obligatorio');return;}

  const payload={id,fecha,tipo,tema,acuerdos,responsable,estado,autor};

  if(API_URL){
    const r=await apiCall('saveJunta',payload);
    if(!r.ok){mostrarToast('❌ '+(r.error||'Error al guardar'));return;}
    payload.id=r.id||id;
  } else {
    payload.id = id||('jt_'+Date.now());
  }

  if(id){
    const idx=juntasData.findIndex(j=>j.id===id);
    if(idx>=0)juntasData[idx]={...juntasData[idx],...payload};
  } else {
    juntasData.unshift(payload);
  }

  $('junta-overlay').classList.remove('visible');
  renderJuntas();
  mostrarToast('✓ Minuta publicada — visible para todos');
  pushNotif('📋 Nueva minuta publicada', tema);
}

// Mostrar botón de nueva junta solo para líderes
function aplicarJuntasRol(){
  const tb=$('juntas-toolbar');
  if(tb)tb.style.display=isLeadership(currentUser)?'flex':'none';
}
