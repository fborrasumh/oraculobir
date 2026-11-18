/* ══ Datos: el banco oficial (data/bir.json, lo genera la GitHub Action) o, si aún no existe, un DEMO marcado como ficticio ══ */
const ASIGS_BASE = [
  ['bioquimica', 'Bioquímica y Metabolismo'], ['biologia_molecular', 'Biología molecular'], ['genetica', 'Genética'], ['biologia_celular', 'Biología celular e Histología'], ['fisiologia', 'Fisiología'], ['microbiologia', 'Microbiología y Parasitología'], ['inmunologia', 'Inmunología'], ['hematologia', 'Hematología'], ['bioquimica_clinica', 'Bioquímica clínica y Análisis clínicos'], ['tecnicas', 'Técnicas instrumentales y de laboratorio'], ['botanica', 'Botánica y Fisiología vegetal'], ['zoologia', 'Zoología, Evolución y Ecología'], ['farmacologia', 'Farmacología y Toxicología'], ['estadistica', 'Bioestadística y Epidemiología'],
  ['otras', 'Sin clasificar']
].map(([id, nombre]) => ({id, nombre}));

/* DEMO · preguntas ESCRITAS PARA LA DEMOSTRACIÓN (no son preguntas oficiales del BIR); sirven para probar la app sin datos */
const DEMO_PREG = [
  ["bioquimica", "¿En qué compartimento de la célula eucariota tiene lugar el ciclo de Krebs?", ["En el citosol.", "En la matriz mitocondrial.", "En el retículo endoplasmático.", "En la membrana mitocondrial externa."], 2],
  ["bioquimica", "En una enzima que sigue la cinética de Michaelis-Menten, la Km es la concentración de sustrato a la que la velocidad es:", ["Igual a la velocidad máxima.", "La mitad de la velocidad máxima.", "Un cuarto de la velocidad máxima.", "Independiente de la concentración de enzima y nula."], 2],
  ["biologia_molecular", "¿Qué enzima une los fragmentos de Okazaki durante la replicación del ADN?", ["La primasa.", "La helicasa.", "La ADN ligasa.", "La topoisomerasa II."], 3],
  ["genetica", "Dos progenitores sanos son portadores de una enfermedad autosómica recesiva. ¿Qué probabilidad tiene cada hijo de estar afectado?", ["El 25 %.", "El 50 %.", "El 75 %.", "El 100 %."], 1],
  ["biologia_celular", "¿En qué fase del ciclo celular se replica el ADN?", ["G1.", "S.", "G2.", "M."], 2],
  ["fisiologia", "La fase de despolarización rápida del potencial de acción de una neurona se debe principalmente a:", ["La salida de potasio.", "La entrada de sodio.", "La entrada de cloruro.", "La bomba de sodio y potasio."], 2],
  ["microbiologia", "¿Qué componente de la pared celular retiene el cristal violeta en las bacterias grampositivas?", ["Una capa gruesa de peptidoglucano.", "El lipopolisacárido de la membrana externa.", "Las porinas.", "El ácido micólico."], 1],
  ["inmunologia", "¿Qué inmunoglobulina interviene principalmente en las reacciones de hipersensibilidad de tipo I?", ["IgG.", "IgM.", "IgA.", "IgE."], 4],
  ["hematologia", "¿Qué tipo de anemia produce de forma característica el déficit de vitamina B12?", ["Microcítica e hipocrómica.", "Macrocítica (megaloblástica).", "Normocítica hemolítica.", "Sideroblástica."], 2],
  ["tecnicas", "Según la ley de Lambert-Beer, la absorbancia de una disolución es directamente proporcional a:", ["La transmitancia.", "La concentración del analito y la longitud del paso óptico.", "El cuadrado de la concentración del analito.", "La longitud de onda de la radiación."], 2],
  ["botanica", "¿En qué parte del cloroplasto tiene lugar el ciclo de Calvin?", ["En los tilacoides.", "En el estroma.", "En el espacio intermembrana.", "En el lumen tilacoidal."], 2],
  ["estadistica", "En la evaluación de una prueba diagnóstica, ¿cómo se define la sensibilidad?", ["Proporción de sanos con resultado negativo.", "Proporción de positivos que están realmente enfermos.", "Proporción de enfermos con resultado positivo.", "Proporción de negativos que están realmente sanos."], 3]
].map(([asig, enunciado, opciones, correcta], i) => ({id: 'demo-' + (i + 1), anio: 0, n: i + 1, asig, enunciado, opciones, correcta, anulada: false, imagen: false, demo: true}));

/* DEMO · recuentos FICTICIOS de 2015 a 2026 (no son datos reales): solo para ver la predicción funcionando */
function demoConteos() {
  const base = {"bioquimica": 26, "biologia_molecular": 20, "genetica": 22, "biologia_celular": 14, "fisiologia": 16, "microbiologia": 22, "inmunologia": 20, "hematologia": 12, "bioquimica_clinica": 12, "tecnicas": 10, "botanica": 6, "zoologia": 5, "farmacologia": 5, "estadistica": 8};
  const r = rng('demo-oraculobir'), c = {};
  for (let y = 2015; y <= 2026; y++) {
    c[y] = {};
    for (const k in base) { const tr = k === 'genetica' ? (y - 2015) * 0.35 : k === 'botanica' ? -(y - 2015) * 0.25 : 0; c[y][k] = Math.max(0, Math.round(base[k] * 1.05 + tr + (r() - 0.5) * 5)); }
  }
  return c;
}

let DATA = {real: false, asignaturas: ASIGS_BASE, preguntas: DEMO_PREG, conteos: demoConteos(), examenes: [], generado: null};
const nombreAsig = id => t((DATA.asignaturas.find(a => a.id === id) || {nombre: id}).nombre);
/* Carga data/bir.json (mismo origen, en GitHub Pages). Abierta como fichero local o sin datos todavía → DEMO */
async function cargaDatos() {
  try {
    const r = await fetch('data/bir.json', {cache: 'no-cache'});
    if (!r.ok) throw 0;
    const j = await r.json();
    const ps = (j.preguntas || []).filter(q => q && q.enunciado && q.anio);
    if (ps.length < 100) throw 0;
    DATA = {real: true, asignaturas: j.asignaturas || ASIGS_BASE, preguntas: ps, conteos: conteos(ps), examenes: j.examenes || [], generado: j.generado || null, clasificacion: j.clasificacion || ''};
    try { const a = await (await fetch('data/asignaturas.json', {cache: 'no-cache'})).json(); DATA.kws = Object.fromEntries((a.asignaturas || []).map(x => [x.id, x.kw || []])); } catch { DATA.kws = {}; }
  } catch { /* se queda el DEMO */ }
  return DATA;
}
