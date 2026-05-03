/* ══════════════════════════════════════════════════════════════
   config.js · Portal Operativo LCP
   FUENTE DE VERDAD ÚNICA — Todas las constantes del sistema
   Fase 2: Arquitectura Multi-Región preparada para GDL / CDMX / MTY
   ══════════════════════════════════════════════════════════════ */

// ── Versión ─────────────────────────────────────────────────────
const VERSION = 'v0.7.0';

// ── LocalStorage Keys ───────────────────────────────────────────
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
const CONSOLIDADO_KEY = 'lcp_gdl_consolidado';
const AVISOS_CACHE_TS_KEY = 'lcp_gdl_avisos_ts';
const AVISOS_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const NUEVO_WINDOW_MS = 86400000;

// ── Roles ────────────────────────────────────────────────────────
const LEADERSHIP_ROLES = ['admin', 'analista', 'regional', 'zonal'];
const GERENTE_ROLES    = [...LEADERSHIP_ROLES, 'gerente'];

// ── Secciones de navegación ──────────────────────────────────────
const SECCIONES  = ['inicio', 'dashboard', 'sucursales', 'regional', 'juntas', 'formatos', 'about', 'admin-section'];
const MOBILE_MAP = {
  'inicio':      'mn-inicio',
  'dashboard':   'mn-dashboard',
  'sucursales':  'mn-sucursales',
  'regional':    'mn-regional',
  'juntas':      'mn-juntas',
  'formatos':    'mn-formatos'
};

// ════════════════════════════════════════════════════════════════
//  REGIONES — Arquitectura Multi-Región
//  GDL: activa | CDMX y MTY: preparadas para implementación futura
// ════════════════════════════════════════════════════════════════
const REGIONES = {
  GDL: {
    id:           'GDL',
    nombre:       'Guadalajara',
    estado:       'Jalisco',
    status:       'activa',
    // Apps Script Web App URL de esta región
    apiUrl:       'https://script.google.com/macros/s/AKfycbwnfhrIGKaAy3LuRdKx7J_QIRH-GelnbazmpoEeaxmbabMcEW9Ue3BcM5X1nCVd0euZ/exec',
    sheetId:      '1tje-3xwR_MtCnoeAcTxV8_LbHjyM03NsH8tRlwdPySA',
    driveFolderId:'1MCHFd8mCctnM5OOMmpaKPi3sLZhzoUOE',
    color:        '#3D5A47',
    emoji:        '🌵'
  },
  CDMX: {
    id:           'CDMX',
    nombre:       'Ciudad de México',
    estado:       'CDMX',
    status:       'pendiente',   // ← Cambiar a 'activa' cuando se implemente
    apiUrl:       null,          // ← Pegar URL del deploy de CDMX aquí
    sheetId:      null,          // ← ID del Sheet de CDMX aquí
    driveFolderId:null,          // ← ID de la carpeta Drive de CDMX aquí
    color:        '#4A3D5A',
    emoji:        '🏙️'
  },
  MTY: {
    id:           'MTY',
    nombre:       'Monterrey',
    estado:       'Nuevo León',
    status:       'pendiente',   // ← Cambiar a 'activa' cuando se implemente
    apiUrl:       null,
    sheetId:      null,
    driveFolderId:null,
    color:        '#5A4A3D',
    emoji:        '⛰️'
  }
};

/** Retorna la región activa del usuario actual */
function getRegionActiva(regionId) {
  return REGIONES[regionId] || REGIONES.GDL;
}

/** Retorna el API URL de la región del usuario */
function getApiUrl(regionId) {
  const region = getRegionActiva(regionId);
  return region.status === 'activa' ? region.apiUrl : null;
}

// ════════════════════════════════════════════════════════════════
//  SUCURSALES POR REGIÓN
// ════════════════════════════════════════════════════════════════
const SUCURSALES_POR_REGION = {
  GDL: [
    'Andares',
    'Mercado Andares',
    'Via Viva',
    'Midtown',
    'La Perla',
    'Plaza Patria',
    'Santa Anita',
    'Galerías Guadalajara',
    'Forum Tlaquepaque'
  ],
  CDMX: [
    // ← Agregar sucursales de CDMX aquí cuando se implementen
  ],
  MTY: [
    // ← Agregar sucursales de MTY aquí cuando se implementen
  ]
};

/** Retorna el array de sucursales de la región activa */
function getSucursalesRegion(regionId) {
  return SUCURSALES_POR_REGION[regionId] || SUCURSALES_POR_REGION.GDL;
}

// Alias global para compatibilidad con el código existente
// Se actualiza dinámicamente según la región del usuario en auth.js
let SUCURSALES = SUCURSALES_POR_REGION.GDL;

// ════════════════════════════════════════════════════════════════
//  DATOS DE DRIVE POR SUCURSAL (IDs de carpetas de Google Drive)
// ════════════════════════════════════════════════════════════════
const SUCURSAL_DATA_POR_REGION = {
  GDL: {
    'Andares':             {code:'AND',root:'12W9Q93CPZ2-HxQsVja7mGgR4WA5UKuOV',ventas:'1mqzW6X7p1mosxahnmfp97rnKuV8J4KsR',inv:'1gW4JMJde4PukMNZZDEA4Ylhn-XGqHCtW',inc:'1WQQUYzjiUuxTb8bQ4og4VRyWSGugqUEV',hor:'1u3ghNzkza1QGid0kAhpTarnbhedXUyUQ'},
    'Mercado Andares':     {code:'MAN',root:'1EKnE_CnT8z4Jbj0U7-C_GiZjiPZZs447',ventas:'18-90ajjPs-g_eJaWG1tch88TaRrN3LmP',inv:'1eWEgQKLUonmN1t3zfcKrZRQIbAMbYB9h',inc:'1RL4kFDT-OtlpzSyQIV4jNUOd1_qejZKz',hor:'1g-I2lttpFWUF5HANgNvXfp2RJGEjNFne'},
    'Via Viva':            {code:'VIV',root:'1QhvpWf9iioXBYB40AAENFxKqnvMvgnm0',ventas:'1cIJVEGZho1Qc21CS8NZUUXW75vPl8A6G',inv:'1TtWQDaIevn4KO9smiQe7zK20trihlFWl',inc:'1Z5pZ97nn6xj-dFUw6Oaef7c5R_rWhHFi',hor:'1NtE7nDOs9rITTJar7p0j1p1o77_nFM1w'},
    'Midtown':             {code:'MID',root:'16VFQ-oWDvuDHTnjIPcJOP4eVPge7eAeB',ventas:'1W3UcwmizLvfkULAgFERQ0tHtTrPJ1DnM',inv:'1l02l3MN5pXF514_b4Qe3qPZEQN4xhQxQ',inc:'19bDJCiWf1kCQxL7KYl-Sue7nbBK4Ztm4',hor:'18dkjZAS4VZBlgCo6f6Oa8ewUOV-5q6a_'},
    'La Perla':            {code:'PER',root:'1xgbwp2IS-Itp3JCxPaCUO4aLs_R0HacW',ventas:'1gtm44_lvtf3Jx-T_DYUO_jcUBrD24mId',inv:'1K9cnl4Ez2jPEC2zuRKzoDkLIhg_uDUKj',inc:'1D2TcA-dWkeBdZ-XMhCJvaQdLKV40Z9iG',hor:'1z_-amQqoctcbUE5fQ1wuId76CwujB8ei'},
    'Plaza Patria':        {code:'PAT',root:'1Z3rN3AZvNdVfrTadZ-Rg2VT0iuwC_NFG',ventas:'1379j-uzf8tmqIe5tz8Lo5VPDTvgK4hM8',inv:'1LogHJEJsgFiYr52t0HvffS-dXdIazaXI',inc:'17yEfrEhH_aU2avs0xkRb5Mqv4sVT4Oyg',hor:'16S4ItW3XueNzCwup6FhDcqO9G5kqwEWC'},
    'Santa Anita':         {code:'ANI',root:'17hAbt1Gb1hsbZht-1SGusX23UGTwtbvB',ventas:'1vJZND7QsSKdgzkS0eqSDhNXqecDUD5sw',inv:'1as_3F1kqS4SXeJ9x4k7bZDTCeCortuCC',inc:'1O1AqtoAddpO1EONYSyp3F7TVQnzr0HqY',hor:'1hhnuRm8t5wSnyUtWsJwXyFPx1_2kwzV7'},
    'Galerías Guadalajara':{code:'GAL',root:'1x7GL78aCuSwIS4Q-1dhzj80vi2i4sHHe',ventas:'1zqnO-cu67Q2jamBnV8gFp6U6EmKiY3U4',inv:'1_M7FHAhBb4L9O2ByqxgI5X4u_4-wQVg9',inc:'1o8K1aCZRCXMT6OMg4D2SXWJaSLIChE2R',hor:'14t1sWZteBqo6h9A5uDwxBOfhdq8HCMuc'},
    'Forum Tlaquepaque':   {code:'FOR',root:'1mg7hJu2-wtRn4YiCdW9C6uZqwUalSKQH',ventas:'1DOo4tqN38Vm02jprGI6YOG-4f7L0XEpI',inv:'1n6UO7P8iW0p2xD4l89Uf5p6T9XWHqflR',inc:'1ed0_DtGc_xWW7-gc6g7AVK8IWLuMJmxb',hor:'1i3y-Fcsxx_EY4yxGIE0-O0MjiFmrl02c'}
  },
  CDMX: {
    // ← Pegar datos de sucursales CDMX aquí cuando se implementen
    // Ejemplo:
    // 'Polanco': {code:'POL', root:'...', ventas:'...', inv:'...', inc:'...', hor:'...'}
  },
  MTY: {
    // ← Pegar datos de sucursales MTY aquí cuando se implementen
  }
};

/** Alias global que se actualiza según la región activa */
let SUCURSAL_DATA = SUCURSAL_DATA_POR_REGION.GDL;

/** Actualiza los datos globales de sucursales según la región del usuario */
function activarRegion(regionId) {
  const rid = regionId || 'GDL';
  SUCURSALES    = getSucursalesRegion(rid);
  SUCURSAL_DATA = SUCURSAL_DATA_POR_REGION[rid] || {};
}

// ════════════════════════════════════════════════════════════════
//  USUARIOS — Fallback local (solo para modo offline/demo)
//  La autenticación real ocurre en Apps Script (Code.gs → USERS_DB)
// ════════════════════════════════════════════════════════════════
const USUARIOS_LOCALES = [
  {id:1,  nombre:'Oliver González',          correo:'oliver@lcp.mx',                              sucursal:null,                  rol:'regional', region:'GDL', password:'lcp2026'},
  {id:3,  nombre:'Gerente Santa Anita',      correo:'galeriassantaanita@lacrepeparisienne.com',    sucursal:'Santa Anita',         rol:'gerente',  region:'GDL', password:'grupomyt2025'},
  {id:4,  nombre:'Gerente Andares',          correo:'andares@lacrepeparisienne.com',               sucursal:'Andares',             rol:'gerente',  region:'GDL', password:'grupomyt2025'},
  {id:5,  nombre:'Gerente Mercado Andares',  correo:'mercadoandares@lacrepeparisienne.com',        sucursal:'Mercado Andares',     rol:'gerente',  region:'GDL', password:'grupomyt2025'},
  {id:6,  nombre:'Gerente La Perla',         correo:'laperla@lacrepeparisienne.com',               sucursal:'La Perla',            rol:'gerente',  region:'GDL', password:'grupomyt2025'},
  {id:7,  nombre:'Gerente Forum',            correo:'forumtlaquepaque@lacrepeparisienne.com',      sucursal:'Forum Tlaquepaque',   rol:'gerente',  region:'GDL', password:'grupomyt2025'},
  {id:8,  nombre:'Gerente Patria',           correo:'plazapatria@lacrepeparisienne.com',           sucursal:'Plaza Patria',        rol:'gerente',  region:'GDL', password:'grupomyt2025'},
  {id:9,  nombre:'Gerente Galerías',         correo:'galeriasguadalajara@lacrepeparisienne.com',   sucursal:'Galerías Guadalajara',rol:'gerente',  region:'GDL', password:'grupomyt2025'},
  {id:10, nombre:'Gerente Midtown',          correo:'midtown@lacrepeparisienne.com',               sucursal:'Midtown',             rol:'gerente',  region:'GDL', password:'grupomyt2025'},
  {id:11, nombre:'Gerente Via Viva',         correo:'viaviva@lacrepeparisienne.com',               sucursal:'Via Viva',            rol:'gerente',  region:'GDL', password:'grupomyt2025'},
  {id:12, nombre:'Ibrahim Garcia',           correo:'ultima.ibrahim@proton.me',                   sucursal:null,                  rol:'admin',    region:'GDL', password:'grupomyt2025'},
  {id:13, nombre:'Oliver Gonzalez',          correo:'oliver.gonzalez@lacrepeparisienne.com',       sucursal:null,                  rol:'regional', region:'GDL', password:'grupomyt2025'}
];

// Alias para compatibilidad (app.js antiguo lo llamaba DEMO_USERS)
const DEMO_USERS = USUARIOS_LOCALES;
