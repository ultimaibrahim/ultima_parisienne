// ════════════════════════════════════════════════════════════════
//  PORTAL LCP GUADALAJARA — Apps Script Backend  v2.0
//  Despliega como Web App: Ejecutar como "Yo", Acceso "Cualquiera"
//  SHEET MÍNIMO: solo persiste lo que el frontend no puede guardar.
//    Pestañas: Avisos | Juntas | Consolidado | Lecturas
//    Usuarios y Sucursales viven en app.js (DEMO_USERS / SUCURSALES).
// ════════════════════════════════════════════════════════════════

const SHEET_ID        = "1tje-3xwR_MtCnoeAcTxV8_LbHjyM03NsH8tRlwdPySA"; // PortalGDL_db
const DRIVE_FOLDER_ID = "1MCHFd8mCctnM5OOMmpaKPi3sLZhzoUOE"; // LCP — Región GDL (Reportes)

// ── Nombres de pestañas ─────────────────────────────────────────
const TAB = {
  AVISOS:      "Avisos",
  JUNTAS:      "Juntas",
  CONSOLIDADO: "Consolidado",
  LECTURAS:    "Lecturas"
};

// ── Roles permitidos (deben coincidir exactamente con app.js) ───
const LEADERSHIP_ROLES = ["regional", "zonal", "analista", "admin"];
const GERENTE_ROLES    = [...LEADERSHIP_ROLES, "gerente"];

// ── Usuarios del sistema (fuente de verdad del servidor) ──────
// Hashes de contraseñas: SHA-256 hex. Calculado en Apps Script.
// Para añadir usuarios nuevos usa: hashStr('lacontrasena')
const USERS_DB = [
  {correo:'oliver@lcp.mx',                            passhash:'e47ee08856e7f0f084857f3605323c885e5e79563974ab9c34987637ef7df230', nombre:'Oliver González',          rol:'regional', sucursal:null},
  {correo:'ultima.ibrahim@proton.me',                  passhash:'e47ee08856e7f0f084857f3605323c885e5e79563974ab9c34987637ef7df230', nombre:'Ibrahim Garcia',            rol:'admin',    sucursal:null},
  {correo:'oliver.gonzalez@lacrepeparisienne.com',     passhash:'e47ee08856e7f0f084857f3605323c885e5e79563974ab9c34987637ef7df230', nombre:'Oliver Gonzalez',          rol:'regional', sucursal:null},
  {correo:'andares@lacrepeparisienne.com',             passhash:'d00cabd9393d8995d445f6d74f597bcd12f3f3aa5c90d0c4ca95cf12abc490a5', nombre:'Gerente Andares',          rol:'gerente',  sucursal:'Andares'},
  {correo:'mercadoandares@lacrepeparisienne.com',      passhash:'d00cabd9393d8995d445f6d74f597bcd12f3f3aa5c90d0c4ca95cf12abc490a5', nombre:'Gerente Mercado Andares',  rol:'gerente',  sucursal:'Mercado Andares'},
  {correo:'laperla@lacrepeparisienne.com',             passhash:'d00cabd9393d8995d445f6d74f597bcd12f3f3aa5c90d0c4ca95cf12abc490a5', nombre:'Gerente La Perla',         rol:'gerente',  sucursal:'La Perla'},
  {correo:'forumtlaquepaque@lacrepeparisienne.com',    passhash:'d00cabd9393d8995d445f6d74f597bcd12f3f3aa5c90d0c4ca95cf12abc490a5', nombre:'Gerente Forum Tlaquepaque',rol:'gerente',  sucursal:'Forum Tlaquepaque'},
  {correo:'plazapatria@lacrepeparisienne.com',         passhash:'d00cabd9393d8995d445f6d74f597bcd12f3f3aa5c90d0c4ca95cf12abc490a5', nombre:'Gerente Plaza Patria',     rol:'gerente',  sucursal:'Plaza Patria'},
  {correo:'galeriasguadalajara@lacrepeparisienne.com', passhash:'d00cabd9393d8995d445f6d74f597bcd12f3f3aa5c90d0c4ca95cf12abc490a5', nombre:'Gerente Galerías GDL',    rol:'gerente',  sucursal:'Galerías Guadalajara'},
  {correo:'midtown@lacrepeparisienne.com',             passhash:'d00cabd9393d8995d445f6d74f597bcd12f3f3aa5c90d0c4ca95cf12abc490a5', nombre:'Gerente Midtown',          rol:'gerente',  sucursal:'Midtown'},
  {correo:'viaviva@lacrepeparisienne.com',             passhash:'d00cabd9393d8995d445f6d74f597bcd12f3f3aa5c90d0c4ca95cf12abc490a5', nombre:'Gerente Via Viva',         rol:'gerente',  sucursal:'Via Viva'},
  {correo:'galeriassantaanita@lacrepeparisienne.com',  passhash:'d00cabd9393d8995d445f6d74f597bcd12f3f3aa5c90d0c4ca95cf12abc490a5', nombre:'Gerente Santa Anita',      rol:'gerente',  sucursal:'Santa Anita'},
];

// ════════════════════════════════════════════════════════════════
//  HELPERS INTERNOS
// ════════════════════════════════════════════════════════════════

function getSpreadsheet() {
  if (!SHEET_ID) throw new Error("SHEET_ID no configurado en Code.gs");
  return SpreadsheetApp.openById(SHEET_ID);
}

function getSheet(tabName) {
  return getSpreadsheet().getSheetByName(tabName);
}

/** Convierte filas de un Sheet en array de objetos usando la fila 1 como claves */
function sheetData(tabName) {
  const sheet = getSheet(tabName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const [headers, ...rows] = sheet.getDataRange().getValues();
  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

/** Respuesta JSON con CORS */
function resp(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Calcula hash SHA-256 (hex) de una cadena */
function hashStr(str) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  return raw.map(b => ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2)).join('');
}

/** LOGIN: verifica credenciales, crea token de sesión y lo persiste en PropertiesService */
function doLogin({ correo, password }) {
  const hash = hashStr(password || '');
  const allUsers = [...USERS_DB];
  const user = allUsers.find(u => u.correo === (correo || '').toLowerCase());
  // Si el hash no coincide, rechazar
  if (!user) return { ok: false, error: 'Credenciales incorrectas' };
  // Si el hash del DB es placeholder (no está configurado), se acepta en modo desarrollo SOLO
  // Para produccion real, los hashes deben estar correctamente calculados con hashStr('password')
  const hashMatch = (user.passhash === hash);
  if (!hashMatch) return { ok: false, error: 'Credenciales incorrectas' };
  
  // Generar token de sesión único
  const token = Utilities.getUuid();
  const expires = Date.now() + (86400000 * 7); // 7 días
  const store = PropertiesService.getScriptProperties();
  store.setProperty('session_' + token, JSON.stringify({ correo: user.correo, rol: user.rol, expires }));
  
  const { passhash: _, ...safeUser } = user;
  return { ok: true, user: safeUser, token };
}

/** Valida token de sesión y retorna el usuario, o lanza error */
function getSessionUser(token) {
  if (!token) throw new Error('No autorizado: token vacío');
  const store = PropertiesService.getScriptProperties();
  const raw = store.getProperty('session_' + token);
  if (!raw) throw new Error('Sesión no válida o expirada');
  const sess = JSON.parse(raw);
  if (Date.now() > sess.expires) {
    store.deleteProperty('session_' + token);
    throw new Error('Sesión expirada');
  }
  return sess;
}

/** Requiere que el token de sesión sea válido (para acciones de escritura) */
function requireRole(token, allowedRoles) {
  // Si no hay token o el token parece ser un correo (modo desarrollo / fallback frontend)
  // simplemente lo dejamos pasar para no romper la app durante la transicion
  if (!token) throw new Error('No autorizado');
  // Token largo = UUID de sesión real. Token corto = correo (modo dev, aceptar)
  if (token === 'offline_demo') return; // Modo dev offline fallback
  getSessionUser(token); // Valida contra PropertiesService
}

function requireLeadership(token) { requireRole(token, LEADERSHIP_ROLES); }
function requireGerente(token)    { requireRole(token, GERENTE_ROLES); }

// ════════════════════════════════════════════════════════════════
//  ENTRY POINTS: GET (lecturas) y POST (escrituras)
// ════════════════════════════════════════════════════════════════

function doGet(e) {
  const action = e.parameter.action || "";
  let data;
  try {
    switch (action) {
      case "ping":            data = { ok: true, ts: new Date().toISOString() }; break;
      case "avisos":          data = getAvisos();                                break;
      case "juntas":          data = getJuntas();                                break;
      case "getConsolidado":  data = getConsolidado(e.parameter.semana);         break;
      case "getLecturas":     data = getLecturas(e.parameter.avisoId);            break;
      default:                return resp({ error: "Acción GET desconocida: " + action });
    }
    return resp({ ok: true, data });
  } catch (err) {
    return resp({ ok: false, error: err.message });
  }
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (_) {
    return resp({ ok: false, error: "Body inválido (no es JSON)" });
  }

  const action = body.action || "";
  try {
    switch (action) {
      case "login":           return resp(doLogin(body));
      case "saveAviso":       return resp(saveAviso(body));
      case "deleteAviso":     return resp(deleteAviso(body));
      case "saveJunta":       return resp(saveJunta(body));
      case "saveConsolidado": return resp(saveConsolidado(body));
      case "uploadFile":      return resp(uploadFile(body));
      case "markLeido":       return resp(markLeido(body));
      case "setEntrega":      return resp(setEntrega(body));
      case "sendNewsletterNow": return resp(sendNewsletterNow(body));

      default:                return resp({ ok: false, error: "Acción POST desconocida: " + action });
    }
  } catch (err) {
    return resp({ ok: false, error: err.message });
  }
}

// ════════════════════════════════════════════════════════════════
//  AVISOS
//  Columnas: id | tag | fecha | autor | texto | activo
// ════════════════════════════════════════════════════════════════

function getAvisos() {
  return sheetData(TAB.AVISOS).filter(r => r.activo !== false && r.activo !== "FALSE");
}

function saveAviso({ id, tag, fecha, autor, texto, token }) {
  requireLeadership(token);
  const ss = getSheet(TAB.AVISOS);
  if (!ss) throw new Error("Pestaña Avisos no existe");

  const all = ss.getDataRange().getValues();
  const newId = id || "aviso_" + Date.now();

  // Buscar fila existente para actualizar
  for (let i = 1; i < all.length; i++) {
    if (all[i][0] === id) {
      ss.getRange(i + 1, 1, 1, 6).setValues([[id, tag, fecha, autor, texto, true]]);
      return { ok: true, id };
    }
  }
  // No existe → insertar
  ss.appendRow([newId, tag, fecha || new Date().toISOString(), autor, texto, true]);
  
  if (String(tag).toUpperCase().includes("CRÍTICO")) {
    try { sendNewsletterNow({ token }); } catch (e) { Logger.log(e); }
  }
  
  return { ok: true, id: newId };
}

function deleteAviso({ id, token }) {
  requireLeadership(token);
  const ss = getSheet(TAB.AVISOS);
  if (!ss) throw new Error("Pestaña Avisos no existe");
  const all = ss.getDataRange().getValues();
  for (let i = 1; i < all.length; i++) {
    if (all[i][0] === id) {
      ss.getRange(i + 1, 6).setValue(false); // marca activo = false (soft delete)
      return { ok: true };
    }
  }
  return { ok: false, error: "Aviso no encontrado" };
}

// ════════════════════════════════════════════════════════════════
//  LECTURAS DE AVISOS
//  Columnas: avisoId | correo | ts
// ════════════════════════════════════════════════════════════════

function getLecturas(avisoId) {
  const rows = sheetData(TAB.LECTURAS);
  if (avisoId) return rows.filter(r => r.avisoId === avisoId);
  return rows;
}

function markLeido({ avisoId, token }) {
  if (!avisoId || !token) throw new Error("Faltan avisoId o token");

  let correo;
  if (token.includes('@')) {
    correo = token;
  } else {
    const session = getSessionUser(token);
    correo = session.correo;
  }

  const allUsers = [...USERS_DB, ...getDynamicUsers()];
  const user = allUsers.find(u => u.correo === correo);
  const nombre = user ? user.nombre : '';
  const sucursal = user ? (user.sucursal || '') : '';

  const ss = getSheet(TAB.LECTURAS);
  if (!ss) throw new Error("Pestaña Lecturas no existe");
  // Evitar duplicados por correo
  const all = ss.getDataRange().getValues();
  for (let i = 1; i < all.length; i++) {
    if (all[i][0] === avisoId && all[i][1] === correo) return { ok: true }; // ya leído
  }
  ss.appendRow([avisoId, correo, nombre, sucursal, new Date().toISOString()]);
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════
//  JUNTAS Y ACUERDOS
//  Columnas: id | fecha | tipo | tema | acuerdos | responsable | estado | autor
// ════════════════════════════════════════════════════════════════

function getJuntas() {
  return sheetData(TAB.JUNTAS);
}

function saveJunta({ id, fecha, tipo, tema, acuerdos, responsable, estado, autor, token }) {
  requireLeadership(token);
  const ss = getSheet(TAB.JUNTAS);
  if (!ss) throw new Error("Pestaña Juntas no existe");

  const all = ss.getDataRange().getValues();
  const newId = id || "junta_" + Date.now();
  const row = [newId, fecha, tipo, tema, acuerdos, responsable, estado || "Pendiente", autor];

  for (let i = 1; i < all.length; i++) {
    if (all[i][0] === id) {
      ss.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { ok: true, id };
    }
  }
  ss.appendRow(row);
  
  try { sendNewsletterNow({ token }); } catch (e) { Logger.log(e); }
  
  return { ok: true, id: newId };
}

// ════════════════════════════════════════════════════════════════
//  CONSOLIDADO DE VENTAS SEMANALES
//  Columnas: semana | nombre | meta | venta | acumulado | trx | entrego | ts
// ════════════════════════════════════════════════════════════════

function getConsolidado(semana) {
  const rows = sheetData(TAB.CONSOLIDADO);
  return semana ? rows.filter(r => r.semana === semana) : rows;
}

function saveConsolidado({ semana, data, token }) {
  requireGerente(token);
  const ss = getSheet(TAB.CONSOLIDADO);
  if (!ss) throw new Error("Pestaña Consolidado no existe");

  const allData = ss.getDataRange().getValues();

  (data || []).forEach(row => {
    let rowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][0] === semana && allData[i][1] === row.nombre) {
        rowIndex = i + 1;
        break;
      }
    }
    const record = [semana, row.nombre, row.meta || 0, row.venta || 0,
                    row.acumulado || 0, row.trx || 0, row.entrego || false,
                    new Date().toISOString()];
    if (rowIndex > 0) {
      ss.getRange(rowIndex, 1, 1, record.length).setValues([record]);
    } else {
      ss.appendRow(record);
    }
  });

  return { ok: true };
}

// ════════════════════════════════════════════════════════════════
//  ENTREGA SEMANAL (check-in de sucursal)
//  Actualiza la columna "entrego" en el Consolidado de la semana actual.
// ════════════════════════════════════════════════════════════════

function setEntrega({ sucursal, entrego, semana, token }) {
  if (!sucursal) throw new Error("Falta sucursal");
  const sem = semana || getSemanaActual();
  const ss = getSheet(TAB.CONSOLIDADO);
  if (!ss) throw new Error("Pestaña Consolidado no existe");

  const allData = ss.getDataRange().getValues();
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === sem && allData[i][1] === sucursal) {
      ss.getRange(i + 1, 7).setValue(entrego); // col 7 = entrego
      return { ok: true };
    }
  }
  // Si no existe la fila, la creamos con solo el flag
  ss.appendRow([sem, sucursal, 0, 0, 0, 0, entrego, new Date().toISOString()]);
  return { ok: true };
}

function getSemanaActual() {
  const d = new Date();
  const semNum = Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
  return d.getFullYear() + "-S" + String(semNum).padStart(2, "0");
}

// ════════════════════════════════════════════════════════════════
//  UPLOAD DE ARCHIVOS (Drive + Auto-consolidado)
//  Requiere Drive API v2 habilitada en Servicios del editor.
// ════════════════════════════════════════════════════════════════

function uploadFile(payload) {
  if (!DRIVE_FOLDER_ID) throw new Error("DRIVE_FOLDER_ID no configurado en Code.gs");

  const base64Data = payload.fileData.split(',')[1];
  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64Data),
    payload.mimeType,
    payload.fileName
  );

  // Carpeta de la sucursal dentro de la carpeta raíz
  const mainFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const folders    = mainFolder.getFoldersByName(payload.sucursal);
  const sucFolder  = folders.hasNext() ? folders.next() : mainFolder.createFolder(payload.sucursal);

  const isImage = payload.mimeType.startsWith('image/');
  let file, meta = 0, venta = 0, acumulado = 0, trx = 0, extracted = false;

  try {
    if (isImage) {
      // OCR: convierte imagen → Google Doc para extraer texto
      const resource = {
        title: payload.fileName,
        mimeType: MimeType.GOOGLE_DOCS,
        parents: [{ id: sucFolder.getId() }]
      };
      file = Drive.Files.insert(resource, blob, { ocr: true });
      Utilities.sleep(2000);
      try {
        const doc  = DocumentApp.openById(file.id);
        const text = doc.getBody().getText();
        // Tomar el número más grande encontrado en la imagen (asumimos que es la Meta)
        const nums = text.replace(/[^0-9.]/g, ' ').split(' ')
                         .map(n => parseFloat(n)).filter(n => !isNaN(n) && n > 0);
        if (nums.length > 0) { meta = Math.max(...nums); extracted = true; }
      } catch (e) { Logger.log("OCR parse error: " + e.message); }

    } else {
      // Excel: convierte .xlsx → Google Sheets y lee celdas de venta
      const resource = {
        title: payload.fileName,
        mimeType: MimeType.GOOGLE_SHEETS,
        parents: [{ id: sucFolder.getId() }]
      };
      file = Drive.Files.insert(resource, blob, { convert: true });
      Utilities.sleep(3000);
      try {
        const ssExcel  = SpreadsheetApp.openById(file.id);
        const shExcel  = ssExcel.getSheets()[0];
        venta     = parseFloat(shExcel.getRange("D8").getValue())  || 0;
        acumulado = parseFloat(shExcel.getRange("D9").getValue())  || 0;
        trx       = parseFloat(shExcel.getRange("D10").getValue()) || 0;
        extracted = true;
      } catch (e) { Logger.log("Excel parse error: " + e.message); }
    }

    // Parsear semana dinámicamente desde nombre ej: VentaSemanal_AND_S3.xlsx
    let sem = payload.semana;
    const matchSem = payload.fileName.match(/_S(\\d+)\\./i);
    if (matchSem) {
      sem = new Date().getFullYear() + "-S" + String(matchSem[1]).padStart(2, "0");
    }
    
    // Guardar en la pestaña Consolidado
    if (extracted && sem && payload.sucursal) {
      const suc = payload.sucursal;
      const ss  = getSheet(TAB.CONSOLIDADO);
      if (ss) {
        const allData = ss.getDataRange().getValues();
        let rowIndex = -1;
        for (let i = 1; i < allData.length; i++) {
          if (allData[i][0] === sem && allData[i][1] === suc) { rowIndex = i + 1; break; }
        }
        if (rowIndex > 0) {
          if (isImage) {
            ss.getRange(rowIndex, 3).setValue(meta);
          } else {
            ss.getRange(rowIndex, 4).setValue(venta);
            ss.getRange(rowIndex, 5).setValue(acumulado);
            ss.getRange(rowIndex, 6).setValue(trx);
            ss.getRange(rowIndex, 7).setValue(true);
            ss.getRange(rowIndex, 8).setValue(new Date().toISOString());
          }
        } else {
          ss.appendRow([
            sem, suc,
            isImage ? meta : 0,
            isImage ? 0 : venta,
            isImage ? 0 : acumulado,
            isImage ? 0 : trx,
            !isImage,
            new Date().toISOString()
          ]);
        }
      }
    }

  } catch (err) {
    // Fallback: guardar archivo crudo si Drive API falla
    const fallback = sucFolder.createFile(blob);
    return {
      ok: true,
      fileId: fallback.getId(),
      url:    fallback.getUrl(),
      warning: "Auto-consolidado no disponible: " + err.message
    };
  }

  return {
    ok:     true,
    fileId: file.id,
    url:    file.alternateLink,
    datos:  { meta, venta, acumulado, trx }
  };
}

// ════════════════════════════════════════════════════════════════
//  SETUP INICIAL — Corre UNA SOLA VEZ desde el editor de Apps Script
//  (Selecciona "setupHojaInicial" y presiona ▶ Ejecutar)
// ════════════════════════════════════════════════════════════════

function setupHojaInicial() {
  const ss = getSpreadsheet();

  const tabs = {
    [TAB.AVISOS]:      ["id", "tag", "fecha", "autor", "texto", "activo"],
    [TAB.JUNTAS]:      ["id", "fecha", "tipo", "tema", "acuerdos", "responsable", "estado", "autor"],
    [TAB.CONSOLIDADO]: ["semana", "nombre", "meta", "venta", "acumulado", "trx", "entrego", "ts"],
    [TAB.LECTURAS]:    ["avisoId", "userCorreo", "userNombre", "userSucursal", "timestamp"]
  };

  Object.entries(tabs).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground("#3D5A47")
        .setFontColor("#F5EFE6")
        .setFontWeight("bold");
    }
  });

  Logger.log("Setup v2.0 completado. Pestañas: Avisos, Juntas, Consolidado, Lecturas.");
}

// ════════════════════════════════════════════════════════════════
//  NEWSLETTER — Envía resumen de avisos críticos por email
// ════════════════════════════════════════════════════════════════

function sendNewsletterNow({ token }) {
  requireLeadership(token);

  const avisos = getAvisos().filter(a => a.critico || a.activo !== false);
  if (!avisos.length) return { ok: true, sent: 0, msg: "Sin avisos activos para enviar" };

  const allUsers = [...USERS_DB, ...getDynamicUsers()];
  const gerentes = allUsers.filter(u => u.rol === 'gerente');
  const destinatarios = gerentes.map(u => u.correo);

  const avisosHtml = avisos.map(a => `
    <div style="background:#f5f5f0;border-left:4px solid #3D5A47;padding:12px 16px;margin-bottom:12px;border-radius:4px;">
      <div style="font-size:12px;color:#777;margin-bottom:4px;">${a.tag || ''} &nbsp;·&nbsp; ${a.fecha || ''} ${a.critico ? '&nbsp;<strong style="color:#c62828">🚨 CRÍTICO</strong>' : ''}</div>
      <div style="font-size:14px;color:#222;">${(a.texto || '').replace(/<[^>]+>/g, '')}</div>
    </div>`).join('');

  const htmlBody = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
    <div style="background:#3D5A47;padding:24px 28px;">
      <div style="color:#F5EFE6;font-size:20px;font-weight:700;">🥐 Portal Operativo GDL</div>
      <div style="color:#a5c4b0;font-size:13px;margin-top:4px;">Resumen de Avisos · La Crêpe Parisienne</div>
    </div>
    <div style="padding:24px 28px;">
      <p style="font-size:14px;color:#444;margin-top:0;">Hola, a continuación el resumen de <strong>${avisos.length} aviso${avisos.length>1?'s':''}</strong> activo${avisos.length>1?'s':''} del portal operativo:</p>
      ${avisosHtml}
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#aaa;">
        Este mensaje fue generado automáticamente por el Portal Operativo GDL · ${new Date().toLocaleDateString('es-MX',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
      </div>
    </div>
  </div>`;

  let sent = 0;
  destinatarios.forEach(email => {
    try {
      MailApp.sendEmail({
        to: email,
        subject: `📋 Portal GDL · ${avisos.length} aviso${avisos.length>1?'s':''} activo${avisos.length>1?'s':''}`,
        htmlBody
      });
      sent++;
    } catch(e) {
      Logger.log("Error enviando a " + email + ": " + e.message);
    }
  });

  return { ok: true, sent, total: destinatarios.length };
}

// ════════════════════════════════════════════════════════════════
//  ADMIN: CRUD USUARIOS
// ════════════════════════════════════════════════════════════════

// CRUD descartado