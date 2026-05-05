# Portal Operativo LCP — Documento de Handoff v2.0

**La Crêpe Parisienne · Grupo MYT / Corporativo Alancar**  
Última actualización: Mayo 2026 · Saúl Ibrahim García

---

## INSTRUCCIONES PARA EL ASISTENTE IA

**Lee este documento completo antes de escribir una sola línea de código.**

### Cómo trabajar con Ibrahim

- **Autonomía total cuando se la dan:** Ibrahim dice cosas como *"te doy total libertinaje"* o *"ejecuta todo lo que puedas"*. Eso significa actuar sin pedir permiso para cada cambio. Proponer, ejecutar y reportar.
- **Proponer antes de tareas grandes:** Para refactorizaciones o cambios de arquitectura, presentar un plan primero y esperar aprobación explícita. Para bugs y fixes directos, corregir sin preguntar.
- **Ser directo y técnico:** No rodear las respuestas. Si algo está mal, decirlo. Si algo es un riesgo, nombrarlo sin suavizarlo.
- **No inventar datos:** Nunca hardcodear nombres, sucursales, correos o IDs que no estén ya en el código. Verificar contra el source antes de modificar.
- **Rol de QA proactivo:** Ibrahim espera que el asistente detecte bugs que él no vio. Se le llama "programador experto" en el prompt. Actuar como tal.
- **Tono:** Técnico, concreto, sin relleno. Las respuestas largas van en documentos/artefactos, no en el chat.
- **Changelog obligatorio:** Con cada entrega actualizar `const VERSION` en `js/config.js` y agregar entrada al changelog (sección 9 de este documento).

### Reglas de código

- No modificar paleta ni tipografía salvo petición explícita.
- El modo demo (fallback a `USUARIOS_LOCALES` y `AVISOS_DEFAULT`) **siempre debe conservarse.**
- No agregar dependencias nuevas sin preguntar.
- Antes de cada cambio importante verificar que el archivo tiene el contenido esperado (puede haber cambiado desde la última sesión).

---

## 1. Qué es este proyecto

El Portal Operativo es una **herramienta interna de inteligencia operativa** para centralizar la operación de las sucursales de La Crêpe Parisienne. Reemplaza la comunicación dispersa en WhatsApp y consolida reportes, avisos, minutas y métricas en un solo lugar.

**No es un ERP.** Es una "Custom Business App" / Intranet ligera. El punto de comparación correcto es una intranet corporativa sencilla, no SAP.

### Personas clave

| Rol | Nombre | Correo |
|---|---|---|
| Desarrollador / dueño técnico | Saúl Ibrahim García | ultima.ibrahim@proton.me |
| Regional Manager GDL (cliente principal) | Oliver González | oliver.gonzalez@lacrepeparisienne.com |
| Brand Director (sobre Oliver, sin acceso directo) | Amaya | — |
| Corporativo | Grupo MYT / Grupo Corporativo Alancar | — |

Ibrahim trabaja como barista en Andares (fusionada con Mercado Andares operativamente) y construyó esto por iniciativa propia para resolver el caos operativo. Oliver es el usuario de poder que debe quedar impresionado.

---

## 2. Stack Técnico actual — v0.7.0

### Arquitectura

SPA (Single Page Application) sin framework. HTML/CSS/JS puro hosteado en **GitHub Pages**. Backend exclusivamente en **Google Apps Script**. Sin Node.js, Firebase, Vercel ni nada externo.

> Esta arquitectura fue una decisión deliberada: arrancar gratis, sin servidores, sin deploys complicados. Escala bien hasta ~50-100 usuarios concurrentes antes de necesitar migración.

| Capa | Tecnología |
|---|---|
| Frontend | HTML/CSS/JS modular (4 módulos + app.js) |
| Hosting | GitHub Pages — repo: `ultimaibrahim/ultima_parisienne` |
| Backend | Google Apps Script como Web App pública |
| Base de datos | Google Sheets (PortalGDL_db) |
| Storage | Google Drive — carpetas por sucursal |
| Charts | Chart.js 4.4.0 via CDN (jsdelivr) |
| Fonts | DM Serif Display + DM Sans (Google Fonts) |
| PWA | Service Worker (`sw.js`) + `manifest.json` — funciona offline |
| Versión actual | `v0.7.0` |

### Estructura de archivos (post-refactor Fase 1)

```
ultima_parisienne/
├── index.html          ← Punto de entrada. Carga pages/ y luego los módulos JS en orden.
├── manifest.json       ← PWA config
├── sw.js               ← Service Worker (cache-first para assets)
├── Code.gs             ← Backend completo (Google Apps Script)
├── PORTAL_GDL_HANDOFF.md
│
├── js/
│   ├── config.js       ← FUENTE DE VERDAD ÚNICA: regiones, sucursales, Drive IDs, usuarios, keys LS
│   ├── api.js          ← apiCall() y apiGet() — lee URL del backend de la región activa
│   ├── auth.js         ← Login, sesión, roles, aplicarRoles(), helpers (escapeHtml, etc.)
│   ├── ui.js           ← Dark mode, toast, notifs, routing (showSection), onboarding, fecha
│   └── app.js          ← Lógica de negocio: avisos, dashboard, sucursales, juntas, tabla
│
├── css/
│   └── style.css       ← ~58KB. Paleta de marca, glassmorphism, dark mode, responsive.
│
└── pages/              ← HTML de cada sección (se cargan dinámicamente en index.html)
    ├── inicio.html
    ├── dashboard.html
    ├── sucursales.html
    ├── regional.html
    ├── juntas.html
    ├── formatos.html
    ├── admin-section.html
    └── about.html
```

**El orden de carga de módulos en `index.html` es crítico:**  
`config.js` → `api.js` → `auth.js` → `ui.js` → `app.js`

Cada módulo depende del anterior. Si se cambia el orden, el portal se rompe.

---

## 3. Google Infrastructure

### Apps Script (Backend)

| Item | Valor |
|---|---|
| Web App URL (GDL) | `https://script.google.com/macros/s/AKfycbwnfhrIGKaAy3LuRdKx7J_QIRH-GelnbazmpoEeaxmbabMcEW9Ue3BcM5X1nCVd0euZ/exec` |
| Ejecutar como | Cuenta propietaria del Sheet |
| Acceso | Cualquier persona |

> **Regla de oro de Apps Script:** Las funciones `doPost`, `uploadFile`, `doLogin` etc. son **endpoints**. Solo se ejecutan desde la web app, nunca desde el botón "Ejecutar" del editor. Si se les da "Ejecutar" directamente, dan `TypeError: Cannot destructure property X of undefined` porque no reciben payload. Las únicas funciones que se pueden ejecutar desde el editor son las que no reciben parámetros: `setupHojaInicial`, `generateHashes`.

### Endpoints GET

| action | descripción |
|---|---|
| `ping` | Retorna `{ok:true}` para verificar conectividad |
| `avisos` | Devuelve avisos activos |
| `getConsolidado` | Filtra por `&semana=XXXX` |
| `getSemanas` | Lista semanas disponibles |
| `verifySession` | Verifica token: `&token=XXX` |
| `getLecturas` | Lecturas de avisos críticos |
| `juntas` | Minutas de juntas |

### Endpoints POST

| action | descripción |
|---|---|
| `login` | correo + password → `{ok, user, token}` |
| `saveAviso` | Crea o actualiza aviso |
| `deleteAviso` | Soft delete |
| `saveJunta` | Crea o actualiza minuta |
| `setEntrega` | Marca entrega semanal |
| `markLeido` | Registra lectura crítica |
| `uploadFile` | Sube archivo base64 a Drive |
| `saveConsolidado` | Guarda datos de la tabla regional |
| `sendNewsletterNow` | Dispara email a gerentes |

### Sheet principal (PortalGDL_db)

**Sheet ID:** `1tje-3xwR_MtCnoeAcTxV8_LbHjyM03NsH8tRlwdPySA`

| Pestaña | Columnas |
|---|---|
| Avisos | id · tag · fecha · autor · texto · fechalimite · fechaborrado · critico · creado |
| Consolidado | semana · sucursal · meta · venta_neta · trx · entrego · timestamp |
| Juntas | id · fecha · tipo · tema · acuerdos · responsable · estado · autor |
| Lecturas | avisoId · userCorreo · userNombre · userSucursal · timestamp |

> La pestaña **Usuarios** fue eliminada del Sheet. Los usuarios ahora viven en `USERS_DB` dentro de `Code.gs` (con hashes SHA-256) y en `USUARIOS_LOCALES` en `config.js` (fallback offline con passwords en texto plano — **nunca subir a repo público**).

---

## 4. Arquitectura Multi-Región (Fase 2 — implementada)

El portal está preparado para escalar a CDMX y MTY. **No hay que reescribir nada.** Solo activar en `config.js`:

```javascript
// En js/config.js:
REGIONES = {
  GDL:  { status: 'activa',    apiUrl: '...', sheetId: '...' },  // ← ACTIVO
  CDMX: { status: 'pendiente', apiUrl: null,  sheetId: null  },  // ← Solo rellenar y cambiar a 'activa'
  MTY:  { status: 'pendiente', apiUrl: null,  sheetId: null  }   // ← Solo rellenar y cambiar a 'activa'
}
```

Para activar una región nueva:
1. Cambiar `status: 'pendiente'` → `'activa'`
2. Pegar `apiUrl` (deploy del Apps Script de esa región)
3. Pegar `sheetId` del Sheet de esa región
4. Agregar sucursales en `SUCURSALES_POR_REGION.CDMX`
5. Agregar Drive IDs en `SUCURSAL_DATA_POR_REGION.CDMX`
6. Clonar `Code.gs` con los IDs correspondientes y hacer nuevo deploy

El `api.js` lee el URL del backend de la región del usuario activo automáticamente.

---

## 5. Las 9 Sucursales GDL

| Sucursal | Código | Notas |
|---|---|---|
| Andares | AND | Sede de Ibrahim. Fusionada operativamente con MAN. |
| Mercado Andares | MAN | Fusionada con AND. |
| Via Viva | VIV | |
| Midtown | MID | |
| La Perla | PER | |
| Plaza Patria | PAT | |
| Santa Anita | ANI | |
| Galerías Guadalajara | GAL | |
| Forum Tlaquepaque | FOR | |

Los Drive IDs completos (root, ventas, inv, inc, hor) están en `SUCURSAL_DATA_POR_REGION.GDL` en `config.js`. **No duplicarlos en otro lugar.**

---

## 6. Sistema de Auth

### Flujo de login
1. `doLogin()` en `auth.js` intenta `apiCall('login', {correo, password})` contra Apps Script.
2. Si falla o no hay conexión → fallback a `USUARIOS_LOCALES` en `config.js`.
3. Se guarda en `localStorage` con clave `lcp_gdl_session_v1`, expira en 7 días.
4. Al iniciar sesión, `activarRegion(user.region)` actualiza `SUCURSALES` y `SUCURSAL_DATA` globales.

### Roles

| Rol | Permisos |
|---|---|
| `admin` | Todo. Ve todas las sucursales. |
| `regional` | Tab admin, editar avisos, checklist, ve todas las sucursales. |
| `analista` | Igual que regional. Sucursal propia destacada en el grid. |
| `zonal` | Igual que regional. **Sin restricción de zona implementada aún.** |
| `gerente` | Solo ve "Mi Sucursal". No puede editar avisos ni ver admin. Tabla consolidado en modo lectura. |

`LEADERSHIP_ROLES = ['admin', 'analista', 'regional', 'zonal']`

### Autenticación en Apps Script (Code.gs)

- `USERS_DB` contiene hashes SHA-256 de contraseñas.
- `generateHashes()` (ejecutar desde editor) genera los hashes para actualizar `USERS_DB`.
- Sesiones: tokens UUID almacenados en `PropertiesService`, expiran en 7 días.
- La contraseña genérica de todos los gerentes (`grupomyt2025`) es una decisión deliberada y aceptada. Si se despide a un gerente, se cambia la contraseña compartida.

---

## 7. Paleta y Tipografía — NO MODIFICAR

```css
--verde:       #3D5A47
--verde-deep:  #2a3f32
--sage:        #7A9E8A
--crema:       #F5EFE6
--negro:       #1A1A1A
--amber:       #c97d10
--rojo-soft:   #c62828
```

- **Títulos:** `DM Serif Display`
- **Cuerpo:** `DM Sans`
- Estética: glassmorphism suave, dark mode, micro-animaciones, diseño premium.

---

## 8. Features implementados — v0.7.0

| Feature | Estado |
|---|---|
| Onboarding 3 pasos | ✓ |
| Login servidor + fallback offline | ✓ |
| Sesión 7 días con token UUID | ✓ |
| Roles diferenciados en DOM | ✓ |
| Dark mode persistente | ✓ |
| Campana de notificaciones in-browser | ✓ |
| Carrusel de avisos con autoplay + progress bar | ✓ |
| Avisos críticos + confirmación de lectura | ✓ |
| Editor CRUD de avisos (modal) | ✓ |
| Histórico de avisos archivados | ✓ |
| Checklist de entregas semanal | ✓ |
| Mi Sucursal (vista gerente) | ✓ |
| Upload de archivos a Drive (base64) | ✓ |
| Sucursales grid con búsqueda (vista leadership) | ✓ |
| Consolidado regional editable inline | ✓ |
| Dashboard: 5 KPIs, 3 gráficas, heatmap, ranking | ✓ |
| Gráfica de tendencia con datos reales del consolidado | ✓ |
| Juntas y Acuerdos con CRUD | ✓ |
| Formatos descargables | ✓ |
| Panel Admin (avisos, lecturas, newsletter, usuarios) | ✓ |
| Newsletter manual por email | ✓ |
| Deep linking por hash (`#dashboard`, etc.) | ✓ |
| Mobile nav (bottom bar) | ✓ |
| Badge de conectividad en login | ✓ |
| Cache de avisos con TTL 5 minutos | ✓ |
| PWA: Service Worker + manifest | ✓ |
| **Modularización JS (config/api/auth/ui/app)** | ✓ v0.7.0 |
| **Arquitectura multi-región preparada** | ✓ v0.7.0 |
| `SUCURSALES.length` dinámico (no hardcoded `9`) | ✓ v0.7.0 |

---

## 9. Bugs conocidos y deuda técnica

### 🔴 Críticos

| # | Bug | Fix |
|---|---|---|
| 1 | Passwords en `USUARIOS_LOCALES` (config.js) visibles en DevTools | Mover auth completamente al servidor. Mientras tanto: **hacer el repo privado en GitHub.** |
| 2 | IDs de Drive expuestos en repo público | Mismo fix: repo privado. |
| 3 | Token de sesión = correo del usuario (no firma real) | Fase 3: JWT. Por ahora el Apps Script valida tokens UUID via PropertiesService. |

### 🟡 Medios

| # | Bug | Fix |
|---|---|---|
| 4 | Rol `zonal` sin restricción de zona | Definir qué sucursales ve cada zonal o eliminar el rol. |
| 5 | `irAMiSucursal()` no llama `setMobileTab()` | Agregar `setMobileTab('mn-sucursales')` — 1 línea. |
| 6 | Doble fetch de juntas al hacer login | Agregar flag `juntasCargadas`. |
| 7 | `execCommand('copy')` deprecado en `fbCopy()` | Reemplazar con `navigator.clipboard` (ya es primera opción, el fallback casi no se ejecuta). |
| 8 | KPI cobertura usa solo lecturas locales | Conectar a `getLecturas` del Apps Script. |

### 🔵 Deuda técnica

| # | Item |
|---|---|
| 9 | WhatsApp y correos placeholder en About (`wa.me/523300000000`) — actualizar con reales. |
| 10 | Color `#2980b9` en KPI TRX no está en la paleta. Cambiar a `--sage`. |
| 11 | El `rc()` tiene debounce de 400ms — funciona, pero podría bajar a 300ms. |

---

## 10. Roadmap

### Fase 3 — Pendiente (no empezar sin discutirlo)

La arquitectura actual (Apps Script + Sheets) soporta bien hasta ~50 gerentes. Cuando el negocio crezca más allá de eso, o se necesite tiempo real real:

- **JWT** para sesiones firmadas criptográficamente.
- **Firebase / Supabase** como base de datos real (reemplaza Google Sheets).
- El frontend NO cambia. Solo se reemplaza `Code.gs` por un servidor real y se actualizan las URLs en `config.js`.

### Próximas features (en orden de valor)

| Feature | Descripción |
|---|---|
| Dashboard por gerente | Vista filtrada — solo KPIs de su sucursal. Hoy el gerente ve el dashboard completo vacío. |
| Consolidado auto-poblado | Apps Script parsea nombre del Excel subido (`VentaSemanal_AND_S3.xlsx`) y actualiza el consolidado automáticamente. Elimina el llenado manual. |
| Newsletter automático | Trigger en Apps Script al crear aviso crítico o minuta — envía email automáticamente. El endpoint ya existe, falta el trigger. |
| Historial semanal en dashboard | Dropdown para ver consolidados de semanas anteriores. El Sheet ya guarda la columna `semana`. |
| CRUD de usuarios desde el portal | Agregar, desactivar y cambiar contraseña desde la sección Admin. |
| Formulario de incidencias | Reporte directo desde Mi Sucursal (merma, ausentismo, incidente) → se guarda en Drive. |
| Rol Zonal funcional | Mapear cada sucursal a una zona y restringir visibilidad. |
| Push notifications | SW ya instalado — agregar `push` event para avisos críticos. |
| Activar CDMX o MTY | Ver sección 4 — solo rellenar los valores en `config.js`. |

---

## 11. Changelog

| Versión | Fecha | Cambios |
|---|---|---|
| v0.1.0 | Abr 28 | Primer HTML estático. Carrusel, tabla consolidado, links Drive. |
| v0.2.0 | Abr 28 | Formatos, dark mode, responsive. |
| v0.3.0 | Abr 28 | Onboarding, About, changelog debug, stat cards. |
| v0.4.0 | Abr 29 | Login, roles en DOM, admin de avisos, checklist, user chip. |
| v0.4.1 | Abr 29 | Code.gs: login, getAvisos, saveAviso, deleteAviso, markLeido, newsletter. |
| v0.5.0 | Abr 29 | Dashboard (5 KPIs, gráficas, heatmap, ranking), notifs, bottom nav, juntas, avisos críticos. |
| v0.5.1 | May 01 | Fixes: persistencia consolidado, seeds críticos, heatmap con lecturas reales. |
| v0.6.0 | May 01 | Debounce consolidado, empty states dashboard, indicador última actualización. |
| v0.6.1 | May 02 | Code.gs v2.0: USERS_DB con SHA-256, tokens UUID, sendNewsletterNow, setupHojaInicial. Sheet migrado a PortalGDL_db (`1tje-3xwR...`). PWA: sw.js + manifest. Badge conectividad en login. Cache TTL avisos 5min. Gráfica tendencia con datos reales. |
| v0.7.0 | May 03 | **Modularización JS:** config.js / api.js / auth.js / ui.js / app.js. **Multi-región:** REGIONES con GDL activa, CDMX y MTY preparadas. SUCURSALES.length dinámico. `api.js` lee URL de la región activa. Título genérico "Portal Operativo LCP". |

---

## 12. Contexto de decisiones tomadas

Estas decisiones ya se tomaron y no se deben revertir sin discutirlo:

| Decisión | Razonamiento |
|---|---|
| Usuarios NO en Google Sheets | Se eliminó la pestaña Usuarios del Sheet. Vivir en `Code.gs` (USERS_DB) es más seguro y rápido. El Sheet solo guarda datos operativos (avisos, consolidado, juntas, lecturas). |
| Todos los gerentes comparten contraseña | Decisión pragmática para la fase Beta. El riesgo es la suplantación entre gerentes — aceptable dado que son equipo interno y de confianza. |
| No usar `DEMO_USERS` = nombre antiguo | Renombrado a `USUARIOS_LOCALES` en v0.7.0. El alias `DEMO_USERS` existe para compatibilidad pero no se debe usar en código nuevo. |
| GitHub Pages para hosting | Gratuito, sin deploys, funciona con el modelo serverless. La PWA + SW resuelve la disponibilidad offline. |
| Apps Script como API | Sin costos de servidor, autenticado con la cuenta Google del propietario, acceso nativo a Drive y Sheets. Límite real: 30 ejecuciones concurrentes. Suficiente para las 9-50 sucursales actuales. |
| No usar módulos ES (`import/export`) | GitHub Pages sirve archivos estáticos. Los módulos ES requieren `type="module"` y cambian el scoping — romperían el patrón de globals que usa todo el código. Se optó por carga secuencial de scripts. |

---

*Portal Operativo LCP · La Crêpe Parisienne · Grupo MYT / Corporativo Alancar*  
*Actualizado: Mayo 2026 · v0.7.0*
