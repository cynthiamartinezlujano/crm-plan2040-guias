# Plan 20·40 · CRM — Versión de prueba: rol **Guía**

Paquete para probar el CRM tal como lo verá una **guía** (Guía Cecilia en la muestra). Es la misma versión que `CRM Plan 2040.dc.html`; solo cambia el rol con el que abre.

## Cómo abrirlo
Los archivos cargan datos con `fetch`, así que deben servirse desde un servidor local (no doble clic):

```bash
cd export_guia
python3 -m http.server 8000
# abrir http://localhost:8000/Inicio%20Guia.dc.html
```

1. **Inicio Guia.dc.html** — inicio de sesión (aún no valida usuario ni contraseña).
2. **CRM Guia.dc.html** — el CRM con permisos de guía. «Cerrar sesión» regresa al inicio.

El mapa (pin del hogar y «Mapa real» del plan) y el llenado automático de la dirección necesitan internet.

## Qué hay en esta versión
- **Inicio**: mensaje de ánimo con avance del mes por hogar y acceso a su plan; visitas del mes en pestañas (les falta visita · visitados · descansan) con filtro niños/embarazadas.
- **Mi plan**
  - *Plan del día*: hogares por orden de ruta desde la oficina, tarjeta por hogar (compromiso anterior, carpetas que tocan, alertas, prioridad), vehículo compartido, ruta óptima por cercanía y mapa.
  - *Planeación del mes*: propuesta automática por zona y prioridad, proyección «¿alcanzas?» con el ritmo de visitas por día, calendario por semana (color por semana igual que en el mapa), arrastrar hogares entre días o tocar para mover, «Sin lugar en tu planeación», meses anteriores con lo real y meses siguientes para planear. Las visitas agendadas al registrar una visita quedan fijas salvo que la guía las mueva.
- **Periodicidad**: mensual si hay embarazo o un niño P2040 menor de 7 años; bimestral si el menor tiene 7+ (grupo A meses impares / B pares). Si en su mes no se logró la visita, al siguiente le toca. Los que descansan no cuentan como «sin visita».
- **Hogares y relaciones**: el hogar (quienes viven bajo el mismo techo, solo P2040 y F2040) es la unidad de visita. Las relaciones son persona a persona y en ambos sentidos (medio hermano, padrastro, abuela/nieta…), con «Vive aquí» para formar el hogar. Los perfiles C2040 y R2040 son solo relacionados.
- **Ficha del hogar**: encabezado visual, ubicación con **pin en el mapa** (calles/satélite, dirección que se llena sola) o dirección escrita, y pestañas *Guía de visita* (estado, pendientes, tips), *Indicadores*, *Integrantes* y *Acompañamiento*.
- **Ficha de persona**: encabezado limpio, **sus 10 indicadores** y pendientes; información y documentos según la edad («Se abre pronto»).
- **10 indicadores**: acompañamiento último mes, formación, sueño, registro civil, escolaridad, seguro médico, nutrición, vacunas, sacramentos según edad y consagración en 2 años.
- **Registro**: persona, mamá embarazada y hogar completo (sin apellidos obligatorios; tipo de familia sugerido por las relaciones).

## Novedades (octubre 2026)
- **Registro de visita** una pregunta por pantalla en celular y 5 pasos visuales en computadora; tema/compromiso/comentario por persona; alerta para varios niños con descripción y archivos; borrador si se salta algo en celular.
- **Seguimientos** y **Casos** con el mismo formato de registro.
- **Indicadores de tus niños** en el Inicio: pendientes por indicador y registro rápido (sueño, seguro, cinta MUAC con z-score OMS, sacramentos, consagración, cartilla vigente).
- **Ficha de visita** del hogar con checklist que se palomea solo, además de la Ficha del hogar.
- **Acompañamiento**: resumen y edición de registros, borradores y solicitudes de caso en la lista.
- **Detalle escolar** por grado según la edad.

## Datos de prueba
- `data/crm_ficticio.json`: muestra anonimizada hasta junio 2026 (nombres, IDs, hogares y fechas remapeados).
- `data/muestra-guias.js`: al abrir, completa ~70 hogares por guía con relaciones, ubicación aproximada por colonia e historial de visitas que respeta la periodicidad; luego se simulan acompañamientos hasta hoy.
- Lo capturado durante la prueba (altas, visitas, plan, pines, relaciones) se guarda **solo en el navegador** (localStorage).

## Archivos
- `Inicio Guia.dc.html`, `CRM Guia.dc.html` — páginas.
- `support.js` — runtime de los componentes.
- `admin-data.js` — catálogos, roles, usuarios y notificaciones.
- `data/` — datos y generador de la muestra.
- `assets/` — logo, fotos, ilustraciones, emociones, iconos, tipografía Sora.
- `_ds/…` — tokens y estilos del sistema de diseño Plan 20·40.

## Nota para desarrollo
Son prototipos de diseño en HTML. Para producción hay que conectar autenticación, base de datos, permisos del servidor, geocodificación con un proveedor contratado y un servicio de mapas con licencia de uso.
