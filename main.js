// main.js
// Terminal Impérial — Loading Screen (GMod)
// - Logs animés + boot séquence longue
// - Statut/progression via fonctions GMod (gmod.js)
// - Horloge + date CY-47.JJMM.AA (ex: 2101.26)
// - Température “stable” avec extrêmes rares (-20 à -5 / 45 à 60)
// - LEDs (rouge/orange/vert) clignotement aléatoire
// - ID Transport aléatoire + refresh rare

const $ = (id) => document.getElementById(id);

const logEl = $("log");
const statusEl = $("status");
const barEl = $("bar");
const loreEl = $("lore");
const dlEl = $("dl");

const clockEl = $("clock");
const gdateLabelEl = $("gdateLabel");
const tempEl = $("temp");

const sigEl = $("sig");
const pressEl = $("press");
const propEl = $("prop");
const oxyEl = $("oxy");
const energyEl = $("energy");
const armorEl = $("armor");
const aiEl = $("ai");
const transportEl = $("transport");
const sectorEl = $("sector");
const footLeftEl = $("footLeft");

// LEDs (IDs ajoutés dans index.html)
const Lred = $("L_red");
const Lamber = $("L_amber");
const Lgreen = $("L_green");

const state = {
  logs: [],
  maxLines: 16,

  // Situation tactique (sous la console)
  lore: [
    "Transmission cryptée en provenance du Haut Commandement.",
    "Patrouilles de stormtroopers en déploiement.",
    "Alerte de sécurité : niveau de menace contrôlé.",
    "Ordres stratégiques en cours de distribution.",
    "Activité rebelle surveillée.",
    "Flotte impériale en position orbitale."
  ],

  // Messages techniques (bas gauche)
  footLeft: [
    "Réseau holonet sécurisé actif.",
    "Synchronisation des terminaux locaux.",
    "Chiffrement impérial de niveau Alpha.",
    "Flux de données stabilisé.",
    "Canal de commandement opérationnel."
  ],
};

function pad2(n){ return String(n).padStart(2, "0"); }
function randInt(a,b){ return Math.floor(a + Math.random()*(b-a+1)); }

function escapeHtml(s){
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function pushLog(text, cls="line"){
  state.logs.push({ text, cls });
  if(state.logs.length > state.maxLines) state.logs.shift();
  renderLogs();
}

function renderLogs(){
  logEl.innerHTML = state.logs
    .map(l => `<div class="${l.cls}"><span class="dot">›</span> ${escapeHtml(l.text)}</div>`)
    .join("");
}

function setStatus(text){
  statusEl.textContent = text || "Connexion au réseau du Commandement Impérial...";
}

function setProgress(p){
  const clamped = Math.max(0, Math.min(1, p));
  barEl.style.width = `${Math.round(clamped*100)}%`;
}

/* ---------------------------
   Horloge + Date + Temp
---------------------------- */
function updateClock(){
  const d = new Date();
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  clockEl.textContent = `${hh}:${mm}`;

  // Format demandé: CY-47.SEMAINE(2).MOIS(2).ANNÉE(2)
  // Exemple (si on est semaine 21, janvier, 2026) -> CY-47.2101.26
  const cy = 47;

  // Numéro de semaine réelle (ISO 8601 : semaine 01..53, lundi = premier jour)
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;           // dim=7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum); // se cale sur le jeudi (référence ISO)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);

  const ww = pad2(week);
  const mo = pad2(d.getMonth() + 1);
  const yy = String(d.getFullYear()).slice(-2);

  gdateLabelEl.textContent = `[CY-${cy}.${ww}${mo}.${yy}]`;

  // Temp stable au boot, avec extrêmes rares
  if(tempEl.textContent === "--°C"){
    const extreme = Math.random() < 0.15; // 15% extrême
    let t;
    if(extreme){
      t = (Math.random() < 0.5) ? randInt(-20, -5) : randInt(45, 60);
    } else {
      t = randInt(18, 34);
    }
    tempEl.textContent = `${t}°C`;
  }
}
setInterval(updateClock, 1000);
updateClock();


/* ---------------------------
   Téléchargement / Progress
---------------------------- */
function updateDownloadLine(){
  const g = window.__gmod || {};
  const total = g.total || 0;
  const needed = g.needed || 0;
  const file = g.currentFile || "";

  if(total > 0){
    const done = Math.max(0, total - needed);
    const pct = total ? (done / total) : 0;
    setProgress(pct);

    const short = file ? file.split("/").pop() : "";
    dlEl.textContent = short
      ? `Téléchargement : ${short} (${done}/${total})`
      : `Synchronisation des paquets (${done}/${total})`;
  } else {
    dlEl.textContent = "Initialisation des modules...";
    // progression artificielle lente (fallback)
    const w = parseFloat(barEl.style.width || "0") || 0;
    setProgress(((w/100) + 0.0016) % 1);
  }
}

/* ---------------------------
   Micro-vie systèmes
---------------------------- */
function randomizeSystems(){
  // micro-variations crédibles (sans HRP)
  const e = 96 + Math.floor(Math.random()*4); // 96-99
  energyEl.textContent = `${e}%`;

  const modes = ["EN VEILLE", "SURVEILLANCE", "VERROUILLÉE"];
  aiEl.textContent = modes[Math.floor(Math.random()*modes.length)];

  const sig = ["STABLE", "FORT", "SÉCURISÉ"];
  sigEl.textContent = sig[Math.floor(Math.random()*sig.length)];

  // Pression / propulsion restent crédibles et “stables”
  pressEl.textContent = "NORMALE";
  propEl.textContent = "OPTIMALE";
  oxyEl.textContent = "OK";
  armorEl.textContent = "INTACT";
}
setInterval(randomizeSystems, 2200);
randomizeSystems();

/* ---------------------------
   LEDs clignotement random
---------------------------- */
function setLight(el, on){
  if(!el) return;
  el.classList.toggle("on", !!on);
  el.classList.toggle("off", !on);
}

function tickLights(){
  // Vert: souvent ON, Orange: intermittent, Rouge: rare
  const g = Math.random() < 0.78;
  const a = Math.random() < 0.35;
  const r = Math.random() < 0.18;

  setLight(Lgreen, g);
  setLight(Lamber, a);
  setLight(Lred, r);

  setTimeout(tickLights, randInt(180, 950));
}
tickLights();

/* ---------------------------
   ID Transport aléatoire
---------------------------- */
function genTransportId(){
  const prefixes = ["TTR", "TRN", "IMP", "FLT", "GSR"];
  const p = prefixes[randInt(0, prefixes.length-1)];
  const n = randInt(1000, 9999);
  return `${p}-${n}`;
}

if(transportEl){
  transportEl.textContent = genTransportId();
  // refresh rare (pour ne pas “clignoter” le lore)
  setInterval(() => {
    if(Math.random() < 0.35) transportEl.textContent = genTransportId();
  }, randInt(25000, 45000));
}

/* ---------------------------
   Rotations Lore / Footer
---------------------------- */
function rotateLore(){
  loreEl.textContent = state.lore[Math.floor(Math.random()*state.lore.length)];
  footLeftEl.textContent = state.footLeft[Math.floor(Math.random()*state.footLeft.length)];
}
setInterval(rotateLore, 5500);
rotateLore();

/* ---------------------------
   Boot sequence (plus long)
---------------------------- */
const bootSeq = [
  ["Réveil du noyau de sécurité...", "line dim"],
  ["Réseau de commandement impérial détecté.", "line"],
  ["Handshake holonet : canal sécurisé.", "line"],
  ["Synchronisation avec la flotte orbitale...", "line"],
  ["Chargement des protocoles de sécurité ISB...", "line"],
  ["Vérification des autorisations : niveau Alpha...", "line"],
  ["Validation des certificats : chiffrement actif.", "line dim"],
  ["Synchronisation des registres de garnison...", "line"],
  ["Montage des modules tactiques...", "line"],
  ["Alignement des canaux tactiques...", "line"],
  ["Initialisation IFF (ami/ennemi)...", "line"],
  ["Calibration des senseurs & télémétrie...", "line"],
  ["Activation des systèmes de défense de la garnison...", "line"],
  ["Test de continuité : lignes d’énergie.", "line dim"],
  ["Terminal militaire opérationnel.", "line red"],
  ["Accès accordé. Gloire à l’Empire.", "line red"],
];

let i = 0;
const bootTimer = setInterval(() => {
  if(i >= bootSeq.length){
    clearInterval(bootTimer);
    return;
  }
  const [t,c] = bootSeq[i++];
  pushLog(t,c);
}, 780);

/* ---------------------------
   Poll GMod state
---------------------------- */
setInterval(() => {
  const g = window.__gmod || {};

  if(g.status) setStatus(g.status);
  updateDownloadLine();

  // Log file sync (une ligne par nouveau fichier)
  if(g.currentFile && g.currentFile !== window.__lastFile){
    window.__lastFile = g.currentFile;
    const short = g.currentFile.split("/").pop();
    pushLog(`Synchronisation : ${short}`, "line dim");
  }
}, 120);
