# Portal Operativo LCP — Documento de Handoff v3.0

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
- **Rol de QA proactivo:** Ibrahim espera que el asistente detecte bugs que él no vio. Actuar como programador experto senior.
- **Tono:** Técnico, concreto, sin relleno. Las respuestas largas van en documentos/artefactos, no en el chat.
- **Changelog obligatorio:** Con cada entrega actualizar `const VERSION` en `js/config.js` y agregar entrada al changelog (sección 11 de este documento).
- **Siempre pedir los archivos actuales antes de modificar.** Ibrahim trabaja con múltiples agentes (Claude, Kimi, OpenCode). El repo puede tener cambios que este agente no conoce. Nunca asumir que el código local es el más reciente.

### Reglas de código — LEER CON ATENCIÓN

- No modificar paleta ni tipografía salvo petición explícita.
- **El onboarding fue eliminado permanentemente en v0.8.2. No reintroducirlo bajo ninguna circunstancia.** No existe `initOnboarding()`, `cerrarOnboarding()` ni `nextOb()` en ningún archivo.
- **El modo demo/fallback offline (`USUARIOS_LOCALES`) fue eliminado en v0.8.2. No reintroducirlo.** Toda autenticación requiere conexión al backend de Apps Script.
- No agregar dependencias nuevas sin preguntar.
- Antes de cada cambio importante verificar que el archivo tiene el contenido esperado — puede haber cambiado por otro agente.
- Las `pages/` se cargan dinámicamente. Cambios de HTML en secciones van en `pages/nombre.html`, NO en `index.html`. La excepción es el login, que vive en `index.html`.

---

## 1. Qué es este proyecto

El Portal Operativo es una **herramienta interna de inteligencia operativa** para centralizar la operación de las sucursales de La Crêpe Parisienne. Reemplaza la comunicación dispersa en WhatsApp y consolida reportes, avisos, minutas y métricas en un solo lugar.

**No es un ERP.** Es una "Custom Business App" / Intranet ligera.

### Personas clave

| Rol | Nombre | Correo |
|---|---|---|
| Desarrollador / dueño técnico | Saúl Ibrahim García | ultima.ibrahim@proton.me |
| Regional Manager GDL (cliente principal) | Oliver González | oliver.gonzalez@lacrepeparisienne.com |
| Brand Director (sobre Oliver, sin acceso directo) | Amaya | — |
| Corporativo | Grupo MYT / Grupo Corporativo Alancar | — |

Ibrahim trabaja como barista en Andares (fusionada con Mercado Andares operativamente) y construyó esto por iniciativa propia para resolver el caos operativo. Oliver es el usuario de poder que debe quedar impresionado.

---

## 2. Stack Técnico — v0.8.2

### Arquitectura

SPA (Single Page Application) sin framework. HTML/CSS/JS puro hosteado en **GitHub Pages**. Backend exclusivamente en **Google Apps Script**. Sin Node.js, Firebase, Vercel ni nada externo.

| Capa | Tecnología |
|---|---|
| Frontend | HTML/CSS/JS modular (5 módulos) |
| Hosting | GitHub Pages — repo: `ultimaibrahim/ultima_parisienne` |
| Backend | Google Apps Script como Web App pública |
| Base de datos | Google Sheets (PortalGDL_db) |
| Storage | Google Drive — carpetas por sucursal |
| Charts | Chart.js 4.4.0 via CDN (jsdelivr) |
| Fonts | DM Serif Display + DM Sans (Google Fonts) |
| PWA | Service Worker (`sw.js`) v4 + `manifest.json` |
| Versión actual | `v0.8.2` |

### Estructura de archivos

```
ultima_parisienne/
├── index.html          ← Punto de entrada. Contiene login, modales y loader seguro.
├── manifest.json       ← PWA config
├── sw.js               ← Service Worker v4 — network-first + precache completo
├── Code.gs             ← Backend completo (Google Apps Script)
├── PORTAL_GDL_HANDOFF.md
│
├── js/
│   ├── config.js       ← FUENTE DE VERDAD ÚNICA: regiones, sucursales, Drive IDs, keys LS
│   ├── api.js          ← apiCall() y apiGet() — lee URL del backend de la región activa
│   ├── auth.js         ← Login, sesión, roles, aplicarRoles(), helpers (escapeHtml, etc.)
│   ├── ui.js           ← Dark mode, toast, notifs, routing (showSection), fecha. Kickoff: iniciarFlujoAuth()
│   └── app.js          ← Lógica de negocio: avisos, dashboard, sucursales, juntas, tabla
│
├── css/
│   └── style.css       ← Paleta de marca, glassmorphism, dark mode, responsive.
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

**Orden de carga crítico:** `config.js` → `api.js` → `auth.js` → `ui.js` → `app.js`

---

## 3. Loader seguro y flujo de autenticación (v0.8.2)

Este es el cambio arquitectural más importante. Leerlo antes de tocar `index.html` o `ui.js`.

### Flujo sin sesión (usuario nuevo o sesión expirada)

1. `index.html` carga → el loader verifica `localStorage` → no hay sesión válida
2. Carga solo `config.js → api.js → auth.js → ui.js`
3. **Las `pages/` y `app.js` NO se cargan** — el contenido del portal no existe en el DOM
4. `ui.js` llama `iniciarFlujoAuth()` al final — no hay sesión — el login ya está visible en el HTML
5. Usuario entra credenciales → `doLogin()` exitoso → llama `window._cargarPortalCompleto()`
6. `_cargarPortalCompleto()` hace fetch de las `pages/` y carga `app.js`
7. `aplicarRoles()` corre → portal visible y funcional

### Flujo con sesión activa

1. `index.html` carga → loader verifica `localStorage` → sesión válida
2. Carga `pages/` + todos los módulos en orden
3. `ui.js` llama `iniciarFlujoAuth()` → hay sesión → `aplicarRoles()` → portal directo

### Reglas críticas derivadas de esta arquitectura

- El login **no tiene `class="hidden"`** en el HTML. Arranca visible. `auth.js` lo oculta tras login exitoso.
- `iniciarFlujoAuth()` vive en `ui.js` y se llama al final de ese módulo. No moverlo a `app.js`.
- `app.js` no se carga hasta después del login cuando no hay sesión. Funciones como `aplicarJuntasRol`, `renderAvisos`, etc. no existen en runtime antes de eso.
- No existe onboarding. No hay `initOnboarding()` en ningún archivo.

---

## 4. Google Infrastructure

### Apps Script (Backend)

| Item | Valor |
|---|---|
| Web App URL (GDL) | `https://script.google.com/macros/s/AKfycbwnfhrIGKaAy3LuRdKx7J_QIRH-GelnbazmpoEeaxmbabMcEW9Ue3BcM5X1nCVd0euZ/exec` |
| Ejecutar como | Cuenta propietaria del Sheet |
| Acceso | Cualquier persona |

> **Regla de oro:** Los endpoints solo funcionan desde la web app. Ejecutarlos desde el editor da `TypeError` porque no reciben payload. Solo son ejecutables desde el editor: `setupHojaInicial`, `generateHashes`.

### Endpoints GET

| action | descripción |
|---|---|
| `ping` | Retorna `{ok:true}` |
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
| `saveAviso` | Crea o actualiza aviso — requiere `requireLeadership` |
| `deleteAviso` | Soft delete |
| `saveJunta` | Crea o actualiza minuta |
| `setEntrega` | Marca entrega semanal |
| `markLeido` | Registra lectura — guarda correo/nombre/sucursal real |
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

> La pestaña **Usuarios** no existe en el Sheet. Los usuarios viven en `USERS_DB` dentro de `Code.gs` con hashes SHA-256.

---

## 5. Arquitectura Multi-Región

GDL es la única región activa. Para activar CDMX o MTY:

1. Cambiar `status: 'pendiente'` → `'activa'` en `config.js`
2. Pegar `apiUrl` del deploy de Apps Script de esa región
3. Pegar `sheetId` del Sheet de esa región
4. Agregar sucursales en `SUCURSALES_POR_REGION.CDMX`
5. Agregar Drive IDs en `SUCURSAL_DATA_POR_REGION.CDMX`
6. Clonar `Code.gs` con los IDs correspondientes y hacer nuevo deploy

`api.js` lee el URL del backend de la región del usuario vía `getActiveApiUrl()`.

---

## 6. Las 9 Sucursales GDL

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

Los Drive IDs completos (root, ventas, inv, inc, hor) están en `SUCURSAL_DATA_POR_REGION.GDL` en `config.js`. No duplicarlos.

---

## 7. Sistema de Auth

### Flujo de login

1. `doLogin()` llama `apiCall('login', {correo, password})` contra Apps Script.
2. Si el servidor no responde → "Servidor no disponible. Intenta más tarde." Sin fallback.
3. Login exitoso → sesión en `localStorage` (`lcp_gdl_session_v1`), expira en 7 días.
4. Llama `window._cargarPortalCompleto()` si las páginas no estaban cargadas.
5. `activarRegion(user.region)` actualiza `SUCURSALES` y `SUCURSAL_DATA`.
6. `aplicarRoles()` renderiza el portal según el rol.

### Roles

| Rol | Permisos |
|---|---|
| `admin` | Todo. Ve todas las sucursales. |
| `regional` | Tab admin, editar avisos, checklist, ve todas las sucursales. |
| `analista` | Igual que regional. Sucursal propia destacada. |
| `zonal` | Igual que regional. Sin restricción de zona implementada aún. |
| `gerente` | Solo ve "Mi Sucursal". Sin edición de avisos ni acceso a admin. Consolidado en modo lectura. |

`LEADERSHIP_ROLES = ['admin', 'analista', 'regional', 'zonal']`

### Autenticación en Apps Script

- `USERS_DB` contiene hashes SHA-256.
- `generateHashes()` genera hashes para actualizar `USERS_DB` (ejecutar desde editor).
- Sesiones: tokens UUID en `PropertiesService`, expiran en 7 días.
- La contraseña genérica de gerentes (`grupomyt2025`) es decisión deliberada. Si se despide a un gerente, se cambia la contraseña.

---

## 8. Paleta y Tipografía — NO MODIFICAR

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

## 9. Features implementados — v0.8.2

| Feature | Estado |
|---|---|
| Login directo sin onboarding | ✓ v0.8.2 |
| Auth exclusivamente en servidor | ✓ v0.8.2 |
| Loader seguro — pages y app.js no cargan sin sesión | ✓ v0.8.2 |
| XSS fixes — `sanitizeHtml()` en avisos y juntas | ✓ v0.8.2 |
| SW v4 — precache completo de todos los assets | ✓ v0.8.2 |
| `markLeido` guarda correo/nombre/sucursal real | ✓ v0.8.1 |
| `saveAviso` restringido a leadership en backend | ✓ v0.7.1 |
| `hashMatch` sin bypass — solo `===` | ✓ v0.7.1 |
| Sesión 7 días con token UUID | ✓ |
| Roles diferenciados en DOM | ✓ |
| Dark mode persistente | ✓ |
| Campana de notificaciones in-browser | ✓ |
| Carrusel de avisos con autoplay + progress bar | ✓ |
| Avisos críticos + confirmación de lectura | ✓ |
| Editor CRUD de avisos (modal) — solo leadership | ✓ |
| Histórico de avisos archivados | ✓ |
| Checklist de entregas semanal | ✓ |
| Mi Sucursal (vista gerente) | ✓ |
| Upload de archivos a Drive (base64) | ✓ |
| Sucursales grid con búsqueda (vista leadership) | ✓ |
| Consolidado regional editable inline | ✓ |
| Dashboard: 5 KPIs, 3 gráficas, heatmap, ranking | ✓ |
| Gráfica de tendencia con datos reales | ✓ |
| Juntas y Acuerdos con CRUD | ✓ |
| Formatos descargables | ✓ |
| Panel Admin (avisos, lecturas, newsletter) | ✓ |
| Newsletter manual por email | ✓ |
| Deep linking por hash (`#dashboard`, etc.) | ✓ |
| Mobile nav (bottom bar) | ✓ |
| Arquitectura multi-región preparada | ✓ |

---

## 10. Bugs conocidos y deuda técnica

### 🟡 Medios

| # | Bug | Fix |
|---|---|---|
| 1 | Rol `zonal` sin restricción de zona | Definir qué sucursales ve cada zonal o eliminar el rol. |
| 2 | `irAMiSucursal()` no llama `setMobileTab()` | Agregar `setMobileTab('mn-sucursales')` — 1 línea. |
| 3 | Doble fetch de juntas al hacer login | Agregar flag `juntasCargadas`. |
| 4 | KPI cobertura usa solo lecturas locales | Conectar a `getLecturas` del Apps Script. |

### 🔵 Deuda técnica

| # | Item |
|---|---|
| 5 | WhatsApp y correos placeholder en About — actualizar con reales. |
| 6 | Color `#2980b9` en KPI TRX no está en la paleta. Cambiar a `--sage`. |
| 7 | `APPS_SCRIPT_SETUP.md` desactualizado — eliminar o reescribir. |
| 8 | Archivos huérfanos: `append_crud.js`, `append_html.js`, `refactor.py`, `split.py` — mover a `scripts/archive/` o eliminar. |

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
| v0.6.1 | May 02 | Code.gs v2.0: USERS_DB SHA-256, tokens UUID, sendNewsletterNow, setupHojaInicial. PWA. Badge conectividad. Cache TTL avisos 5min. |
| v0.7.0 | May 03 | Modularización JS. Multi-región preparada. `getActiveApiUrl()`. |
| v0.7.1 | May 05 | `hashMatch` sin bypass. `saveAviso` → `requireLeadership`. `markLeido` guarda usuario real. SW precache completo. Umbrales ticket en `config.js`. |
| v0.8.0 | May 05 | Dashboard filtrado por sucursal. Fix bypass de token. |
| v0.8.1 | May 06 | Fix duplicados `AVISOS_CACHE_TTL`/`AVISOS_CACHE_TS_KEY`. `API_URL` global → `getActiveApiUrl()`. |
| v0.8.2 | May 07 | **Onboarding eliminado.** Login directo visible por defecto. Loader seguro con `_cargarPortalCompleto`. Sin fallback offline. XSS fixes con `sanitizeHtml()`. SW v4 precache completo. Passwords eliminadas de `config.js`. |

---

## 12. Decisiones tomadas — no revertir sin discutir

| Decisión | Razonamiento |
|---|---|
| Onboarding eliminado | Era cosmético, no aportaba seguridad y causaba bugs de timing. Login directo es más simple y seguro. |
| Sin fallback offline de login | Passwords en texto plano en repo público era inaceptable. Toda auth requiere servidor. |
| Login visible por defecto en HTML | Elimina dependencia de JS para mostrar el login. Si el loader falla, el login siempre está visible. |
| Pages y app.js no cargan sin sesión | El HTML del portal no debe existir en el DOM sin autenticación. |
| `iniciarFlujoAuth()` en `ui.js` | Es el único módulo que carga en ambos flujos. `app.js` no está disponible sin sesión. |
| Usuarios en `Code.gs`, no en Sheet | Más seguro. El Sheet solo guarda datos operativos. |
| Gerentes comparten contraseña | Pragmático para Beta. Riesgo aceptado. |
| No usar módulos ES (`import/export`) | Romperían el patrón de globals con GitHub Pages. |
| Apps Script como API | Sin costo. Límite: 30 ejecuciones concurrentes. Suficiente para 9-50 sucursales. |

---

## 13. Roadmap

### Próximas features (en orden de valor)

| Feature | Descripción |
|---|---|
| Dashboard por gerente | Vista filtrada — solo KPIs de su sucursal. |
| Consolidado auto-poblado | Apps Script parsea el Excel subido y actualiza el consolidado. |
| Newsletter automático | Trigger al crear aviso crítico — sin intervención manual. |
| Historial semanal en dashboard | Dropdown para ver semanas anteriores. El Sheet ya guarda `semana`. |
| Formulario de incidencias | Reporte desde Mi Sucursal → Drive. |
| Rol Zonal funcional | Mapear sucursales a zonas. |
| Push notifications | SW instalado — agregar `push` event. |
| Activar CDMX o MTY | Ver sección 5. |

### Fase futura — discutir antes de empezar

- JWT para sesiones firmadas.
- Firebase / Supabase como base de datos real.
- El frontend no cambia — solo se reemplaza `Code.gs` y se actualizan URLs en `config.js`.

---

*Portal Operativo LCP · La Crêpe Parisienne · Grupo MYT / Corporativo Alancar*  
*Actualizado: Mayo 2026 · v0.8.2*
