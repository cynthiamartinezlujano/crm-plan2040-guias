// Datos de administración compartidos entre el CRM y la pantalla de Administración.
// Persistencia en localStorage (prototipo). Claves: p2040_admin_*
(function () {
  // Nivel de acceso a fichas por rol: general (listas y resúmenes) · ver (entra al detalle, solo lectura) · editar (incluye ver el detalle)
  const NIVELES = [['general', 'Ver general', 'Listas y resúmenes; sin entrar a la ficha'], ['ver', 'Solo ver', 'Entra a la ficha sin editar'], ['editar', 'Editar', 'Edita la ficha e indicadores (incluye ver)']];
  const PERMISOS = [
    ['registrar', 'Registrar acompañamientos', 'Acompañamiento'], ['solicitudes', 'Atender solicitudes de caso', 'Acompañamiento'],
    ['otras_comunidades', 'Ver otras comunidades', 'Alcance'], ['exportar', 'Exportar datos', 'Alcance'],
    ['catalogos', 'Administrar catálogos', 'Administrador'], ['usuarios', 'Administrar usuarios', 'Administrador']
  ];
  const ROLES = [
    { id: 'admin', nombre: 'Administrador', desc: 'Todo, en todas las comunidades o en la suya.', color: '#141414', acceso: 'editar', permisos: PERMISOS.map(p => p[0]) },
    { id: 'coord', nombre: 'Coordinación de comunidad', desc: 'Gestiona su comunidad: fichas, registros, solicitudes y exportar.', color: '#E81957', acceso: 'editar', permisos: ['registrar', 'solicitudes', 'exportar'] },
    { id: 'guia', nombre: 'Guía', desc: 'Acompaña a sus familias: ve y edita fichas, registra acompañamientos.', color: '#FDB813', acceso: 'editar', permisos: ['registrar'] },
    { id: 'ts', nombre: 'Trabajo social', desc: 'Atiende casos y solicitudes; edita fichas.', color: '#C282D4', acceso: 'editar', permisos: ['registrar', 'solicitudes'] },
    { id: 'salud', nombre: 'Nutrición / salud', desc: 'Captura mediciones e indicadores de salud.', color: '#F28F4C', acceso: 'editar', permisos: ['registrar'] },
    { id: 'direccion', nombre: 'Dirección (solo lectura)', desc: 'Ve todo sin editar; puede exportar.', color: '#7CBBEF', acceso: 'ver', permisos: ['otras_comunidades', 'exportar'] },
    { id: 'voluntario', nombre: 'Voluntario', desc: 'Solo consulta listas de su comunidad.', color: '#9AA3AD', acceso: 'general', permisos: [] }
  ];
  const COMUNIDADES = [
    { id: 'CC', nombre: 'Cuatro Ciénegas', estado: 'Coahuila', municipio: 'Cuatro Ciénegas de Carranza', sectores: ['Centro', 'Venustiano Carranza', 'El Cuije', 'Lázaro Cárdenas'], coordinador: 'Guía Claudia', inicio: '2017-01-15', color: '#E81957', activa: true },
    { id: 'CI', nombre: 'Independencia', estado: 'Nuevo León', municipio: 'Monterrey', sectores: ['Colonia Independencia', 'Loma Larga', 'Tanques de Guadalupe'], coordinador: 'Guía Mónica', inicio: '2022-08-01', color: '#7CBBEF', activa: true }
  ];
  const GUIAS_SEED = [
    ['Guía Claudia', 'CC', 'coord'], ['Guía Cecilia', 'CC', 'guia'], ['Guía Rosa', 'CC', 'guia'], ['Guía Patricia', 'CC', 'guia'], ['Guía Lorena', 'CC', 'guia'], ['Guía Beatriz', 'CC', 'guia'], ['Guía Sandra', 'CC', 'voluntario'],
    ['Guía Mónica', 'CI', 'coord'], ['Guía Adriana', 'CI', 'guia'], ['Guía Gabriela', 'CI', 'guia'], ['Guía Laura', 'CI', 'guia'], ['Guía Diana', 'CI', 'ts']
  ];
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
  const USUARIOS = [{ id: 'u_admin', nombre: 'Administrador Plan 20·40', correo: 'admin@plan-2040.org', telefono: '', rol: 'admin', comunidad: '', estado: 'activo', ultimo: '2026-10-23T08:40:00', extra: [], menos: [], esGuia: false },
    { id: 'u_karla', nombre: 'Karla Treviño', correo: 'karla.trevino@plan-2040.org', telefono: '', rol: 'salud', comunidad: 'CC', estado: 'activo', ultimo: '2026-10-21T10:05:00', extra: [], menos: [], esGuia: false },
    { id: 'u_fernanda', nombre: 'Fernanda Garza', correo: 'fernanda.garza@plan-2040.org', telefono: '', rol: 'direccion', comunidad: '', estado: 'activo', ultimo: '2026-10-22T17:30:00', extra: [], menos: [], esGuia: false }]
    .concat(GUIAS_SEED.map(([g, com, rol], i) => ({ id: 'u_' + slug(g), nombre: g, correo: slug(g.replace('Guía ', '')) + '@plan-2040.org', telefono: '', rol, comunidad: com, estado: 'activo', ultimo: '2026-10-' + String(12 + (i % 11)).padStart(2, '0') + 'T' + String(8 + (i % 9)).padStart(2, '0') + ':15:00', extra: [], menos: [], esGuia: true })));

  // ---- Catálogos ----
  // Cada ítem: { id, nombre, activo, color?, pilar?, eje?, meta? }
  const C = (nombre, extra) => Object.assign({ id: slug(nombre), nombre, activo: true }, extra || {});
  const CATALOGOS = [
    { id: 'programas', nombre: 'Programas', desc: 'Sesiones y programas del Plan por pilar', campos: ['pilar', 'color'], items: [
      C('Estimulación Temprana', { pilar: 'Educación' }), C('Coro Infantil', { pilar: 'Familia' }), C('Club de tareas', { pilar: 'Educación' }), C('Exploradores', { pilar: 'Familia' }), C('Nutrición', { pilar: 'Salud' }), C('Catequesis', { pilar: 'Espiritualidad' }), C('Taller de padres', { pilar: 'Familia' }), C('Jóvenes 20·40', { pilar: 'Educación' })] },
    { id: 'temas', nombre: 'Temas de formación', desc: 'Carpetas por edad y fichas generales; cada tema sugiere un eje', campos: ['carpeta', 'pilar', 'eje'], items: [
      C('Vacunas del primer año', { carpeta: '0-1 años', pilar: 'Salud', eje: 'vacunas' }), C('Lactancia y alimentación complementaria', { carpeta: '0-1 años', pilar: 'Salud', eje: 'nutricion' }),
      C('Ahorros para el preescolar', { carpeta: '1-2 años', pilar: 'Educación', eje: 'acceso' }), C('Soñando en grande', { carpeta: '1-2 años', pilar: 'Familia', eje: 'plan' }),
      C('Roles en la familia', { carpeta: '2-3 años', pilar: 'Familia', eje: 'famgen' }), C('¡Adiós pañal!', { carpeta: '2-3 años', pilar: 'Salud', eje: 'desarrollo' }),
      C('¿Cómo pongo límites?', { carpeta: '3-4 años', pilar: 'Familia', eje: 'entorno' }), C('Espiritualidad en la vida cotidiana', { carpeta: '3-4 años', pilar: 'Espiritualidad', eje: 'vidafe' }),
      C('Economía para toda la familia', { carpeta: '5-6 años', pilar: 'Economía Familiar', eje: 'ahorro' }), C('Identidad Familiar', { carpeta: '6-8 años', pilar: 'Familia', eje: 'famgen' }),
      C('¿Aprenden más de ti o del Internet?', { carpeta: '6-8 años', pilar: 'Educación', eje: 'calidad' }), C('Hábitos saludables', { carpeta: '9-12 años', pilar: 'Salud', eje: 'nutricion' }),
      C('Sueño y Plan de Vida', { carpeta: 'Generales', pilar: 'Familia', eje: 'plan' }), C('Preparando los sacramentos', { carpeta: 'Generales', pilar: 'Espiritualidad', eje: 'sacramentos' })] },
    { id: 'recursos', nombre: 'Recursos por tema', desc: 'Materiales que la guía usa en la visita', campos: ['eje'], items: [
      C('Cartilla nacional de vacunación', { eje: 'vacunas' }), C('Plato del bien comer', { eje: 'nutricion' }), C('Hoja «Mi sueño»', { eje: 'plan' }), C('Plan de vida familiar', { eje: 'plan' }), C('Árbol genealógico', { eje: 'famgen' }), C('Acuerdos de casa', { eje: 'entorno' }), C('Registro de gastos del hogar', { eje: 'ahorro' }), C('Cuento de la carpeta', { eje: 'calidad' }), C('Oración en familia', { eje: 'vidafe' }), C('Hoja de actividad'), C('Dinámica familiar')] },
    { id: 'alertas', nombre: 'Señales de alerta', desc: 'Al marcarse en una visita crean una Solicitud de caso', campos: ['color', 'pilar'], items: [
      C('Riesgo de deserción escolar', { color: '#E81957', pilar: 'Educación' }), C('Salud / desnutrición', { color: '#F28F4C', pilar: 'Salud' }), C('Violencia o conflicto familiar', { color: '#E23636', pilar: 'Familia' }), C('Crisis económica', { color: '#C282D4', pilar: 'Economía Familiar' }), C('Embarazo adolescente', { color: '#FDB813', pilar: 'Salud' }), C('Duelo o salud emocional', { color: '#7CBBEF', pilar: 'Familia' })] },
    { id: 'categorias_caso', nombre: 'Categorías de caso', desc: 'Tipo de solicitud que se abre cuando una visita detecta una señal de alerta; cada categoría pertenece a un pilar', campos: ['pilar'], items: [
      ['Beca Académica', 'Educación'], ['Beca manutención', 'Educación'], ['Deserción Escolar', 'Educación'], ['Neurodesarrollo (Discapacidad)', 'Educación'], ['Regularización', 'Educación'], ['Trámite Educación', 'Educación'], ['Útiles Escolares', 'Educación'],
      ['Embarazo de Alto Riesgo', 'Salud'], ['Enfermedad Crónica', 'Salud'], ['Malnutrición', 'Salud'], ['Medicamento', 'Salud'], ['Seguro Médico', 'Salud'], ['Terapia Psicológica', 'Salud'], ['Trámite Salud', 'Salud'], ['Transporte Consulta', 'Salud'], ['Vacunas', 'Salud'],
      ['Divorcio', 'Familia'], ['Duelo Familiar', 'Familia'], ['Pensión Alimenticia', 'Familia'], ['Registro Civil', 'Familia'],
      ['Kit Sacramental', 'Espiritualidad'], ['Material Catequesis', 'Espiritualidad'], ['Nulidad Sacramental', 'Espiritualidad'], ['Sacramento Extemporáneo', 'Espiritualidad'], ['Trámite Extemporáneo', 'Espiritualidad'],
      ['Desempleo', 'Economía Familiar'], ['Emprendimiento', 'Economía Familiar'], ['Vivienda', 'Economía Familiar']
    ].map(([n, pilar]) => C(n, { pilar })) },
    { id: 'estados_caso', nombre: 'Estados de caso', desc: 'Ciclo de vida de un caso y de una solicitud', campos: ['color'], items: [
      C('Pendiente de revisión', { color: '#A87400' }), C('Abierto', { color: '#A87400' }), C('En proceso', { color: '#2F7BBF' }), C('Finalizado', { color: '#2E9E5B' }), C('No procede', { color: '#9AA3AD' }), C('Atendida en caso', { color: '#2E9E5B' }), C('Cancelada', { color: '#9AA3AD' })] },
    { id: 'categorias_persona', nombre: 'Categorías de persona', desc: 'Clave con la que se clasifica a cada persona', campos: ['color'], items: [
      C('P2040 · Niño/a P2040', { color: '#E81957', clave: 'P2040' }), C('F2040 · Familiar', { color: '#A87400', clave: 'F2040' }), C('R2040 · Red de apoyo', { color: '#2F7BBF', clave: 'R2040' })] },
    { id: 'estatus_persona', nombre: 'Estatus de persona', desc: 'Situación de la persona en el Plan', campos: ['color'], items: [
      C('Activo', { color: '#2E9E5B' }), C('Inactivo', { color: '#9AA3AD' }), C('Defunción', { color: '#141414' })] },
    { id: 'motivos_baja', nombre: 'Motivos de baja', desc: 'Razón al pasar a Inactivo', campos: [], items: [
      C('Cambio de domicilio'), C('Decisión de la familia'), C('Egreso del Plan'), C('Sin localizar por 3 meses'), C('Otro')] },
    { id: 'vacunas', nombre: 'Esquema de vacunación', desc: 'Vacunas y dosis por edad que se verifican en la cartilla', campos: ['meta'], items: [
      C('BCG', { meta: 'Única · al nacer' }), C('Hepatitis B', { meta: '3 dosis · 0, 2, 6 m' }), C('Pentavalente', { meta: '4 dosis · 2, 4, 6, 18 m' }), C('Rotavirus', { meta: '3 dosis · 2, 4, 6 m' }), C('Neumocócica', { meta: '3 dosis · 2, 4, 12 m' }), C('Influenza', { meta: 'Anual · desde 6 m' }), C('SRP', { meta: '2 dosis · 12 m, 6 años' }), C('DPT', { meta: 'Refuerzo · 4 años' }), C('VPH', { meta: '11 años' })] },
    { id: 'tipos_visita', nombre: 'Tipos de visita', desc: 'Cómo se dio el encuentro en una visita formativa', campos: [], items: ['Visita presencial', 'Visita telefónica', 'Registro nacido', 'Registro pre-nacido'].map(n => C(n)) },
    { id: 'indicadores_visita', fijo: true, nombre: 'Indicadores en visita', desc: 'Ejes estratégicos de la ficha, por pilar. Activa un eje para capturar todo su bloque en el paso «Indicadores» del registro de visita', campos: ['pilar', 'campo'], items: [
      ['Registro neonatal','Salud','prenatal',false,'Hospital de nacimiento · Peso al nacer · Talla al nacer'], ['Derechohabiencia','Salud','derecho',true,'Tipo de seguro · Seguro médico'], ['Nutrición óptima','Salud','nutricion',true,'Antropometría (estatura, peso, MUAC, Z-score, diagnóstico) · Biometría hemática (hemoglobina, hematocrito, anemia)'], ['Vacunas','Salud','vacunas',true,'Esquema de vacunación (cartilla)'], ['Estimulación oportuna','Educación','estimulacion',true,'Estatus · Dónde la cursa'], ['Acceso y permanencia escolar','Educación','acceso',true,'Estudiando · Último grado · Nivel actual · Certificado · Carrera · Detalle escolar'], ['Alianzas','Educación','alianzas',false,'Consentimiento SEP · Carta de consentimiento'], ['Calidad educativa','Educación','calidad',true,'Diagnóstico de lectoescritura · Diagnóstico de matemáticas (resultado, fecha, comentarios, documento)'], ['Vida de fe','Espiritualidad','vidafe',true,'Religión · Practicante'], ['Sacramentos','Espiritualidad','sacramentos',true,'Bautizo · Primera comunión · Confirmación · Matrimonio (fecha y constancia)'], ['Consagraciones','Espiritualidad','consagraciones',false,'Sagrado Corazón · Virgen de Guadalupe · San José'], ['Catequesis','Espiritualidad','catequesis',true,'Historial de etapas'], ['Situación familiar','Familia','famgen',true,'Campos de la sección «Situación familiar» de la ficha'], ['Entorno familiar','Familia','entorno',true,'Campos de la sección «Entorno familiar» de la ficha'], ['Empleo e ingreso','Economía Familiar','ind',true,'Ocupación · Industria · Puesto · Salario mensual · Organización']
    ].map(([n, pilar, eje, activo, incluye]) => Object.assign(C(n, { pilar, campo: 'eje:' + pilar + '|' + eje, eje, incluye }), { activo })) },
    { id: 'colonias', nombre: 'Colonias', desc: 'Colonias por comunidad; el municipio lo define la comunidad. El CP es opcional', campos: ['comunidad', 'cp'], items: [
      ['Centro', 'CC', '27640'], ['Venustiano Carranza', 'CC', '27643'], ['El Cuije', 'CC', '27645'], ['Lázaro Cárdenas', 'CC', '27646'], ['Ejido Cuatro Ciénegas', 'CC', '27650'],
      ['Independencia', 'CI', '64720'], ['Loma Larga', 'CI', '64710'], ['Tanques de Guadalupe', 'CI', '64730'], ['Nuevo Repueblo', 'CI', '64700']
    ].map(([n, comunidad, cp]) => Object.assign(C(n, { comunidad, cp }), { id: slug(comunidad + ' ' + n) })) },
    { id: 'calles', nombre: 'Calles', desc: 'Calles por colonia y comunidad', campos: ['comunidad', 'colonia'], items: [
      ['Morelos', 'CC', 'Centro'], ['Hidalgo', 'CC', 'Centro'], ['Zaragoza', 'CC', 'Centro'], ['Juárez', 'CC', 'Centro'], ['Carranza', 'CC', 'Venustiano Carranza'], ['Allende', 'CC', 'Venustiano Carranza'], ['Niños Héroes', 'CC', 'El Cuije'], ['Francisco I. Madero', 'CC', 'El Cuije'], ['Emiliano Zapata', 'CC', 'Lázaro Cárdenas'], ['Las Palmas', 'CC', 'Lázaro Cárdenas'], ['Camino al Ejido', 'CC', 'Ejido Cuatro Ciénegas'],
      ['Querétaro', 'CI', 'Independencia'], ['Tlaxcala', 'CI', 'Independencia'], ['Guanajuato', 'CI', 'Independencia'], ['Loma Linda', 'CI', 'Loma Larga'], ['Loma Redonda', 'CI', 'Loma Larga'], ['Tanque Azul', 'CI', 'Tanques de Guadalupe'], ['Mirador', 'CI', 'Tanques de Guadalupe'], ['Repueblo Norte', 'CI', 'Nuevo Repueblo']
    ].map(([n, comunidad, colonia]) => Object.assign(C(n, { comunidad, colonia }), { id: slug(comunidad + ' ' + colonia + ' ' + n) })) },
    { id: 'parentescos', nombre: 'Parentescos', desc: 'Relación entre dos personas (de B hacia A)', campos: [], items: ['Mamá', 'Papá', 'Hijo(a)', 'Hermano(a)', 'Medio hermano(a)', 'Hijastro(a)', 'Padrastro', 'Madrastra', 'Abuelo(a)', 'Nieto(a)', 'Tío(a)', 'Sobrino(a)', 'Primo(a)', 'Pareja', 'Otro'].map(x => C(x)) }
  ];

  const K = { usuarios: 'p2040_admin_usuarios', roles: 'p2040_admin_roles', comunidades: 'p2040_admin_comunidades', catalogos: 'p2040_admin_catalogos', bitacora: 'p2040_admin_bitacora', notificaciones: 'p2040_admin_notif' };
  // ---- Notificaciones por rol ----
  // Eventos que puede avisar el CRM; `roles` sugiere a quién le importa por default
  const NOTIF_EVENTOS = [
    ['visita_vencida', 'Niño/a o embarazada sin visita en el mes', 'Acompañamiento', ['guia', 'coord']],
    ['visita_registrada', 'Se registró una visita de mi familia', 'Acompañamiento', ['coord']],
    ['compromiso_vence', 'Compromiso de visita por vencer', 'Acompañamiento', ['guia']],
    ['alerta_caso', 'Alerta en un caso (riesgo, violencia, salud)', 'Casos', ['coord', 'ts', 'admin']],
    ['solicitud_nueva', 'Nueva solicitud de apoyo', 'Casos', ['ts', 'coord']],
    ['solicitud_resuelta', 'Solicitud resuelta o canalizada', 'Casos', ['guia']],
    ['vacuna_pendiente', 'Dosis de vacuna pendiente según edad', 'Salud', ['guia', 'salud']],
    ['medicion_vencida', 'Medición de peso y talla vencida (>3 meses)', 'Salud', ['salud', 'guia']],
    ['embarazo_control', 'Control prenatal sin registrar este mes', 'Salud', ['salud', 'guia']],
    ['cumpleanos', 'Cumpleaños de un niño/a acompañado', 'Familia', ['guia']],
    ['alta_persona', 'Alta de persona o familia', 'Administración', ['coord', 'admin']],
    ['cambio_guia', 'Reasignación de familias a otra guía', 'Administración', ['guia', 'coord', 'admin']],
    ['resumen_semanal', 'Resumen semanal de la comunidad', 'Reportes', ['coord', 'direccion', 'admin']],
    ['resumen_mensual', 'Resumen mensual de indicadores', 'Reportes', ['direccion', 'admin']]
  ];
  const NOTIF_CANALES = ['off', 'app', 'app+correo', 'app+wa'];
  const NOTIF_FREC = ['inmediata', 'diaria', 'semanal'];
  const notifDefault = (roles) => { const cfg = {}; (roles || ROLES).forEach(r => { cfg[r.id] = { frecuencia: r.id === 'direccion' ? 'semanal' : r.id === 'admin' ? 'diaria' : 'inmediata', eventos: {} }; NOTIF_EVENTOS.forEach(([id, l, g, def]) => { cfg[r.id].eventos[id] = def.indexOf(r.id) >= 0 ? 'app' : 'off'; }); }); return cfg; };
  const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? fb : v; } catch (e) { return fb; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return v; };
  const clone = v => JSON.parse(JSON.stringify(v));

  const API = {
    PERMISOS, NIVELES, K,
    // Roles guardados antes del cambio de modelo: derivar `acceso` de los permisos viejos y limpiar
    getRoles: () => { const saved = read(K.roles, null); if (!saved) return clone(ROLES); return saved.map(r => { if (r.acceso) return r; const ps = r.permisos || []; const acceso = ps.indexOf('fichas_editar') >= 0 || ps.indexOf('indicadores_editar') >= 0 ? 'editar' : ps.indexOf('fichas_ver') >= 0 ? 'ver' : 'general'; return Object.assign({}, r, { acceso, permisos: ps.filter(p => PERMISOS.some(x => x[0] === p)) }); }); },
    // Nivel efectivo de acceso a fichas de un usuario (rol, o excepción individual u.acceso)
    accesoDe: (u, roles) => { if (u && u.acceso) return u.acceso; const r = (roles || API.getRoles()).find(x => x.id === (u || {}).rol); return r ? (r.acceso || 'general') : 'general'; },
    NOTIF_EVENTOS, NOTIF_CANALES, NOTIF_FREC,
    getNotif: () => { const saved = read(K.notificaciones, null); const base = notifDefault(API.getRoles()); if (!saved) return base; Object.keys(base).forEach(rid => { if (saved[rid]) base[rid] = Object.assign({}, base[rid], saved[rid], { eventos: Object.assign({}, base[rid].eventos, saved[rid].eventos || {}) }); }); return base; },
    getUsuarios: () => read(K.usuarios, null) || clone(USUARIOS),
    getComunidades: () => read(K.comunidades, null) || clone(COMUNIDADES),
    getCatalogos: () => { const saved = read(K.catalogos, null); if (!saved) return clone(CATALOGOS); const byId = {}; saved.forEach(c => { byId[c.id] = c; }); return CATALOGOS.map(c => { const s = byId[c.id]; if (!s) return clone(c); if (!c.fijo) return s; // catálogos fijos: los campos vienen de la ficha; solo se conserva activo/inactivo
        const act = {}; (s.items || []).forEach(i => { act[i.campo || i.id] = i.activo; }); return Object.assign(clone(c), { items: c.items.map(i => Object.assign({}, i, act[i.campo] !== undefined ? { activo: act[i.campo] } : {})) }); }).concat(saved.filter(c => !CATALOGOS.some(d => d.id === c.id))); },
    getBitacora: () => read(K.bitacora, []),
    save: (k, v) => write(K[k], v),
    log: (quien, accion, detalle) => { const b = read(K.bitacora, []); b.unshift({ ts: new Date().toISOString(), quien: quien || 'Administrador', accion, detalle }); write(K.bitacora, b.slice(0, 300)); },
    // permisos efectivos de un usuario: rol + extra − menos
    permisosDe: (u, roles) => { const r = (roles || API.getRoles()).find(x => x.id === u.rol); const base = r ? r.permisos.slice() : []; const set = new Set(base.concat(u.extra || [])); (u.menos || []).forEach(p => set.delete(p)); const acc = API.accesoDe(u, roles); if (acc !== 'general') set.add('fichas_ver'); if (acc === 'editar') { set.add('fichas_editar'); set.add('indicadores_editar'); } return [...set]; },
    // Ítems activos de un catálogo, en orden
    items: (catId) => { const c = API.getCatalogos().find(x => x.id === catId); return c ? c.items.filter(i => i.activo !== false) : []; },
    // Ubicación dependiente de la comunidad
    municipioDe: (com) => { const c = API.getComunidades().find(x => x.id === com); return c ? (c.municipio || '') : ''; },
    coloniasDe: (com) => API.items('colonias').filter(i => !com || i.comunidad === com),
    callesDe: (com, colonia) => API.items('calles').filter(i => (!com || i.comunidad === com) && (!colonia || i.colonia === colonia)),
    slug
  };
  window.P2040Admin = API;
})();
