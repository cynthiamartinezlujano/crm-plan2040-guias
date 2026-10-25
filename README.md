# Plan 20·40 · CRM — Versión de prueba: rol **Guía**

Paquete para probar el CRM tal como lo verá una **guía**. El usuario está fijo en «Guía» (no hay selector de usuario).

## Cómo abrirlo
Los archivos cargan datos con `fetch`, así que deben servirse desde un servidor local (no doble clic):

```bash
cd crm-plan2040-guias
python3 -m http.server 8000
# abrir http://localhost:8000/Inicio%20Guia.dc.html
```

1. **Inicio Guia.dc.html** — pantalla de inicio de sesión. Por ahora no valida usuario ni contraseña: «Entrar» pasa directo al CRM.
2. **CRM Guia.dc.html** — el CRM con permisos de guía. «Cerrar sesión» regresa al inicio de sesión.

## Qué ve y qué puede hacer la guía
- **Inicio**: saludo, frase del día, tarjetas del mes (familias, niños/as P2040, embarazadas con % de visita; sus acompañamientos del mes) y visitas del mes. Sin filtros de comunidad/guía/pilar.
- **Personas / Familias**: solo las suyas. En «Otras familias» ve únicamente el nombre de la familia (sin integrantes).
- **Acompañamiento**: por mes (flechas ‹ ›), lista o calendario, solo de sus personas. Sin sección Pilares.
- **Registrar**: visitas formativas (5 pasos), seguimientos y **solicitud de caso** (la guía solo llega a la solicitud; la valoración y atención las hace Trabajo social).
- **Alta de personas**: Datos · Hogar · Ubicación · Pilares (5.1–5.5) · Acompañamiento (con aviso de privacidad, hoja de registro y sueño para P2040). Al terminar: pantalla «¡Listo!» con ID y opción de registrar su primera visita.
- **Nutrición**: la guía solo registra tamizaje.
- **Notificaciones**: informativas (se marcan como leídas) y de acción (se quitan al resolverse); vista lateral o pantalla completa.
- **Mi perfil**: foto (editable), datos, permisos, cambiar contraseña (próximamente) y cerrar sesión.

## Datos de prueba
- `uploads/crm_muestra.json`: muestra con datos **ficticios** (nombres, IDs, CURP, teléfonos, domicilios y textos libres reemplazados) basada en la estructura del corte de junio 2026. Al cargar, el CRM **simula acompañamientos** desde ese corte hasta hoy (marcados `simulado: true`) para poder probar el mes actual.
- Lo que se captura durante la prueba (altas, visitas, fotos, notificaciones leídas) se guarda **solo en el navegador** (localStorage).

## Archivos
- `Inicio Guia.dc.html`, `CRM Guia.dc.html` — páginas.
- `support.js` — runtime de los componentes.
- `admin-data.js` — catálogos, roles, usuarios y notificaciones por rol.
- `assets/` — logo, fotos, ilustraciones, emociones, iconos de pilar, tipografía Sora.
- `_ds/…` — tokens y estilos del sistema de diseño Plan 20·40.

## Nota para desarrollo
Son prototipos de diseño en HTML: muestran el comportamiento y la apariencia esperados. Para producción hay que conectar autenticación real, base de datos y permisos del lado del servidor.
