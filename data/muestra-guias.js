// Muestra ampliada (determinística): completa ~70 hogares por guía, con relaciones e historial de visitas.
(function () {
  const GUIAS = { CC: ['Guía Cecilia', 'Guía Rosa', 'Guía Patricia', 'Guía Lorena', 'Guía Beatriz'], CI: ['Guía Adriana', 'Guía Gabriela', 'Guía Laura'] };
  const META = 70, CORTE = '2026-06-28', DESDE = '2025-07';
  const NF = ['María', 'Ana', 'Lucía', 'Fernanda', 'Daniela', 'Valeria', 'Ximena', 'Sofía', 'Camila', 'Regina', 'Paola', 'Karen', 'Leticia', 'Rosa', 'Alma', 'Brenda', 'Claudia', 'Diana', 'Elena', 'Gabriela', 'Itzel', 'Jazmín', 'Mónica', 'Nancy', 'Perla', 'Sandra', 'Yolanda', 'Zulema', 'Renata', 'Natalia', 'Abril', 'Romina', 'Victoria', 'Mariana', 'Andrea', 'Fátima'];
  const NM = ['José', 'Juan', 'Luis', 'Carlos', 'Jorge', 'Miguel', 'Pedro', 'Ricardo', 'Óscar', 'Raúl', 'Sergio', 'Alejandro', 'Daniel', 'Eduardo', 'Fernando', 'Héctor', 'Iván', 'Javier', 'Mateo', 'Santiago', 'Emiliano', 'Diego', 'Leonardo', 'Sebastián', 'Gael', 'Iker', 'Tadeo', 'Matías', 'Ángel', 'Adrián', 'Bruno', 'Thiago', 'Rodrigo', 'Hugo'];
  const AP = ['García', 'Hernández', 'Martínez', 'López', 'González', 'Rodríguez', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Morales', 'Cruz', 'Ortiz', 'Gutiérrez', 'Chávez', 'Ramos', 'Ruiz', 'Mendoza', 'Aguilar', 'Castillo', 'Vázquez', 'Guerrero', 'Medina', 'Rangel', 'Villarreal', 'Garza', 'Treviño', 'Cantú', 'Elizondo', 'Salinas', 'Leal', 'Saucedo', 'Zertuche', 'Valdés', 'Galindo'];
  const CALLES = ['Morelos', 'Hidalgo', 'Zaragoza', 'Juárez', 'Allende', 'Madero', 'Carranza', 'Escobedo', 'Abasolo', 'Aldama', 'Guerrero', 'Matamoros', 'Galeana', 'Bravo', 'Victoria', 'Ocampo', 'Mina', 'Degollado', 'Iturbide', 'Corregidora'];
  const COLS = { CC: ['Centro', 'Venustiano Carranza', 'El Cuije', 'Lázaro Cárdenas', 'Las Palmas', 'El Mirador', 'San José', 'Santa Teresa'], CI: ['Colonia Independencia', 'Loma Larga', 'Tanques de Guadalupe', 'San Isidro', 'El Mirador', 'Nuevo Repueblo'] };
  const C0 = { CC: [26.9869, -102.0653], CI: [25.6590, -100.3250] };
  const LOC = { CC: { conditionName: 'Coahuila', municipalityName: 'Cuatro Ciénegas de Carranza', localityName: 'Cuatro Ciénegas', cp: '27640' }, CI: { conditionName: 'Nuevo León', municipalityName: 'Monterrey', localityName: 'Monterrey', cp: '64720' } };
  const TEMAS = { '0-1': ['Carpeta 0-1 año: Apego seguro', 'Carpeta 0-1 año: Lactancia'], '1-3': ['Carpeta 1-3 años: Juego y estimulación', 'Carpeta 1-3 años: Mis primeras palabras'], '3-5': ['Carpeta 3-5 años: Mis emociones', 'Carpeta 3-5 años: Hábitos saludables'], '6-8': ['Carpeta 6-8 años: Identidad Familiar', 'Carpeta 6-8 años: Mis creencias'], '9-12': ['Carpeta 9-12 años: Proyecto de vida', 'Carpeta 9-12 años: Mis emociones'], emb: ['Carpeta Embarazo: Mi embarazo saludable', 'Carpeta Embarazo: Preparándonos para el parto'], gen: ['Generales: Sueño y Plan de Vida'] };
  const PIL = ['Educación', 'Salud', 'Familia', 'Espiritualidad', 'Economía Familiar'];
  const GR = [['preescolarGrade', 3, 3], ['primariaGrade', 6, 6], ['secondaryGrade', 3, 12]];

  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const pad = n => String(n).padStart(2, '0');
  const ageStr = dob => { const a = new Date(dob + 'T12:00:00'), b = new Date(CORTE + 'T12:00:00'); let m = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth(); if (b.getDate() < a.getDate()) m--; return Math.floor(m / 12) + ' años ' + (m % 12) + ' meses'; };
  const dobDe = (R, years) => { const d = new Date(CORTE + 'T12:00:00'); d.setDate(d.getDate() - Math.round(years * 365.25)); return d.toISOString().slice(0, 10); };
  const edadEn = (dob, ym) => { const a = new Date(dob + 'T12:00:00'), b = new Date(ym + '-15T12:00:00'); return (b - a) / (365.25 * 86400000); };
  const temaDe = age => age < 1 ? '0-1' : age < 3 ? '1-3' : age < 6 ? '3-5' : age < 9 ? '6-8' : '9-12';

  function expandir(data) {
    if (!data || data._muestraGuias) return data;
    const ps = data.personas, fams = data.familias;
    const byId = {}; ps.forEach(p => { byId[p['ID-COMUNIDAD']] = p; });
    const cuenta = {};
    fams.forEach(fr => { const g = new Set(String(fr.ids_integrantes || '').split(';').map(id => byId[id] && byId[id].responsibleName).filter(Boolean)); g.forEach(x => { cuenta[x] = (cuenta[x] || 0) + 1; }); });
    // centros por colonia (de los hogares existentes)
    const cen = {}; fams.forEach(fr => { if (fr.lat && fr.colonia) { const k = (fr.comunidad || 'CC') + '|' + fr.colonia; (cen[k] = cen[k] || []).push([fr.lat, fr.lng]); } });
    const centro = (com, col) => { const c = cen[com + '|' + col]; if (c) return [c.reduce((s, p) => s + p[0], 0) / c.length, c.reduce((s, p) => s + p[1], 0) / c.length]; const h = hash(com + col); return [C0[com][0] + ((h % 160) - 80) / 10000, C0[com][1] + (((h >> 8) % 180) - 90) / 10000]; };
    let seq = 8000;
    const meses = []; { const d = new Date(DESDE + '-15T12:00:00'); while (d.toISOString().slice(0, 7) <= CORTE.slice(0, 7)) { meses.push(d.toISOString().slice(0, 7)); d.setMonth(d.getMonth() + 1); } }
    Object.keys(GUIAS).forEach(com => GUIAS[com].forEach(guia => {
      const R = rng(hash(guia));
      const n = Math.max(0, META - (cuenta[guia] || 0));
      const zonas = COLS[com].slice().sort((a, b) => hash(guia + a) - hash(guia + b)).slice(0, 3);
      for (let i = 0; i < n; i++) {
        const pick = arr => arr[Math.floor(R() * arr.length)];
        const col = R() < 0.8 ? zonas[i % 2] : zonas[2];
        const ap1 = pick(AP), ap2 = pick(AP), apM = pick(AP);
        const fid = 'mg_' + hash(guia) + '_' + i;
        const ms = [];
        const mk = (o) => { const id = String(++seq); const p = Object.assign({ 'ID-COMUNIDAD': id, crmId: String(seq), status: 'Activo', responsibleName: guia, comunidad: com, familyId: fid, colonyName: col, street: calle, outdoorNumber: num, religionName: 'Católico', createdtime: alta + 'T10:00:00', relaciones: {}, acompanamientos: [], _muestraGuias: true }, LOC[com], o); p.fullName = [p.name, p.lastName, p.motherLastName].join(' '); p.age = p.dateOfBirth ? ageStr(p.dateOfBirth) : null; p.persona_2040_2 = p.persona_2040; if (p.persona_2040 === 'P2040') p._vacPct = 75 + Math.floor(R() * 26); ms.push(p); return p; };
        const calle = pick(CALLES), num = String(10 + Math.floor(R() * 890));
        const alta = (2022 + Math.floor(R() * 3)) + '-' + pad(1 + Math.floor(R() * 12)) + '-' + pad(1 + Math.floor(R() * 27));
        // niños P2040
        const r = R(); const youngest = r < 0.2 ? R() * 1.5 : r < 0.42 ? 1.5 + R() * 2.5 : r < 0.64 ? 4 + R() * 3 : 7 + R() * 4.5;
        const nK = 1 + Math.floor(R() * 2.6);
        const kids = []; let ag = youngest; for (let k = 0; k < nK; k++) { if (ag > 12.8) break; kids.push(ag); ag += 2 + R() * 2.5; }
        const mamaAge = Math.max(19, kids[kids.length - 1] + 18 + R() * 10);
        const conPapa = R() < 0.6, conAbuela = R() < 0.15, emb = R() < 0.13 && mamaAge < 40;
        const fum = emb ? '2026-' + pad(3 + Math.floor(R() * 6)) + '-' + pad(1 + Math.floor(R() * 27)) : null;
        const mama = mk({ name: pick(NF), lastName: apM, motherLastName: pick(AP), sex: 'Femenino', dateOfBirth: dobDe(R, mamaAge), persona_2040: 'F2040', relationName: 'Mamá', maritalStatusName: conPapa ? (R() < 0.5 ? 'Casada/o' : 'Unión libre') : pick(['Soltera/o', 'Separada/o', 'Madre soltera']), phone: '8' + Math.floor(100000000 + R() * 899999999), pregnant: emb ? 'Si' : 'No',
          pilares: { Salud: Object.assign({ healthInsuranceName: pick(['IMSS', 'Sec.Salud/INSABI', 'IMSS', 'No tiene']) }, emb ? { pregnant: 'Si', pregnancyType: 'Normal', highRiskPregnancy: R() < 0.25 ? 'Si' : 'No', fum, controlPrenatal: 'Si', numConsultas: 1 + Math.floor(R() * 5), lastConsultationDate: '2026-06-' + pad(2 + Math.floor(R() * 25)) } : {}), 'Educación': { schoolLevelName: pick(['Primaria', 'Secundaria', 'Preparatoria']) }, Espiritualidad: { religionName: 'Católico' }, 'Economía Familiar': { occupationName: pick(['Hogar', 'Empleada', 'Comerciante', 'Trabajadora doméstica']) }, Familia: {} } });
        const papa = conPapa ? mk({ name: pick(NM), lastName: ap1, motherLastName: ap2, sex: 'Masculino', dateOfBirth: dobDe(R, mamaAge + R() * 6), persona_2040: 'F2040', relationName: 'Papá', maritalStatusName: mama.maritalStatusName, pilares: { Salud: {}, 'Educación': {}, Espiritualidad: { religionName: 'Católico' }, 'Economía Familiar': { occupationName: pick(['Obrero', 'Albañil', 'Chofer', 'Comerciante', 'Empleado']) }, Familia: {} } }) : null;
        const abuela = conAbuela ? mk({ name: pick(NF), lastName: mama.motherLastName, motherLastName: pick(AP), sex: 'Femenino', dateOfBirth: dobDe(R, mamaAge + 22 + R() * 8), persona_2040: 'F2040', relationName: 'Abuelo(a)', maritalStatusName: 'Viuda/o', pilares: { Salud: {}, 'Educación': {}, Espiritualidad: {}, 'Economía Familiar': {}, Familia: {} } }) : null;
        const hijos = kids.map(a => { const sx = R() < 0.5 ? 'Femenino' : 'Masculino'; const dob = dobDe(R, a); const p = mk({ name: pick(sx === 'Femenino' ? NF : NM), lastName: conPapa ? ap1 : apM, motherLastName: conPapa ? apM : pick(AP), sex: sx, dateOfBirth: dob, persona_2040: 'P2040', relationName: 'Hijo/a (P2040)', maritalStatusName: 'Soltero/a', myDream: R() < 0.4 ? pick(['Que estudie una carrera', 'Ser maestra', 'Ser doctor', 'Que sea feliz y sano', 'Ser ingeniero']) : null, schoolLevelName: a < 3 ? 'Sin estudios' : a < 6 ? 'Preescolar' : a < 12 ? 'Primaria' : 'Secundaria',
          ultima_estatura: Math.round(50 + a * 6.5), ultimo_peso: +(3.5 + a * 2.6).toFixed(1),
          pilares: { Salud: { healthInsuranceName: mama.pilares.Salud.healthInsuranceName, ultima_estatura: Math.round(50 + a * 6.5), ultimo_peso: +(3.5 + a * 2.6).toFixed(1) }, 'Educación': { consentimientoSep: a >= 3 ? 'Firmado' : null }, Espiritualidad: { religionName: 'Católico', christening: R() < 0.7 ? 'Si' : null, firstCommunion: a >= 9 && R() < 0.6 ? 'Si' : null }, 'Economía Familiar': {}, Familia: { parentCivilStateName: conPapa ? 'Unión libre' : 'Madre soltera' } } });
          GR.forEach(([k, nG, desde]) => { for (let g = 1; g <= nG; g++) p[k + g] = a >= desde + g ? 'Si' : 'No'; });
          return { p, a }; });
        // relaciones dentro del hogar
        const rel = (a, b, t, inv) => { a.relaciones[b['ID-COMUNIDAD']] = t; b.relaciones[a['ID-COMUNIDAD']] = inv; };
        hijos.forEach((h, x) => { rel(h.p, mama, 'Mamá', 'Hijo(a)'); if (papa) rel(h.p, papa, 'Papá', 'Hijo(a)'); if (abuela) rel(h.p, abuela, 'Abuelo(a)', 'Nieto(a)'); hijos.slice(x + 1).forEach(o => rel(h.p, o.p, 'Hermano(a)', 'Hermano(a)')); });
        if (papa) rel(mama, papa, 'Pareja', 'Pareja'); if (abuela) { rel(mama, abuela, 'Mamá', 'Hijo(a)'); if (papa) rel(papa, abuela, 'Otro', 'Otro'); }
        // perfiles relacionados (no viven en el hogar): R2040 papá biológico / abuela; C2040 madrina de la comunidad
        const relacionados = [];
        const mkRel = o => { const id = String(++seq); const p = Object.assign({ 'ID-COMUNIDAD': id, crmId: String(seq), status: 'Activo', responsibleName: guia, comunidad: com, familyId: null, religionName: 'Católico', createdtime: alta + 'T10:00:00', relaciones: {}, acompanamientos: [], _muestraGuias: true, pilares: { Salud: {}, 'Educación': {}, Espiritualidad: {}, 'Economía Familiar': {}, Familia: {} } }, LOC[com], o); p.fullName = [p.name, p.lastName, p.motherLastName].join(' '); p.age = p.dateOfBirth ? ageStr(p.dateOfBirth) : null; p.persona_2040_2 = p.persona_2040; relacionados.push(p); return p; };
        if (!conPapa && R() < 0.55) { const pb = mkRel({ name: pick(NM), lastName: hijos[0].p.lastName === apM ? pick(AP) : hijos[0].p.lastName, motherLastName: pick(AP), sex: 'Masculino', dateOfBirth: dobDe(R, mamaAge + 2 + R() * 6), persona_2040: 'R2040', relationName: 'Papá', maritalStatusName: pick(['Separada/o', 'Soltera/o']), phone: R() < 0.5 ? '8' + Math.floor(100000000 + R() * 899999999) : null });
          hijos.forEach(h => rel(h.p, pb, 'Papá', 'Hijo(a)')); }
        if (!conAbuela && R() < 0.25) { const ab = mkRel({ name: pick(NF), lastName: mama.motherLastName, motherLastName: pick(AP), sex: 'Femenino', dateOfBirth: dobDe(R, mamaAge + 24 + R() * 8), persona_2040: 'R2040', relationName: 'Abuelo(a)', maritalStatusName: 'Casada/o' });
          hijos.forEach(h => rel(h.p, ab, 'Abuelo(a)', 'Nieto(a)')); rel(mama, ab, 'Mamá', 'Hijo(a)'); }
        if (R() < 0.12) { const md = mkRel({ name: pick(NF), lastName: pick(AP), motherLastName: pick(AP), sex: 'Femenino', dateOfBirth: dobDe(R, 30 + R() * 25), persona_2040: 'C2040', relationName: 'Otro', maritalStatusName: 'Casada/o' });
          rel(hijos[0].p, md, 'Otro', 'Otro'); }
        // historial de visitas (mensual; bimestral si el menor tiene 7+, por grupo)
        const grupo = hash(fid) % 2 ? 'A' : 'B';
        const foco = hijos.map(h => h.p).concat(emb ? [mama] : []);
        let previa = false;
        meses.forEach(ym => {
          if (ym < alta.slice(0, 7)) return;
          const menor = Math.min(...hijos.map(h => edadEn(h.p.dateOfBirth, ym)));
          const embMes = emb && ym >= fum.slice(0, 7);
          const bim = menor >= 7 && !embMes;
          const turno = !bim || (((+ym.slice(5, 7)) % 2 ? 'A' : 'B') === grupo) || !previa;
          if (!turno) { previa = false; return; }
          const u = R(); if (u > 0.9) { previa = false; return; }
          const noLoc = u > 0.83;
          let day = 3 + Math.floor(R() * 24); let dt = new Date(ym + '-' + pad(day) + 'T12:00:00'); while (dt.getDay() === 0 || dt.getDay() === 6) dt.setDate(dt.getDate() + 1);
          const fecha = dt.toISOString().slice(0, 10);
          if (fecha > CORTE) return;
          const pil = PIL[Math.floor(R() * PIL.length)];
          foco.forEach(p => { const a = p === mama ? null : edadEn(p.dateOfBirth, ym); const tl = a == null ? TEMAS.emb : TEMAS[temaDe(a)];
            p.acompanamientos.push({ medio: 'Visitas formativas', pilar: pil, fecha: fecha + ' 00:00:00', tipo: 'Visita presencial', tema: R() < 0.12 ? TEMAS.gen[0] : tl[Math.floor(R() * tl.length)], guia, localizada: noLoc ? 'No' : 'Si', origen: 'visitas' }); });
          previa = !noLoc;
        });
        ms.forEach(p => { p.ultimaVisita = p.acompanamientos.filter(a => a.localizada === 'Si').map(a => a.fecha.slice(0, 10)).sort().pop() || null;
          p.documentos = [{ crmId: p.crmId, fullName: p.fullName, birthCertificate: R() < 0.7 ? 'SI' : 'NO', curpFile: R() < 0.75 ? 'SI' : 'NO', photo: R() < 0.6 ? 'SI' : 'NO', photoUbicacion: R() < 0.5 ? 'SI' : 'NO', fotoIne: R() < 0.5 ? 'SI' : 'NO', semana_reporte_archivo: 26 }]; });
        const nombre = 'Familia ' + (conPapa ? ap1 + ' ' + apM : apM);
        const ids = ms.map(p => p['ID-COMUNIDAD']);
        ms.forEach(p => { p.familyname = nombre; p.familia = { familyId: fid, familia: nombre, comunidad: com, ids_integrantes: ids }; });
        const c = centro(com, col);
        fams.push({ familyId: fid, familia: nombre, comunidad: com, tipo: abuela ? 'Extensa' : conPapa ? 'Nuclear' : 'Monoparental', integrantes_en_muestra: ids.length, integrantes_en_semana26: ids.length, ids_integrantes: ids.join(';'),
          colonia: col, direccion: calle + ' ' + num, lat: +(c[0] + (R() - 0.5) * 0.006).toFixed(6), lng: +(c[1] + (R() - 0.5) * 0.006).toFixed(6), _muestraGuias: true });
        ms.forEach(p => ps.push(p)); relacionados.forEach(p => { p.documentos = [{ crmId: p.crmId, fullName: p.fullName, semana_reporte_archivo: 26 }]; ps.push(p); });
      }
    }));
    data.total_personas = ps.length; data.total_familias = fams.length; data._muestraGuias = true;
    return data;
  }
  window.P2040Muestra = { expandir };
})();
