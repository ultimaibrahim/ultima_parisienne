/* ══════════════════════════════════════════════════════════════
   api.js · Portal Operativo LCP
   Capa de comunicación con Google Apps Script
   Lee el API URL dinámicamente de la región activa del usuario
   ══════════════════════════════════════════════════════════════ */

/** Retorna el API_URL de la región activa del usuario actual */
function getActiveApiUrl() {
  if (typeof currentUser !== 'undefined' && currentUser?.region) {
    return getApiUrl(currentUser.region);
  }
  // Fallback: usar GDL mientras no hay sesión activa
  return REGIONES.GDL.apiUrl;
}

/**
 * POST al Apps Script.
 * @param {string} action
 * @param {object} payload
 */
async function apiCall(action, payload) {
  const API_URL = getActiveApiUrl();
  if (!API_URL) return { ok: false, demo: true };
  let token = localStorage.getItem(TOKEN_KEY) || '';
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token, ...(payload || {}) })
    });
    return await response.json();
  } catch (e) {
    console.warn('[apiCall] Error:', action, e);
    return { ok: false, error: String(e) };
  }
}

/**
 * GET al Apps Script con parámetros en la URL.
 * @param {string} action
 * @param {object} params
 */
async function apiGet(action, params) {
  const API_URL = getActiveApiUrl();
  if (!API_URL) return { ok: false, demo: true };
  try {
    const queryParams = new URLSearchParams({ action, ...(params || {}) }).toString();
    const response = await fetch(`${API_URL}?${queryParams}`);
    return await response.json();
  } catch (e) {
    console.warn('[apiGet] Error:', action, e);
    return { ok: false, error: String(e) };
  }
}
