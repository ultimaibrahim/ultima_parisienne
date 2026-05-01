# Apps Script Setup — Portal LCP GDL v0.4.0

Guía paso-a-paso para desplegar el backend (`Code.gs`) en Google Apps Script y conectarlo al portal.

---

## 1. Crear el proyecto Apps Script

1. Abre **[script.google.com](https://script.google.com)**
2. **+ New project** → renombra a `Portal GDL Backend`
3. Borra el contenido por defecto de `Code.gs`
4. Pega TODO el contenido de `/app/portal/Code.gs`
5. Ctrl/Cmd + S

## 2. Vincular con la Google Sheet

El `SHEET_ID` ya está hardcodeado en el archivo:
```js
const SHEET_ID = '1v_ggWvAsfwNlQAQiqo1jjH1g7c6-naG_hVUsSsq6XDY';
```

Si tu Sheet es otra, edita esa constante.

## 3. Crear pestañas y sembrar usuarios — RUN UNA VEZ

1. En el dropdown de funciones, selecciona `setupSheetStructure`
2. Click ▶ **Run**
3. Te pedirá permisos: autoriza con la cuenta `gsaulibrahim@gmail.com`
4. Verás en **Execution log**: `✅ Setup completo. Pestañas listas.`

Esto crea las 7 pestañas (`Usuarios`, `Avisos`, `HistoricoAvisos`, `Checklist`, `Consolidado`, `Lecturas`, `Config`) y siembra 4 usuarios:
- `oliver@lcp.mx` / `lcp2026` — regional
- `ibrahim@lcp.mx` / `lcp2026` — analista
- `evelyn@lcp.mx` / `lcp2026` — gerente Plaza Patria
- `carlos@lcp.mx` / `lcp2026` — gerente Midtown

Las contraseñas se guardan **hasheadas SHA-256 + sal** (constante `SALT` en el código). Cambia `SALT` por algo único antes de producción real.

## 4. Desplegar como Web App

1. Click en ▶ **Deploy** (esquina superior derecha) → **New deployment**
2. ⚙ icon junto a "Select type" → **Web app**
3. Configuración:
   - **Description**: `Portal GDL Backend v0.4.0`
   - **Execute as**: `Me (gsaulibrahim@gmail.com)`
   - **Who has access**: `Anyone`
4. **Deploy**
5. **Authorize access** → autoriza con tu cuenta
6. Copia la **Web app URL** — algo como `https://script.google.com/macros/s/AKfycb.../exec`

## 5. Conectar el portal

Edita `/app/portal/index.html`, línea ~1036:
```js
const API_URL = ''; // ← pega aquí la URL del Web app
```
Queda así:
```js
const API_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

Sube `index.html` al repo `portal-lcp-gdl`. A partir de ese momento el portal opera contra la Sheet real.

## 6. Activar triggers automáticos (opcional pero recomendado)

1. En el editor de Apps Script, dropdown de funciones → `setupTriggers`
2. Click ▶ **Run**
3. Autoriza permisos extra (Drive + Mail)

Esto activa 3 triggers:
- **Newsletter diaria a las 8am**: `sendDailyNewsletter` envía resumen de avisos nuevos
- **Sync consolidado cada 2h**: `syncConsolidadoFromDrive` revisa carpetas de ventas y marca entregas
- **Auto-archivado a la 1am**: `autoArchivarAvisos` mueve al histórico los avisos cuya `fechaBorrado` ya pasó

## 7. Configurar destinatarios del newsletter

En la pestaña `Config` de la Sheet:

| key | value |
|---|---|
| `newsletter_recipients` | `oliver@lcp.mx,gerente1@lcp.mx,gerente2@lcp.mx,...` |
| `newsletter_enabled` | `true` |
| `newsletter_last_run` | `0` |

Modifica `newsletter_recipients` con los correos reales separados por coma. Para apagar el newsletter sin borrar, pon `newsletter_enabled = false`.

## 8. Probar manualmente

Desde el editor de Apps Script puedes correr:
- `sendDailyNewsletter` — envía el correo ahora mismo
- `syncConsolidadoFromDrive` — fuerza el escaneo de Drive
- `autoArchivarAvisos` — fuerza el archivado de avisos vencidos
- `resetPassword('correo', 'nuevaPass')` — cambia password de un usuario

---

## Estructura del archivo de ventas para sync automático

Para que `syncConsolidadoFromDrive` lea métricas, los gerentes deben subir el reporte como **Google Sheet** (no .xlsx). Convención de celdas en la primera hoja:

- `B2` → meta semanal
- `B3` → venta neta
- `B4` → TRX

Si el archivo es `.xlsx`, solo se marca como entregado en checklist (no se parsean métricas). Si quieres parseo de `.xlsx`, hay que habilitar **Drive API Advanced Service** y usar `Drive.Files.copy({convert:true})` — más complejo, lo dejamos para después si lo necesitan.

Convención de nombre de archivo (case-insensitive):
```
VentaSemanal_AND_ABR2026_S3.xlsx
                  ^^^^^^^   ^^
                  yearmonth semana
```

El trigger reconoce el archivo si el nombre contiene **el código de la sucursal** y el patrón de **semana** (`_s3` o `s3` o `semana3`).

---

## Troubleshooting

**Error: "Falta pestaña: Usuarios"**  
→ No corriste `setupSheetStructure`. Ejecútalo desde el editor.

**Login responde "Usuario no encontrado"**  
→ Verifica que el correo está en la pestaña `Usuarios` con `activo = TRUE` (mayúsculas no importan).

**Login responde "Contraseña incorrecta" para un usuario válido**  
→ El hash de tu Sheet no coincide. Corre `resetPassword('correo@lcp.mx', 'nueva')` desde el editor.

**Newsletter no llega**  
→ 1) `newsletter_enabled = true` en Config. 2) `newsletter_recipients` con correos reales. 3) Cuota diaria de MailApp en cuenta gratuita = 100 correos/día. 4) Revisa `View → Executions` del Apps Script para ver errores.

**El portal sigue en modo demo aunque tengo API_URL**  
→ Verifica en el browser la consola: si CORS falla o la URL responde 401, el portal cae a demo. La URL debe terminar en `/exec` (no `/dev`).

---

## Notas de seguridad

- Las contraseñas viven hasheadas pero **el SALT está visible en el código** del Web app desplegado como "Anyone access". Para mayor seguridad, mueve `SALT` a `PropertiesService.getScriptProperties()`.
- Si en algún momento expones esto fuera de la región, considera migrar a Google Workspace SSO (cuentas `@lcp.mx` ya autenticadas vía Google) en lugar de password manual.
