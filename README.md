# ultima_parisienne

Portal Operativo de La Crêpe Parisienne — Región Guadalajara.

**Stack:** HTML/CSS/JS puro · GitHub Pages · Google Apps Script · Google Sheets

**Versión:** v0.8.3

## Estructura

- `index.html` — Punto de entrada con loader seguro y login
- `js/` — Módulos: `config.js` → `api.js` → `auth.js` → `ui.js` → `app.js`
- `pages/` — Secciones cargadas dinámicamente
- `sw.js` — Service Worker para PWA offline
- `Code.gs` — Backend Google Apps Script

## Deploy

1. Push a `main` en GitHub Pages
2. Portal vive en `https://ultimaibrahim.github.io/ultima_parisienne/`
3. Backend: Apps Script Web App desplegado con acceso "Cualquiera"

## Docs

Ver `PORTAL_GDL_HANDOFF.md` para especificación completa.
