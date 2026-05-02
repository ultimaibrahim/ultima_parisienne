// ═══════════════════════════════════════════════════════════════
//  PORTAL LCP GUADALAJARA — Apps Script Backend  v1.0
//  Despliega como Web App: Ejecutar como "Yo", Acceso "Cualquiera"
// ═══════════════════════════════════════════════════════════════

const SHEET_ID = ""; // ← PEGA AQUÍ el ID de tu Google Sheet
const DRIVE_FOLDER_ID = ""; // ← PEGA AQUÍ el ID de la carpeta principal de Drive (Reportes Semanales)
const CORS_ORIGIN = "*"; // Cambia a la URL exacta del portal en producción

// ── Nombres de pestañas ──────────────────────────────────────
const TAB = {
  USUARIOS:  "Usuarios",
  AVISOS:    "Avisos",
  JUNTAS:    "Juntas",
  ENTREGAS:  "Entregas",
  SUCURSALES:"Sucursales",
};

// ════════════════════════════════════════════════════════════════
//  ENTRY POINTS
// ════════════════════════════════════════════════════════════════

function doGet(e) {
  const action = e.parameter.action || "";
  let data;

  try {
    switch (action) {
      case "avisos":     data = getAvisos();     break;
      case "juntas":     data = getJuntas();     break;
      case "entregas":   data = getEntregas(e.parameter.semana); break;
      case "sucursales": data = getSucursales(); break;
      case "ping":       data = { ok: true, ts: new Date().toISOString() }; break;
      default:           return resp({ error: "Acción desconocida: " + action }, 400);
    }
    return resp({ ok: true, data });
  } catch (err) {
    return resp({ error: err.message }, 500);
  }
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (_) {
    return resp({ error: "JSON inválido" }, 400);
  }

  const action = body.action || "";
  try {
    switch (action) {
      case "login":         return resp(login(body));
      case "saveAviso":     return resp(saveAviso(body));
      case "deleteAviso":   return resp(deleteAviso(body));
      case "saveJunta":     return resp(saveJunta(body));
      case "saveEntrega":   return resp(saveEntrega(body));
      case "uploadFile":    return resp(uploadFile(body));
      default:              return resp({ error: "Acción desconocida: " + action }, 400);
    }
  } catch (err) {
    return resp({ error: err.message }, 500);
  }
}

// ════════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════════

function login({ correo, password }) {
  if (!correo || !password) return { ok: false, error: "Faltan credenciales" };

  const rows = sheetData(TAB.USUARIOS);
  // Columnas esperadas: correo | password | nombre | rol | sucursal
  const user = rows.find(r =>
    (r.correo || "").toLowerCase() === correo.toLowerCase() &&
    String(r.password) === String(password)
  );

  if (!user) return { ok: false, error: "Credenciales incorrectas" };

  return {
    ok: true,
    user: {
      correo:   user.correo,
      nombre:   user.nombre,
      rol:      user.rol,       // "regional" | "encargado" | "colaborador"
      sucursal: user.sucursal,
    }
  };
}

// ════════════════════════════════════════════════════════════════
//  AVISOS
// ════════════════════════════════════════════════════════════════
// Columnas: id | tag | fecha | autor | texto | activo

function getAvisos() {
  return sheetData(TAB.AVISOS)
    .filter(r => String(r.activo).toLowerCase() !== "false")
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function saveAviso({ id, tag, fecha, autor, texto, token }) {
  requireEncargado(token);
  const ss  = getSheet(TAB.AVISOS);
  const all = sheetData(TAB.AVISOS);

  if (id) {
    // Editar existente
    const rowIdx = findRowById(ss, id);
    if (rowIdx < 0) return { ok: false, error: "Aviso no encontrado" };
    const row = ss.getRange(rowIdx, 1, 1, 6);
    row.setValues([[id, tag, fecha, autor, texto, true]]);
  } else {
    // Nuevo
    const newId = "av_" + Date.now();
    ss.appendRow([newId, tag, fecha, autor, texto, true]);
    id = newId;
  }
  return { ok: true, id };
}

function deleteAviso({ id, token }) {
  requireLeadership(token);
  const ss     = getSheet(TAB.AVISOS);
  const rowIdx = findRowById(ss, id);
  if (rowIdx < 0) return { ok: false, error: "Aviso no encontrado" };
  // Soft-delete: marcar activo=false
  ss.getRange(rowIdx, 6).setValue(false);
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════
//  JUNTAS Y ACUERDOS
// ════════════════════════════════════════════════════════════════
// Columnas: id | fecha | tipo | tema | acuerdos | responsable | estado | autor

function getJuntas() {
  return sheetData(TAB.JUNTAS)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function saveJunta({ id, fecha, tipo, tema, acuerdos, responsable, estado, autor, token }) {
  requireEncargado(token);
  const ss = getSheet(TAB.JUNTAS);

  if (id) {
    const rowIdx = findRowById(ss, id);
    if (rowIdx < 0) return { ok: false, error: "Junta no encontrada" };
    ss.getRange(rowIdx, 1, 1, 8).setValues([[id, fecha, tipo, tema, acuerdos, responsable, estado, autor]]);
  } else {
    const newId = "jt_" + Date.now();
    ss.appendRow([newId, fecha, tipo, tema, acuerdos, responsable, estado || "pendiente", autor]);
    id = newId;
  }
  return { ok: true, id };
}

// ════════════════════════════════════════════════════════════════
//  ENTREGAS SEMANALES
// ════════════════════════════════════════════════════════════════
// Columnas: id | semana | sucursal | ventas | incidencias | horarios | estado | ts

function getEntregas(semana) {
  const rows = sheetData(TAB.ENTREGAS);
  return semana ? rows.filter(r => String(r.semana) === String(semana)) : rows;
}

function saveEntrega({ semana, sucursal, ventas, incidencias, horarios, token }) {
  requireEncargado(token);
  const ss   = getSheet(TAB.ENTREGAS);
  const rows = sheetData(TAB.ENTREGAS);
  const existing = rows.find(r =>
    String(r.semana) === String(semana) &&
    String(r.sucursal) === String(sucursal)
  );

  const ts = new Date().toISOString();
  if (existing) {
    const rowIdx = findRowById(ss, existing.id);
    ss.getRange(rowIdx, 1, 1, 8).setValues([[existing.id, semana, sucursal, ventas, incidencias, horarios, "entregado", ts]]);
    return { ok: true, id: existing.id };
  } else {
    const newId = "en_" + Date.now();
    ss.appendRow([newId, semana, sucursal, ventas, incidencias, horarios, "entregado", ts]);
    return { ok: true, id: newId };
  }
}

// ════════════════════════════════════════════════════════════════
//  SUCURSALES
// ════════════════════════════════════════════════════════════════
// Columnas: id | nombre | encargado | correo | drive_url | activa

function getSucursales() {
  return sheetData(TAB.SUCURSALES).filter(r => String(r.activa).toLowerCase() !== "false");
}

// ════════════════════════════════════════════════════════════════
//  UTILIDADES INTERNAS
// ════════════════════════════════════════════════════════════════

function getSpreadsheet() {
  if (!SHEET_ID) throw new Error("SHEET_ID no configurado en Code.gs");
  return SpreadsheetApp.openById(SHEET_ID);
}

function getSheet(name) {
  const ss    = getSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("Pestaña no encontrada: " + name);
  return sheet;
}

// Convierte filas de una pestaña a array de objetos usando fila 1 como headers
function sheetData(name) {
  const sheet  = getSheet(name);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim().toLowerCase());
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

// Busca la fila (1-indexed) con id en columna A
function findRowById(sheet, id) {
  const col = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().flat();
  const idx = col.indexOf(id);
  return idx >= 0 ? idx + 1 : -1;
}

// Roles con permisos de publicación / escritura
const LEADERSHIP_ROLES = ["regional", "zonal", "analista", "admin"];
const ENCARGADO_ROLES  = [...LEADERSHIP_ROLES, "encargado"];

// Validación simple de rol usando correo como token (en prod usar JWT o session)
// El portal envía token = correo del usuario logueado
function requireRole(token, allowedRoles) {
  if (!token) throw new Error("No autorizado");
  const rows = sheetData(TAB.USUARIOS);
  const user = rows.find(r => (r.correo || "").toLowerCase() === String(token).toLowerCase());
  if (!user) throw new Error("Usuario no encontrado");
  if (!allowedRoles.includes(user.rol)) throw new Error("Sin permiso para esta acción — rol: " + user.rol);
}

// Helper: requiere cualquier rol de liderazgo
function requireLeadership(token) { requireRole(token, LEADERSHIP_ROLES); }
// Helper: requiere encargado o superior
function requireEncargado(token)  { requireRole(token, ENCARGADO_ROLES); }

// Respuesta con CORS habilitado
function resp(payload, status) {
  const output = ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ════════════════════════════════════════════════════════════════
//  SETUP INICIAL — corre UNA VEZ desde el editor de Apps Script
// ════════════════════════════════════════════════════════════════

function setupHojaInicial() {
  const ss = getSpreadsheet();

  const tabs = {
    [TAB.USUARIOS]:   ["correo","password","nombre","rol","sucursal"],
    [TAB.AVISOS]:     ["id","tag","fecha","autor","texto","activo"],
    [TAB.JUNTAS]:     ["id","fecha","tipo","tema","acuerdos","responsable","estado","autor"],
    [TAB.ENTREGAS]:   ["id","semana","sucursal","ventas","incidencias","horarios","estado","ts"],
    [TAB.SUCURSALES]: ["id","nombre","encargado","correo","drive_url","activa"],
  };

  Object.entries(tabs).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // Solo escribe headers si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground("#3D5A47")
        .setFontColor("#F5EFE6")
        .setFontWeight("bold");
    }
  });

  // Usuarios iniciales
  const usuariosSheet = ss.getSheetByName(TAB.USUARIOS);
  if (usuariosSheet.getLastRow() === 1) {
    usuariosSheet.appendRow(["oliver@lcp.mx",  "lcp2026", "Oliver González",  "regional", "Regional GDL"]);
    usuariosSheet.appendRow(["ibrahim@lcp.mx", "lcp2026", "Saúl Ibrahim",     "analista", "Regional GDL"]);
    // Agrega aquí a los gerentes de zona y encargados:
    // usuariosSheet.appendRow(["gerente1@correo.mx", "pass", "Nombre", "zonal", "Zona Norte"]);
    // usuariosSheet.appendRow(["encargado1@correo.mx", "pass", "Nombre", "encargado", "Andares"]);
  }

  // Sucursales GDL de ejemplo
  const sucSheet = ss.getSheetByName(TAB.SUCURSALES);
  if (sucSheet.getLastRow() === 1) {
    const sucs = [
      ["suc_1","Arcos Vallarta","—","enc1@lcp.mx","","TRUE"],
      ["suc_2","Andares","—","enc2@lcp.mx","","TRUE"],
      ["suc_3","Punto Sao Paulo","—","enc3@lcp.mx","","TRUE"],
      ["suc_4","Gran Plaza","—","enc4@lcp.mx","","TRUE"],
      ["suc_5","Galerías","—","enc5@lcp.mx","","TRUE"],
      ["suc_6","Plaza del Sol","—","enc6@lcp.mx","","TRUE"],
      ["suc_7","Patria","—","enc7@lcp.mx","","TRUE"],
      ["suc_8","Midtown","—","enc8@lcp.mx","","TRUE"],
      ["suc_9","Centro Magno","—","enc9@lcp.mx","","TRUE"],
    ];
    sucs.forEach(r => sucSheet.appendRow(r));
  }

  Logger.log("✅ Setup completado. Abre el Sheet para revisar las pestañas.");
}

// ════════════════════════════════════════════════════════════════
//  UPLOAD DE ARCHIVOS (Drive API)
// ════════════════════════════════════════════════════════════════

function uploadFile(payload) {
  validarSesion(payload.token, ["gerente", "regional", "admin", "zonal"]);
  
  if (!DRIVE_FOLDER_ID) {
    throw new Error("El sistema no tiene configurado el ID de Drive (DRIVE_FOLDER_ID en Code.gs).");
  }

  const base64Data = payload.fileData.split(',')[1]; 
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), payload.mimeType, payload.fileName);
  
  // 1. Encontrar o crear la carpeta de la sucursal dentro de la carpeta principal
  const mainFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const folders = mainFolder.getFoldersByName(payload.sucursal);
  const sucFolder = folders.hasNext() ? folders.next() : mainFolder.createFolder(payload.sucursal);
  
  // 2. Usar Advanced Drive API para insertar y convertir (Requiere habilitar Drive API en el editor)
  let file;
  try {
    const resource = {
      title: payload.fileName,
      mimeType: MimeType.GOOGLE_SHEETS,
      parents: [{ id: sucFolder.getId() }]
    };
    // Requiere Drive API v2 activada en Servicios
    file = Drive.Files.insert(resource, blob, { convert: true });
    
    // Aquí (futuro) extraemos los datos de SpreadsheetApp.openById(file.id);
    // TODO: Necesitamos las coordenadas exactas de las celdas (Meta, Venta, TRX)
    
  } catch (err) {
    // Si falla Drive API (por no estar habilitado), hacemos fallback a DriveApp normal
    const fallbackFile = sucFolder.createFile(blob);
    return { 
      ok: true, 
      fileId: fallbackFile.getId(), 
      url: fallbackFile.getUrl(),
      warning: "Drive API avanzado no habilitado. El archivo se guardó como .xlsx crudo y no se auto-consolidó. " + err.message
    };
  }

  // Si llegamos aquí, el archivo se convirtió a Sheet exitosamente
  return {
    ok: true,
    fileId: file.id,
    url: file.alternateLink
  };
}
