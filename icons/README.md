# Iconos PWA

Los iconos actuales son SVG inline en base64 dentro de `manifest.json`.
Safari y algunos dispositivos Android rechazan SVG como icono de app instalada.

Para maxima compatibilidad, generar PNGs reales:

- `icon-192x192.png` — 192x192 px, fondo `#3D5A47`, logo crema centrado
- `icon-512x512.png` — 512x512 px, fondo `#3D5A47`, logo crema centrado

Luego reemplazar en `manifest.json`:

```json
"icons": [
  {
    "src": "icons/icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png"
  },
  {
    "src": "icons/icon-512x512.png",
    "sizes": "512x512",
    "type": "image/png"
  }
]
```

Nota: Los SVG inline actuales funcionan como fallback mientras no haya PNGs.
