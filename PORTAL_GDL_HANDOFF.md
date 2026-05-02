# Portal Operativo GDL — Documento de Handoff

**La Crêpe Parisienne · Grupo MYT / Corporativo Alancar**  
Mayo 2026 · Saúl Ibrahim García

---

## Instrucciones para el asistente IA

Antes de hacer cualquier cosa, lee este documento completo. Contiene todo el contexto, estado actual, bugs conocidos, features pendientes y reglas de trabajo del proyecto.

**Regla obligatoria:** con cada entrega debes actualizar `const VERSION` en el JS del portal y agregar una entrada al changelog de este documento (sección 8) y al changelog interno del portal (sección About → debug).

---

## 1. Contexto del Proyecto

El Portal GDL es una herramienta interna para centralizar la operación de las 9 sucursales de La Crêpe Parisienne en Guadalajara. Reemplaza la comunicación dispersa en WhatsApp y consolida reportes, avisos, minutas y formatos en un solo lugar.

**Stakeholder principal:** Oliver González — Regional Manager GDL  
**Desarrollador:** Saúl Ibrahim García — Barista / Analista de datos, AND & MAN  
**Brand director:** Amaya (encima de Oliver, no contacto directo del portal)  
**Corporativo:** Grupo MYT / Grupo Corporativo Alancar — operación tipo franquicia  
**Región:** Guadalajara, Jalisco, México

---

## 2. Stack Técnico

### Arquitectura

El portal es un SPA sin framework — HTML/CSS/JS puro en un único archivo `index.html`, hosteado en GitHub Pages (Donde el siguiente paso será dividirlo en varios html's para seguir escalando en features). El backend es exclusivamente Google Apps Script. No hay Node.js, Firebase, Vercel, ni ningún otro servidor (Como se planea seguir expandiendo y mejorando el portal, tenlas en cuenta como futuras cosas a trabajar y agregar asi como un JWT para los logins y Firebase para una base de datos mas robusta y segura).

| Capa | Tecnología |
|---|---|
| Frontend | HTML/CSS/JS puro — un solo archivo `index.html` |
| Hosting | GitHub Pages |
| Backend | Google Apps Script desplegado como Web App pública |
| Base de datos | Google Sheets — una Sheet maestra con pestañas |
| Storage | Google Drive — carpetas por sucursal ya creadas |
| Charts | Chart.js 4.4.0 via CDN (jsdelivr) |
| Fonts | DM Serif Display + DM Sans via Google Fonts |
| Versión actual | `v0.5.0-beta` |

### Google Sheet Maestra

**Sheet ID:** `1v_ggWvAsfwNlQAQiqo1jjH1g7c6-naG_hVUsSsq6XDY`

| Pestaña | Columnas |
|---|---|
| Usuarios | id · nombre · correo · sucursal · rol · password · activo |
| Avisos | id · tag · fecha · autor · texto · fechalimite · fechaborrado · critico · creado |
| Consolidado | semana · sucursal · meta · venta_neta · trx · entrego · timestamp |
| Juntas | id · fecha · tipo · tema · acuerdos · responsable · estado · autor |
| Lecturas | avisoId · userCorreo · userNombre · userSucursal · timestamp |

### Apps Script

| | |
|---|---|
| File ID en Drive | `1oK_9ejBl7pwuMXBmLnk6itgvcVMGriaq` |
| URL del deploy | `https://script.google.com/macros/s/AKfycby10xJBhvEW8e49esn25rP8LSrWXmO4ntKHgojq2O1I0eZpRzsMtH_RJa4L6DFz6NIa/exec` |
| Tipo de deploy | Aplicación Web — Acceso: Cualquier persona |
| Ejecutar como | Yo (cuenta propietaria de la Sheet) |

#### Endpoints GET (`?action=`)

| action | descripción |
|---|---|
| `getAvisos` | Devuelve avisos activos de la Sheet |
| `getConsolidado` | Filtra por `&semana=XXXX`, si no devuelve la última |
| `getSemanas` | Lista semanas disponibles en el consolidado |
| `verifySession` | Verifica token: `&token=XXX` |
| `getUsuarios` | Devuelve usuarios sin password (solo admin) |
| `getLecturas` | Devuelve lecturas de avisos críticos |
| `juntas` | Devuelve minutas de juntas |

#### Endpoints POST (`body.action`)

| action | descripción |
|---|---|
| `login` | correo + password → `{ok, user:{id, nombre, correo, sucursal, rol, token}}` |
| `saveAviso` | Crea o actualiza aviso (por id) |
| `deleteAviso` | Soft delete por id |
| `saveJunta` | Crea o actualiza minuta de junta |
| `setEntrega` | Marca entrega semanal de una sucursal |
| `markLeido` | Registra lectura de aviso crítico |
| `sendNewsletterNow` | Dispara envío manual del newsletter |

Todos los endpoints devuelven `{ok: true/false, ...datos}` via `ContentService`.

---

## 3. Las 9 Sucursales y sus Drive IDs

| Sucursal | Código | Drive Root ID | Notas |
|---|---|---|---|
| Andares | AND | `12W9Q93CPZ2-HxQsVja7mGgR4WA5UKuOV` | Sede Ibrahim / fusionada con MAN |
| Mercado Andares | MAN | `1EKnE_CnT8z4Jbj0U7-C_GiZjiPZZs447` | Fusionada con AND operativamente |
| Via Viva | VIV | `1QhvpWf9iioXBYB40AAENFxKqnvMvgnm0` | |
| Midtown | MID | `16VFQ-oWDvuDHTnjIPcJOP4eVPge7eAeB` | |
| La Perla | PER | `1xgbwp2IS-Itp3JCxPaCUO4aLs_R0HacW` | |
| Plaza Patria | PAT | `1Z3rN3AZvNdVfrTadZ-Rg2VT0iuwC_NFG` | |
| Santa Anita | ANI | `17hAbt1Gb1hsbZht-1SGusX23UGTwtbvB` | |
| Galerías Guadalajara | GAL | `1x7GL78aCuSwIS4Q-1dhzj80vi2i4sHHe` | |
| Forum Tlaquepaque | FOR | `1mg7hJu2-wtRn4YiCdW9C6uZqwUalSKQH` | |

Cada carpeta raíz contiene subcarpetas: `Ventas / Inventarios / Incidencias / Horarios`

- **Carpeta de Formatos descargables:** `1hc0gkMfZodNzpSkp16vMlTalQFzEzgfP`
- **Carpeta raíz GDL:** `1Bkk9a21U4aOsIRRJ5UxXNtPH-rscMtwW`

Los IDs individuales de subcarpetas están hardcodeados en el objeto `SUCURSAL_DATA` del JS. No modificar sin actualizar el objeto completo.

---

## 4. Sistema de Roles y Auth

La sesión se guarda en `localStorage` con clave `lcp_gdl_session_v1` y expira en 7 días. El token es el correo del usuario.

### Permisos por rol

| Rol | Checklist | Tab Admin | Editar avisos | Sucursales |
|---|---|---|---|---|
| admin | ✓ | ✓ | ✓ | Ve todas |
| analista | ✓ | ✓ | ✓ | Ve todas + sucursal propia destacada |
| regional | ✓ | ✓ | ✓ | Ve todas |
| zonal | ✓ | ✓ | ✓ | Ve todas — **bug: sin restricción de zona** |
| gerente | ✗ | ✗ | ✗ | Solo ve "Mi Sucursal" |

`LEADERSHIP_ROLES = ['admin', 'analista', 'regional', 'zonal']`

### Usuarios demo hardcodeados en JS

> ⚠️ Passwords en texto plano expuestos en DevTools. Mitigar cuando Apps Script esté en producción estable.

| Nombre | Correo | Password | Rol | Sucursal |
|---|---|---|---|---|
| Oliver González | oliver@lcp.mx | lcp2026 | regional | — |
| Saúl Ibrahim | ibrahim@lcp.mx | lcp2026 | analista | Andares |
| Evelyn Landeros | evelyn@lcp.mx | lcp2026 | gerente | Galerías Guadalajara |
| Carlos Méndez | carlos@lcp.mx | lcp2026 | gerente | Midtown |
| Demo Admin | admin@demo.com | demo | admin | — |
| Demo Zonal | zonal@demo.com | demo | zonal | — |
| Demo Gerente | gerente@demo.com | demo | gerente | Andares |

Flujo de login: llama Apps Script primero → si falla o no hay `API_URL`, cae al array `DEMO_USERS` como fallback.

---

## 5. Features Implementados — v0.5.0

| Feature | Estado | Notas |
|---|---|---|
| Onboarding 3 pasos | ✓ | Una sola vez, cachea en `localStorage` con clave `lcp_gdl_ob_v1` |
| Login correo + password | ✓ | Apps Script → fallback DEMO_USERS |
| Sistema de roles en DOM | ✓ | 5 roles con permisos diferenciados |
| Dark mode | ✓ | Persiste en localStorage |
| Header: user chip + logout | ✓ | Iniciales, nombre, rol, sucursal |
| Campana de notificaciones | ✓ | In-browser, máx 20, localStorage |
| Carrusel de avisos | ✓ | Autoplay 10s, pausa en hover/touch, progress bar |
| Avisos críticos + lectura | ✓ | Botón "Marcar como leído" para gerentes, log en Apps Script |
| Histórico de avisos | ✓ | Modal con avisos expirados/eliminados |
| Editor de avisos (admin) | ✓ | CRUD, modal, tabs, tag, fecha límite, fecha borrado, flag crítico |
| Checklist entregas | ✓ | Solo leadership — 9 sucursales, sincroniza con Apps Script |
| Mi Sucursal (gerentes) | ✓ | Links a 4 carpetas Drive, estado de entrega, botón marcar |
| Sucursales (leadership) | ✓ | 9 cards, búsqueda, instrucciones, copy link |
| Consolidado Regional | ✓ | Editable inline, calcula % avance, ticket y semáforo automático |
| Dashboard | ✓ | 5 KPIs, gráfica venta vs meta, dona entregas, tendencia, heatmap, ranking |
| Juntas y Acuerdos | ✓ | CRUD minutas, filtros por tipo, modal editor, visible para todos |
| Formatos descargables | ✓ | Links a 4 formatos en Drive |
| Sección About | ✓ | Propósito, equipo, changelog debug |
| Panel Admin | ✓ | Avisos, lecturas críticos, newsletter, tabla usuarios |
| Mobile nav (bottom) | ✓ | 6 tabs en nav inferior para móvil |
| Newsletter manual | ✓ | Botón en admin llama `sendNewsletterNow` al Apps Script |
| Deep linking por hash | ✓ | `#inicio`, `#dashboard`, `#sucursales`, etc. |

---

## 6. Bugs Detectados en QA

QA realizado el 1 de mayo de 2026.

### 🔴 Alta prioridad — rompe funcionalidad o genera desconfianza

| # | Bug | Descripción | Fix |
|---|---|---|---|
| 1 | Avisos seed vencidos | `av_seed_2` (fechaBorrado: 2026-05-02) desaparece el 2 de mayo. `av_seed_1` tiene fechaLimite 2026-04-30 → muestra "VENCIÓ" en rojo. | Actualizar seeds o cargarlos siempre desde Apps Script como fuente de verdad. |
| 2 | Checklist no sincroniza entre dispositivos | `alternarMiEntrega()` escribe solo en localStorage. Si el gerente marca en su teléfono, Oliver ve "pendiente" en laptop. El call a `apiCall('setEntrega')` existe pero sin manejo visible de fallo. | Verificar que el endpoint `setEntrega` del Apps Script responde y actualizar el UI con base en la respuesta, no en el estado local. |
| 3 | Consolidado no persiste entre sesiones | La tabla se llena con inputs editables pero no hay guardado en localStorage ni sync al cambiar de sección. Si Oliver edita y navega, pierde los datos silenciosamente. | Guardar el estado de la tabla en localStorage con namespace de semana en cada `oninput`, y cargar al inicializar. |
| 4 | Sección de lecturas críticos vacía en demo | El panel Admin muestra "No hay avisos críticos activos" porque los seeds no tienen `critico: true`. La feature más valiosa para Oliver no se activa sola. | Crear al menos 1 aviso crítico en la Sheet o en los seeds. |
| 5 | Heatmap usa `Math.random()` | `renderHeatmap()` genera datos aleatorios para sucursales que no son el usuario activo. El heatmap parece real pero no lo es. | Conectar a `getLecturas` del Apps Script o mostrar "sin dato" para sucursales sin información real. |
| 6 | Tendencia usa datos hardcodeados | `renderChartTendencia()` usa `const demo=[820000,910000,...]`. La gráfica de "últimas 6 semanas" no refleja datos reales. | Conectar al endpoint `getConsolidado` iterando las últimas 6 semanas disponibles. |

### 🟡 Media prioridad — UX deficiente

| # | Bug | Descripción | Fix |
|---|---|---|---|
| 7 | `irAMiSucursal()` sin `setMobileTab` | Desde el user menu, "Ir a mi sucursal" llama `showSection()` pero no `setMobileTab()` — el tab activo en móvil queda desfasado. | Agregar `setMobileTab('mn-sucursales')` en `irAMiSucursal()`. |
| 8 | Botón "Visualizar" duplicado | En `construirMiSucursal()`, los botones "Subir / Ver carpeta" y "Visualizar" apuntan al mismo folder ID. Son idénticos. | Cambiar "Visualizar" por "📥 Descargar formato" apuntando a la carpeta de Formatos. |
| 9 | Rol zonal sin diferencia funcional | `zonal` está en `LEADERSHIP_ROLES` pero tiene exactamente los mismos permisos que `regional`. No hay restricción de zona. | Definir qué debe ver el zonal o eliminar el rol hasta que se necesite. |
| 10 | Demo hint inaccesible si Apps Script falla | Con `API_URL` configurado, el hint se oculta. Si Apps Script devuelve error, el fallback `DEMO_USERS` funciona pero el usuario no sabe qué credenciales usar. | Mostrar mensaje de error más descriptivo cuando el login falla con Apps Script. |
| 11 | `cargarJuntas()` se llama dos veces al login | `refrescarDatosBackend()` llama `cargarJuntas()` al final, y `showSection('juntas')` también la llama. Dos fetches casi simultáneos. | Agregar flag `juntasCargadas` para evitar doble fetch. |
| 12 | JUNTAS_DEMO con fechas de abril 2026 | Si Apps Script no responde, los gerentes ven minutas históricas sin indicador de que son datos de demostración. | Agregar banner "Modo demo — datos de ejemplo" cuando se cae a JUNTAS_DEMO. |

### 🔵 Baja prioridad — deuda técnica

| # | Item | Descripción |
|---|---|---|
| 13 | Passwords en texto plano | `DEMO_USERS` expone `lcp2026` en el JS del cliente. Cualquier persona con DevTools lo ve. |
| 14 | `execCommand('copy')` deprecado | `fbCopy()` usa el método legacy. El path `navigator.clipboard` ya existe como primera opción — el fallback casi nunca se ejecuta en HTTPS. |
| 15 | Mobile nav apretado en 375px | "Consolidado" y "Dashboard" pueden cortarse en pantallas pequeñas. Revisar en dispositivo real. |
| 16 | WhatsApp y correos placeholder en About | `wa.me/523300000000` y `wa.me/523300000001` son números falsos. Actualizar antes de producción. |
| 17 | KPI cobertura críticos usa solo lecturas locales | `initDashboard()` usa `getLeidosLocales()` — refleja solo el navegador actual, no el sistema completo. Conectar al endpoint `getLecturas`. |
| 18 | KPI TRX usa color fuera de paleta | `#2980b9` (blue) no está en la paleta de marca. Cambiar a `--sage` o `--verde-light`. |
| 19 | `rc()` llama `initDashboard()` en cada keystroke | Sin debounce — si el usuario escribe rápido hay múltiples renders del dashboard. Agregar debounce de 300ms. |

---

## 7. Features a Agregar

### Próxima versión — v0.6.0

| Feature | Descripción |
|---|---|
| Limpiar seeds vencidos | Reemplazar los 3 `AVISOS_DEFAULT` por avisos reales desde Apps Script. Si el fetch falla, mostrar carrusel vacío con mensaje en lugar de datos obsoletos. |
| Persistencia del consolidado | Guardar el estado de la tabla en localStorage con namespace de semana en cada `oninput`. Cargar al inicializar. |
| Indicador "última actualización" | Timestamp visible en dashboard y consolidado. Resuelve el problema de desconfianza: "¿esto está actualizado?". |
| Aviso crítico en seeds | Al menos 1 aviso seed con `critico: true` para que lecturas y heatmap se activen en demo. Imprescindible para mostrarle a Oliver. |
| Datos reales en tendencia | Conectar `renderChartTendencia()` al consolidado real iterando las últimas 6 semanas desde la Sheet. |
| Datos reales en heatmap | Conectar `renderHeatmap()` a `getLecturas` del Apps Script. Mostrar "sin dato" cuando no hay información. |
| Fix `irAMiSucursal()` mobile | Agregar `setMobileTab('mn-sucursales')` — 1 línea. |
| Eliminar botón "Visualizar" duplicado | Cambiar por "📥 Descargar formato" apuntando a la carpeta de Formatos. |
| Números reales en About | Reemplazar `wa.me/523300000000` y correos placeholder por los reales. |
| Estado vacío descriptivo en dashboard | Cuando no hay datos en el consolidado, mostrar "Llena el consolidado para ver las métricas →" con link a la sección. |
| Debounce en `rc()` | 300ms para evitar múltiples renders del dashboard al escribir. |

### Versión posterior — v0.7.0+

| Feature | Descripción |
|---|---|
| Newsletter automático | Apps Script dispara email a correos corporativos cuando se publica un aviso nuevo o una minuta. El endpoint `sendNewsletterNow` ya existe — falta el trigger automático en el Script. |
| Consolidado auto-poblado desde Drive | Apps Script detecta cuando un gerente sube un archivo a su carpeta de Ventas, parsea el nombre (`VentaSemanal_AND_ABR2026_S3.xlsx`) y actualiza el consolidado. Elimina el llenado manual. |
| Dashboard por gerente | Vista filtrada que muestre solo KPIs de la sucursal del gerente (venta vs meta, ticket, lecturas propias). Actualmente el gerente ve el dashboard completo vacío. |
| Rol Zonal funcional | Mapear cada sucursal a una zona y restringir la visibilidad del zonal a sus sucursales asignadas. |
| CRUD de usuarios desde el portal | La tabla de usuarios en Admin actualmente dice "Conecta Apps Script". Implementar agregar gerente, cambiar contraseña, desactivar cuenta. |
| Historial de consolidado por semana | Dropdown para ver el consolidado de semanas anteriores. La Sheet ya tiene la columna `semana` y el endpoint `getSemanas` existe. |
| Formulario de incidencias desde el portal | Reporte directo desde Mi Sucursal (merma, ausentismo, incidente con cliente) que se guarda en Drive. Elimina la dependencia de bajar/llenar/subir el Excel. |

### Eventual

| Feature | Descripción |
|---|---|
| PWA con push notifications | Service worker + manifest.json para notificaciones nativas cuando llegue un aviso crítico. |
| Escalado a otras regiones | El modelo GDL es el piloto. Replicable en otras regiones o marcas del grupo con mínima configuración. |

---

## 8. Cosas a Cambiar / Mejorar

### UX / Comportamiento

- El dashboard vacío (todos los KPIs en "—") parece roto para un usuario nuevo. Agregar estado vacío explicativo.
- La sección de lecturas en Admin siempre muestra "Solo aparece cuando hay avisos críticos". Cambiar a que siempre muestre la tabla con estado vacío cuando no hay críticos.
- La nota "Tabla manual. Para información oficial siempre consultar Drive" en el consolidado contradice el propósito del portal. Cambiar el copy cuando el consolidado se alimente automáticamente.
- Los toasts duran 2500ms — en acciones importantes (`Aviso guardado`, `Newsletter enviado`) aumentar a 3500ms.
- El tab "Acerca de" es el último y puede quedar en posición incorrecta si se agregan nuevas secciones. Definir orden fijo de tabs.

### Paleta y Diseño

- El color `#2980b9` del KPI "TRX total región" no está en la paleta de marca. Cambiar a `--sage` o `--verde-light`.
- Las cards de Mi Sucursal en móvil tienen dos botones por acción. Consolidar en uno.
- El heatmap puede mejorar con labels de fechas en las columnas y colores más graduales.

---

## 9. Changelog

Con cada entrega: actualizar `const VERSION` en el JS y agregar una entrada aquí.

| Versión | Fecha | Cambios principales |
|---|---|---|
| v0.1.0 | Abr 28 | Primer HTML estático. Carrusel de avisos, tabla consolidado, links a Drive, 9 sucursales, favicon SVG. |
| v0.2.0 | Abr 28 | Sección Formatos con instrucciones. Dark mode. Diseño responsive básico. |
| v0.3.0 | Abr 28 | Onboarding 3 pasos. Sección About. Changelog debug. Stat cards en inicio. |
| v0.4.0 | Abr 29 | Login correo + password. Roles en DOM. Modal admin de avisos. Checklist de entregas. User chip en header. Portal oculto hasta auth. |
| v0.4.1 | Abr 29 | Backend Apps Script (Code.gs). Endpoints login, getAvisos, saveAviso, deleteAviso, markLeido, sendNewsletterNow. Token de sesión 7 días. |
| v0.5.0 | Abr 29 | Dashboard completo (5 KPIs, gráfica venta vs meta, dona entregas, tendencia, heatmap, ranking). Campana de notificaciones. Bottom nav móvil. Juntas y Acuerdos con CRUD. Avisos críticos con confirmación de lectura. Tokens CSS refinados. |
| v0.5.1 | May 01 | Fixes inmediatos: persistencia del consolidado en `localStorage`, actualización de avisos seed con flag crítico, heatmap con lecturas reales, y notas pendientes para variables hardcodeadas. |
| v0.6.0 | May 01 | Mejoras UX: Debounce en la edición del consolidado, Empty States en Dashboard para evitar gráficas rotas, indicadores de "Última Actualización" y limpieza de la card de misión. |

---

## 10. Next Steps — En Orden de Prioridad

### Inmediato — antes de mostrarle a Oliver

1. **Actualizar avisos seed** — el de inventario ya venció y desaparece el 2 de mayo. El carrusel queda con 1 solo aviso activo.
2. **Crear aviso crítico seed** — sin al menos 1 aviso con `critico: true`, Oliver no verá la feature de lecturas ni el heatmap real.
3. **Persistencia del consolidado** — Oliver puede editar la tabla y perder todo al navegar. Pérdida de confianza inmediata.
4. **Números reales en About** — `wa.me/523300000000` son falsos. Alguien los va a probar.
5. **Reemplazar `Math.random()` en heatmap** — el heatmap parece real pero es aleatorio.

### v0.6.0 — Semana siguiente

- Conectar tendencia al consolidado real (últimas 6 semanas desde Sheets).
- Conectar heatmap a `getLecturas` del Apps Script.
- Fix `irAMiSucursal()` en móvil (1 línea de código).
- Indicador de "última actualización" en dashboard y consolidado.
- Estado vacío descriptivo en dashboard.
- Debounce en `rc()`.

### v0.7.0 — Mes siguiente

- Newsletter automático (trigger en Apps Script al crear aviso o minuta).
- Consolidado auto-poblado desde Drive (parseo de nombre de archivo).
- Vista de dashboard por gerente.
- CRUD de usuarios desde el portal.

### Eventual

- PWA con push notifications.
- Formulario de incidencias desde el portal.
- Historial de consolidado con dropdown por semana.
- Escalar el modelo a otras regiones o marcas del grupo.

---

## 11. Reglas de Trabajo para el Asistente

- Antes de escribir código, confirmar qué hay que cambiar y dónde.
- Si hay un bug, corregirlo sin que se pida dos veces.
- No agregar features sin antes yo mismo confirmartelas.
- Si algo que se pide rompe algo existente, avisar antes de proceder.
- Con cada entrega actualizar `const VERSION` en el JS y agregar la entrada al changelog (sección 9 de este documento y el changelog debug dentro del portal en la sección About).
- No modificar la paleta ni la tipografía salvo que se pida explícitamente.
- El modo demo (fallback a `DEMO_USERS` y `AVISOS_DEFAULT` cuando `API_URL` falla) SIEMPRE debe conservarse.

### Paleta — no modificar

```
--verde:       #3D5A47
--verde-deep:  #2a3f32
--sage:        #7A9E8A
--crema:       #F5EFE6
--negro:       #1A1A1A
--amber:       #c97d10
--rojo-soft:   #c62828
```

### Tipografía — no modificar

- Títulos: `DM Serif Display`
- Cuerpo: `DM Sans`

---

*Portal Operativo GDL · La Crêpe Parisienne · Grupo MYT / Corporativo Alancar*  
*Generado por Claude · Mayo 2026*
