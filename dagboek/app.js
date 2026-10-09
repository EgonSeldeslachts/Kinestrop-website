/* ==========================================================================
   Kinestrop Patiënten Dagboek — Application JavaScript
   Features: LocalStorage CRUD, Pacing & Status Logic, ACT Tracking,
             Dynamic Advice & Exercises Engine, Trends & PDF Export
   ========================================================================== */

const STORAGE_KEY = 'kinestrop_patient_dagboek_v1';

// Preset Exercises Database categorized by load & therapeutic goal
const EXERCISE_DATABASE = {
  anchor: [
    {
      id: 'anc_1',
      title: '3-2-1 Zintuigenanker (contact met het hier-en-nu)',
      category: 'Ankeroefening & rust',
      duration: '3 minuten',
      badgeClass: 'badge-recovery',
      desc: 'Kan overdag zittend of staand. Benoem in stilte: 3 dingen die je rondom je ziet, 2 dingen die je fysiek voelt (je voeten op de grond, je kleding op je huid), en 1 geluid dat je hoort. Adem daarna één keer rustig en diep uit. Dit haalt je brein direct uit de pieker- of alertheidsmodus en brengt je terug naar het hier-en-nu.'
    }
  ],
  somatic: [
    {
      id: 'som_1',
      title: 'Lichaamssensaties observeren zonder alarm (somatic tracking)',
      category: 'Pijndemping & veiligheid',
      duration: '5 minuten',
      badgeClass: 'badge-recovery',
      desc: 'Ga ontspannen zitten of liggen. Richt je aandacht met open, neutrale nieuwsgierigheid op de plek die gevoelig is. Observeer de fysieke sensatie (warmte, spanning, tinteling of dof gevoel) zonder ertegen te vechten. Herinner jezelf eraan: "Mijn zenuwstelsel stuurt een overbeschermend alarmsignaal, maar er is nu geen weefselschade of gevaar." Adem rustig door en laat de sensatie er gewoon even zijn.'
    }
  ],
  recovery: [
    {
      id: 'rec_1',
      title: 'Rustige buikademhaling (4-7-8)',
      category: 'Herstel & rust',
      duration: '5 minuten',
      badgeClass: 'badge-recovery',
      desc: 'Ga comfortabel op je rug liggen met je knieën geplooid en je voeten plat op de grond. Adem 4 seconden rustig in via je neus naar je buik, houd 7 seconden ontspannen vast, en blaas zachtjes in 8 seconden uit via de mond. Dit brengt je zenuwstelsel tot rust en verlaagt je spierspanning.'
    },
    {
      id: 'rec_2',
      title: 'Ontspannen ruglig (met geplooide knieën)',
      category: 'Rugontlasting',
      duration: '10 minuten',
      badgeClass: 'badge-recovery',
      desc: 'Ga op je rug liggen op een matje of tapijt met je voeten plat op de grond en je knieën geplooid op heupbreedte. Leg je handen rustig op je onderbuik. Laat de zwaartekracht je rug ontspannen zonder ergens tegenaan te duwen.'
    },
    {
      id: 'rec_3',
      title: 'Lichaamsverkenning (aandachtsoefening)',
      category: 'Mentale rust',
      duration: '7 minuten',
      badgeClass: 'badge-recovery',
      desc: 'Breng rustig je aandacht achtereenvolgens naar je voeten, benen, heupen, rug, schouders en kaken. Merk eventuele spanning op zonder oordeel, en stel je voor dat je die bij elke uitademing zachtjes loslaat.'
    }
  ],
  mobility: [
    {
      id: 'mob_1',
      title: 'Rug hol en bol maken (op handen en knieën)',
      category: 'Zachte mobilisatie',
      duration: '2x 8 herhalingen',
      badgeClass: 'badge-mobility',
      desc: 'Ga op handen en knieën zitten. Maak je rug langzaam en rustig bol (kin richting je borst) en laat je rug daarna zachtjes weer wat doorzakken (kijk lichtjes vooruit). Beweeg vloeiend binnen een comfortabele grens.'
    },
    {
      id: 'mob_2',
      title: 'Bekken kantelen in ruglig',
      category: 'Lendenmobilisatie',
      duration: '2x 10 herhalingen',
      badgeClass: 'badge-mobility',
      desc: 'Ga op je rug liggen met geplooide knieën en je voeten plat op de ondergrond. Duw je onderrug zachtjes plat tegen de mat door je buikspieren licht aan te spannen, en kantel daarna je bekken rustig de andere kant op zodat er een kleine holte ontstaat. Beweeg rustig en ritmisch.'
    },
    {
      id: 'mob_3',
      title: 'Borstkas en schouders openen',
      category: 'Houdingswissel',
      duration: '3x 30 seconden',
      badgeClass: 'badge-mobility',
      desc: 'Ga rechtop zitten op de rand van een stoel of ga staan. Breng je armen wijd opzij, open je borstkas en adem rustig diep in. Breng daarna je armen rustig naar voren en omarm jezelf even zachtjes.'
    }
  ],
  strength: [
    {
      id: 'str_1',
      title: 'Opstaan en gaan zitten uit een stoel (stoel-squat)',
      category: 'Actieve opbouw',
      duration: '2x 8 herhalingen',
      badgeClass: 'badge-strength',
      desc: 'Sta rustig op uit een stoel (probeer dit zonder steun van je handen als dat vlot lukt), strek je lichaam volledig op, en ga gecontroleerd weer zitten. Dit bouwt beenspierkracht en dagelijkse belastbaarheid op.'
    },
    {
      id: 'str_2',
      title: 'Bekkentillen in ruglig (bruggetje)',
      category: 'Heup- & bilspieren',
      duration: '2x 10 herhalingen',
      badgeClass: 'badge-strength',
      desc: 'Ga op je rug liggen met je knieën geplooid en je voeten plat op de grond. Duw op je hielen en hef je bekken op tot je schouders, heupen en knieën min of meer één rechte lijn vormen. Knijp de billen kort aan en laat rustig weer zakken.'
    },
    {
      id: 'str_3',
      title: 'Gedoseerd wandelen met rustpauze',
      category: 'Conditie & dosering',
      duration: '15–20 minuten',
      badgeClass: 'badge-strength',
      desc: 'Wandel in een ontspannen tempo buitenshuis. Neem halverwege bewust 2 minuten rust op een bankje, vóórdat je vermoeid raakt of klachten opkomen. Zo bouw je je uithoudingsvermogen veilig op.'
    }
  ]
};

// Application State
let appData = loadFromStorage();
let selectedDate = getTodayFormatted();
let currentTab = 'tab-entry';

// Init on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initDateSelector();
  initTabs();
  initSliders();
  loadDateEntryIntoForm(selectedDate);
  renderAdviceTab();
  renderHistoryTab();
  renderExportTab();

  // Form Submit Handler
  const form = document.getElementById('daily-entry-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Print Button Handler
  const printBtn = document.getElementById('print-export-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  // Clear / Reset Handler
  const clearBtn = document.getElementById('clear-data-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClearData);
  }
});

/* ==========================================================================
   LocalStorage Management
   ========================================================================== */
function loadFromStorage() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : {};
  } catch (e) {
    console.error('Fout bij laden van dagboekdata:', e);
    return {};
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  } catch (e) {
    console.error('Fout bij opslaan van dagboekdata:', e);
  }
}

/* ==========================================================================
   Date & UI Helpers
   ========================================================================== */
function getTodayFormatted() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDutchDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const d = new Date(year, month - 1, day);
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString('nl-BE', options);
}

function initDateSelector() {
  const dateInput = document.getElementById('entry-date');
  if (dateInput) {
    dateInput.value = selectedDate;
    dateInput.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      loadDateEntryIntoForm(selectedDate);
      renderAdviceTab();
    });
  }
}

function initTabs() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });

  if (tabId === 'tab-advice') renderAdviceTab();
  if (tabId === 'tab-history') renderHistoryTab();
  if (tabId === 'tab-export') renderExportTab();
}

function initSliders() {
  const sliders = [
    { id: 'sleep-duration', badgeId: 'sleep-duration-val', suffix: ' uur' },
    { id: 'energy-level', badgeId: 'energy-level-val', suffix: '%' },
    { id: 'pain-level', badgeId: 'pain-level-val', suffix: '/10' }
  ];

  sliders.forEach(s => {
    const input = document.getElementById(s.id);
    const badge = document.getElementById(s.badgeId);
    if (input && badge) {
      input.addEventListener('input', () => {
        badge.textContent = input.value + s.suffix;
      });
    }
  });
}

/* ==========================================================================
   Form State & Calculations
   ========================================================================== */
function loadDateEntryIntoForm(dateStr) {
  const entry = appData[dateStr] || {};

  // Slaap
  document.getElementById('sleep-duration').value = entry.sleepDuration || 7;
  document.getElementById('sleep-duration-val').textContent = (entry.sleepDuration || 7) + ' uur';
  
  setRadioValue('sleepQuality', entry.sleepQuality || '3');
  setRadioValue('sleepRecovery', entry.sleepRecovery || 'matig');
  setRadioValue('sleepRegularity', entry.sleepRegularity || 'ja');

  // Pacing & Energie
  document.getElementById('energy-level').value = entry.energyLevel || 60;
  document.getElementById('energy-level-val').textContent = (entry.energyLevel || 60) + '%';
  setRadioValue('pacingBalance', entry.pacingBalance || 'balanced');

  const totalLoad = entry.totalLoadVectors || [];
  document.querySelectorAll('input[name="totalLoadVectors"]').forEach(cb => {
    cb.checked = totalLoad.includes(cb.value) || (cb.value === 'Mentale druk & spanning' && totalLoad.includes('Emotionele stress'));
  });

  // Klachten & Stijfheidsperceptie
  document.getElementById('pain-level').value = entry.painLevel || 3;
  document.getElementById('pain-level-val').textContent = (entry.painLevel || 3) + '/10';
  setRadioValue('stiffnessPerception', entry.stiffnessPerception || 'geen');

  // Body regions (checkboxes)
  const regions = entry.bodyRegions || [];
  document.querySelectorAll('input[name="bodyRegions"]').forEach(cb => {
    cb.checked = regions.includes(cb.value);
  });

  // Committed Action & Self-Efficacy
  document.getElementById('act-goal').value = entry.actGoal || '';
  document.getElementById('act-step').value = entry.actStep || '';
  setRadioValue('actCompleted', entry.actCompleted || 'gepland');
  setRadioValue('selfEfficacy', entry.selfEfficacy || 'volledig');
  document.getElementById('reflection-notes').value = entry.reflectionNotes || '';
}

function handleFormSubmit(e) {
  e.preventDefault();

  const bodyRegions = Array.from(document.querySelectorAll('input[name="bodyRegions"]:checked'))
    .map(cb => cb.value);

  const totalLoadVectors = Array.from(document.querySelectorAll('input[name="totalLoadVectors"]:checked'))
    .map(cb => cb.value);

  const entry = {
    date: selectedDate,
    sleepDuration: parseFloat(document.getElementById('sleep-duration').value),
    sleepQuality: getRadioValue('sleepQuality'),
    sleepRecovery: getRadioValue('sleepRecovery'),
    sleepRegularity: getRadioValue('sleepRegularity'),
    energyLevel: parseInt(document.getElementById('energy-level').value),
    pacingBalance: getRadioValue('pacingBalance'),
    totalLoadVectors: totalLoadVectors,
    painLevel: parseInt(document.getElementById('pain-level').value),
    stiffnessPerception: getRadioValue('stiffnessPerception'),
    bodyRegions: bodyRegions,
    actGoal: document.getElementById('act-goal').value.trim(),
    actStep: document.getElementById('act-step').value.trim(),
    actCompleted: getRadioValue('actCompleted'),
    selfEfficacy: getRadioValue('selfEfficacy'),
    reflectionNotes: document.getElementById('reflection-notes').value.trim(),
    completedExercises: appData[selectedDate]?.completedExercises || []
  };

  appData[selectedDate] = entry;
  saveToStorage();
  showToast('Dagboek succesvol opgeslagen! ✓');
  
  // Automatisering: Schakel door naar advies tab
  setTimeout(() => {
    switchTab('tab-advice');
  }, 700);
}

function calculateDayStatus(entry) {
  if (!entry) return 'orange';

  const energy = entry.energyLevel || 50;
  const pain = entry.painLevel || 3;
  const pacing = entry.pacingBalance;
  const sleepRec = entry.sleepRecovery;
  const totalLoadCount = (entry.totalLoadVectors || []).length;
  const stiffness = entry.stiffnessPerception;

  // Criteria for RED (Herstel & Pacing nodig - verhoogd als Total Load of Stijfheid hoog zijn)
  if (energy < 40 || pain >= 6 || pacing === 'overdone' || sleepRec === 'onuitgerust' || totalLoadCount >= 3 || stiffness === 'hoog') {
    return 'red';
  }
  // Criteria for GREEN (Goede energie & Balans)
  if (energy >= 70 && pain <= 3 && (pacing === 'balanced' || pacing === 'underdone') && sleepRec === 'uitgerust' && totalLoadCount <= 1) {
    return 'green';
  }
  // Default ORANGE (Doseerbaar bewegen)
  return 'orange';
}

/* ==========================================================================
   Tab 2: Advice & Exercise Engine Rendering
   ========================================================================== */
function renderAdviceTab() {
  const entry = appData[selectedDate];
  const container = document.getElementById('advice-container');
  if (!container) return;

  if (!entry) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px 20px;">
        <h3 style="font-family: var(--font-heading); font-weight: 600; color: var(--brand-primary); margin-bottom: 8px;">Nog geen dagboekgegevens voor vandaag</h3>
        <p style="color: var(--ink-muted); max-width: 480px; margin: 0 auto 18px auto; font-size: 0.9rem; line-height: 1.55;">
          Vul eerst je gegevens in bij "Dagboek" voor ${formatDutchDate(selectedDate)}. Op basis van je slaap, energie en klachten verschijnen hier passende doseer- en bewegingssuggesties.
        </p>
        <button class="btn-primary" onclick="switchTab('tab-entry')" style="width: auto;">
          Naar Dagboek
        </button>
      </div>
    `;
    return;
  }

  const status = calculateDayStatus(entry);
  const pain = Number(entry.painLevel) || 0;
  const stiffness = entry.stiffnessPerception || 'geen';
  const totalLoad = entry.totalLoadVectors || [];
  const hasMentalLoad = totalLoad.some(v => v.includes('Emotioneel') || v.includes('Mentaal') || v.includes('Sensorisch'));
  const hasHighPainOrInterference = pain >= 5 || stiffness === 'hoog' || entry.pacingBalance === 'overdone';

  let extraAdviceTip = '';
  if (hasHighPainOrInterference) {
    extraAdviceTip = `
      <div style="margin-top: 10px; padding: 10px 14px; background: rgba(255,255,255,0.7); border-radius: 6px; font-size: 0.88rem; color: var(--ink-base); border-left: 3px solid #6366F1;">
        💡 <strong>Aanbevolen bij verhoogde gevoeligheid:</strong> We hebben de <em>somatic tracking</em> oefening toegevoegd. Hiermee observeer je de fysieke sensatie met neutrale nieuwsgierigheid, waardoor je brein leert dat het alarmsignaal veilig is en niet wijst op acute schade.
      </div>
    `;
  } else if (hasMentalLoad) {
    extraAdviceTip = `
      <div style="margin-top: 10px; padding: 10px 14px; background: rgba(255,255,255,0.7); border-radius: 6px; font-size: 0.88rem; color: var(--ink-base); border-left: 3px solid #0EA5E9;">
        💡 <strong>Aanbevolen bij mentale drukte of spanning:</strong> Het <em>3-2-1 zintuigenanker</em> kun je overdag op elk moment zittend of staand uitvoeren om je zenuwstelsel direct te aarden in het hier-en-nu.
      </div>
    `;
  }

  let bannerHTML = '';
  let exercisesToDisplay = [];

  if (status === 'red') {
    bannerHTML = `
      <div class="status-banner red">
        <div class="status-banner-header">
          <h3>Aandachtspunt: Herstel en rust</h3>
          <span class="status-pill-badge red">Herstelfase</span>
        </div>
        <div class="status-text">
          <p>
            Je energie en klachten wijzen op een verlaagde draagkracht. Vandaag is het zinvol om piekbelastingen te vermijden en het zenuwstelsel rust te gunnen. Pacing betekent hier bewust doseren en herstelmomenten inplannen.
          </p>
          ${extraAdviceTip}
        </div>
      </div>
    `;
    exercisesToDisplay = [];
    if (hasHighPainOrInterference) {
      exercisesToDisplay.push(EXERCISE_DATABASE.somatic[0]);
    }
    if (hasMentalLoad) {
      exercisesToDisplay.push(EXERCISE_DATABASE.anchor[0]);
    }
    EXERCISE_DATABASE.recovery.forEach(ex => {
      if (!exercisesToDisplay.some(e => e.id === ex.id) && exercisesToDisplay.length < 4) {
        exercisesToDisplay.push(ex);
      }
    });
  } else if (status === 'orange') {
    bannerHTML = `
      <div class="status-banner orange">
        <div class="status-banner-header">
          <h3>Aandachtspunt: Gedoseerd bewegen</h3>
          <span class="status-pill-badge orange">Doseerfase</span>
        </div>
        <div class="status-text">
          <p>
            Je draagkracht is matig. Een geschikte dag om in beweging te blijven met tussentijdse rustmomenten. Wissel fysieke activiteit af met herstel voordat vermoeidheid of klachten toenemen.
          </p>
          ${extraAdviceTip}
        </div>
      </div>
    `;
    exercisesToDisplay = [];
    if (hasHighPainOrInterference) {
      exercisesToDisplay.push(EXERCISE_DATABASE.somatic[0]);
    }
    if (hasMentalLoad) {
      exercisesToDisplay.push(EXERCISE_DATABASE.anchor[0]);
    }
    EXERCISE_DATABASE.mobility.forEach(ex => {
      if (!exercisesToDisplay.some(e => e.id === ex.id) && exercisesToDisplay.length < 4) {
        exercisesToDisplay.push(ex);
      }
    });
    if (exercisesToDisplay.length < 4 && !exercisesToDisplay.some(e => e.id === EXERCISE_DATABASE.recovery[0].id)) {
      exercisesToDisplay.push(EXERCISE_DATABASE.recovery[0]);
    }
  } else {
    bannerHTML = `
      <div class="status-banner green">
        <div class="status-banner-header">
          <h3>Aandachtspunt: Actieve opbouw</h3>
          <span class="status-pill-badge green">Opbouwfase</span>
        </div>
        <div class="status-text">
          <p>
            Je draagkracht is gunstig en je batterij is voldoende opgeladen. Dit is een geschikt moment om je geplande activiteit uit te voeren en te werken aan actieve belastbaarheid.
          </p>
          ${extraAdviceTip}
        </div>
      </div>
    `;
    exercisesToDisplay = [...EXERCISE_DATABASE.strength];
    if (hasHighPainOrInterference) {
      exercisesToDisplay.unshift(EXERCISE_DATABASE.somatic[0]);
    } else if (hasMentalLoad) {
      exercisesToDisplay.push(EXERCISE_DATABASE.anchor[0]);
    } else {
      exercisesToDisplay.push(EXERCISE_DATABASE.mobility[0]);
    }
  }

  // Build Exercise Cards
  const completedList = entry.completedExercises || [];
  const exerciseCardsHTML = exercisesToDisplay.map(ex => {
    const isDone = completedList.includes(ex.id);
    return `
      <div class="exercise-card">
        <div>
          <span class="exercise-badge ${ex.badgeClass}">${ex.category}</span>
          <h4>${ex.title}</h4>
          <div class="exercise-meta">
            <span>${ex.duration}</span>
          </div>
          <p class="exercise-desc">${ex.desc}</p>
        </div>
        <div class="exercise-action">
          <button class="check-btn ${isDone ? 'completed' : ''}" onclick="toggleExerciseCompletion('${ex.id}')">
            ${isDone ? '✓ Uitgevoerd' : 'Markeer als uitgevoerd'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Committed Action Display Card
  const actDisplayHTML = entry.actGoal ? `
    <div class="card" style="border-left: 3px solid var(--brand-secondary);">
      <div class="card-header">
        <div class="card-title-group">
          <h2>Geplande waardegerichte actie</h2>
          <p>Doelstelling en pacing-afspraak</p>
        </div>
      </div>
      <div style="background: var(--surface-base); padding: 14px 16px; border-radius: var(--radius-sm); margin-bottom: 10px; border: 1px solid var(--border-color);">
        <div style="color: var(--brand-primary); font-size: 0.95rem; font-weight: 500;">"${escapeHtml(entry.actGoal)}"</div>
        ${entry.actStep ? `<p style="margin-top: 6px; font-size: 0.88rem; color: var(--ink-muted);">Concrete tussenstap: ${escapeHtml(entry.actStep)}</p>` : ''}
      </div>
      <div style="font-size: 0.85rem; color: var(--ink-muted);">
        Status: <span style="color: var(--brand-primary); font-weight: 500;">${formatActStatus(entry.actCompleted)}</span>
      </div>
    </div>
  ` : '';

  // Total Load Display Card
  const totalLoadVectors = entry.totalLoadVectors || [];
  const totalLoadDisplayHTML = totalLoadVectors.length > 0 ? `
    <div class="card" style="border-left: 3px solid var(--status-orange);">
      <div class="card-header">
        <div class="card-title-group">
          <h2>Actieve belastingsfactoren (Total Load)</h2>
          <p>Niet-fysieke factoren die vandaag meespelen (Lennox Thompson, 2025)</p>
        </div>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${totalLoadVectors.map(v => `<span class="stat-pill" style="background: var(--surface-elevated); color: var(--brand-primary); border: 1px solid var(--border-color); font-weight: 400;">${escapeHtml(v)}</span>`).join('')}
      </div>
      <p style="font-size: 0.84rem; color: var(--ink-muted); margin-top: 10px; line-height: 1.5;">
        Houd bij het doseren van je fysieke activiteiten rekening met deze mentale of sensorische factoren.
      </p>
    </div>
  ` : '';

  container.innerHTML = `
    ${bannerHTML}
    ${totalLoadDisplayHTML}
    ${actDisplayHTML}
    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <h2>Voorgestelde bewegingsoefeningen</h2>
          <p>Richtinggevend afgestemd op je draagkracht van ${formatDutchDate(selectedDate)}</p>
        </div>
      </div>

      <!-- Duidelijke Klinische Disclaimer -->
      <div class="clinical-disclaimer-box">
        <div class="disclaimer-title">Klinische toelichting bij deze oefeningen</div>
        <p style="margin: 0; font-size: 0.86rem; color: var(--ink-muted); line-height: 1.55;">
          Dit zijn algemene basisoefeningen ter ondersteuning van zenuwstelsel en mobiliteit, geen individueel behandelplan. Ieder hersteltraject verloopt anders. Bespreek eventuele vragen of aanpassingen steeds tijdens je consultatie bij Kine Strop met Egon of Mathias.
        </p>
      </div>

      <div class="exercise-grid">
        ${exerciseCardsHTML}
      </div>
    </div>
  `;
}

function toggleExerciseCompletion(exId) {
  const entry = appData[selectedDate];
  if (!entry) return;

  if (!entry.completedExercises) {
    entry.completedExercises = [];
  }

  const idx = entry.completedExercises.indexOf(exId);
  if (idx > -1) {
    entry.completedExercises.splice(idx, 1);
  } else {
    entry.completedExercises.push(exId);
  }

  saveToStorage();
  renderAdviceTab();
  showToast('Oefenstatus bijgewerkt');
}

/* ==========================================================================
   Tab 3: Trends & History Rendering
   ========================================================================== */
function renderHistoryTab() {
  const container = document.getElementById('history-list-container');
  if (!container) return;

  const dates = Object.keys(appData).sort().reverse();

  if (dates.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 20px;">
        <p style="color: var(--ink-muted); font-size: 0.9rem;">Nog geen eerdere dagboekregistraties gevonden.</p>
      </div>
    `;
    return;
  }

  const listHTML = dates.map(d => {
    const entry = appData[d];
    const status = calculateDayStatus(entry);
    const statusLabel = status === 'green' ? 'Opbouwfase' : status === 'orange' ? 'Doseerfase' : 'Herstelfase';
    
    return `
      <div class="history-item">
        <div>
          <div class="history-date">${formatDutchDate(d)}</div>
          <div style="margin-top: 4px;">
            <span class="status-pill-badge ${status}">${statusLabel}</span>
          </div>
        </div>

        <div class="history-stats">
          <span class="stat-pill">${entry.sleepDuration || '-'}u slaap</span>
          <span class="stat-pill">${entry.energyLevel || '-'}% energie</span>
          <span class="stat-pill">Pijn ${entry.painLevel || 0}/10</span>
          ${entry.actGoal ? `<span class="stat-pill" title="${escapeHtml(entry.actGoal)}">${formatActStatus(entry.actCompleted)}</span>` : ''}
        </div>

        <div class="history-actions" style="display: flex; gap: 8px;">
          <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="selectAndEditDate('${d}')">Bewerken</button>
          <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.78rem; color: var(--status-red); border-color: var(--status-red-border);" onclick="deleteEntry('${d}')">Verwijderen</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = listHTML;
}

function selectAndEditDate(dateStr) {
  selectedDate = dateStr;
  const dateInput = document.getElementById('entry-date');
  if (dateInput) dateInput.value = dateStr;
  loadDateEntryIntoForm(dateStr);
  switchTab('tab-entry');
}

function deleteEntry(dateStr) {
  if (confirm(`Weet je zeker dat je het dagboek van ${formatDutchDate(dateStr)} wilt verwijderen?`)) {
    delete appData[dateStr];
    saveToStorage();
    renderHistoryTab();
    renderExportTab();
    showToast('Dagboek verwijderd.');
  }
}

function handleClearData() {
  if (confirm('Let op: Hiermee wis je al je opgeslagen dagboekgegevens op dit apparaat. Weet je dit zeker?')) {
    appData = {};
    saveToStorage();
    loadDateEntryIntoForm(selectedDate);
    renderHistoryTab();
    renderExportTab();
    renderAdviceTab();
    showToast('Alle gegevens zijn gewist.');
  }
}

/* ==========================================================================
   Tab 4: Kine Export & PDF Formatting
   ========================================================================== */
function renderExportTab() {
  const container = document.getElementById('export-preview-container');
  if (!container) return;

  const patientNameInput = document.getElementById('export-patient-name');
  const patientName = patientNameInput ? patientNameInput.value.trim() || '[Naam Patiënt]' : '[Naam Patiënt]';

  const dates = Object.keys(appData).sort().reverse().slice(0, 14); // Laatste 14 dagen

  if (dates.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 36px 20px;">
        <p style="color: var(--ink-muted); font-size: 0.9rem;">Er zijn nog geen dagboeknotities om te exporteren.</p>
      </div>
    `;
    return;
  }

  // Bereken gemiddelden
  let totalSleep = 0, totalEnergy = 0, totalPain = 0, count = dates.length;
  let actCompletedCount = 0;

  dates.forEach(d => {
    const e = appData[d];
    totalSleep += e.sleepDuration || 0;
    totalEnergy += e.energyLevel || 0;
    totalPain += e.painLevel || 0;
    if (e.actCompleted === 'voltooid' || e.actCompleted === 'aangepast') actCompletedCount++;
  });

  const avgSleep = (totalSleep / count).toFixed(1);
  const avgEnergy = Math.round(totalEnergy / count);
  const avgPain = (totalPain / count).toFixed(1);

  const tableRowsHTML = dates.map(d => {
    const e = appData[d];
    const status = calculateDayStatus(e);
    const statusBadge = status === 'green' ? '<span class="status-pill-badge green">Opbouw</span>' : status === 'orange' ? '<span class="status-pill-badge orange">Doseerbaar</span>' : '<span class="status-pill-badge red">Herstel</span>';
    const totalLoadStr = (e.totalLoadVectors || []).length > 0 ? e.totalLoadVectors.join(', ') : '-';
    const regieStr = e.selfEfficacy === 'volledig' ? 'Volledig' : e.selfEfficacy === 'gedeeltelijk' ? 'Gedeeltelijk' : 'Nauwelijks';

    return `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px; font-weight: 500;">${d}</td>
        <td style="padding: 10px;">${statusBadge}</td>
        <td style="padding: 10px;">${e.sleepDuration || '-'}u (${e.sleepQuality || '-'}/5)</td>
        <td style="padding: 10px;">${e.energyLevel || '-'}%</td>
        <td style="padding: 10px;">${e.painLevel || 0}/10</td>
        <td style="padding: 10px; font-size: 0.8rem; color: #475569;">${escapeHtml(totalLoadStr)}</td>
        <td style="padding: 10px;">${escapeHtml(e.actGoal || '-')}</td>
        <td style="padding: 10px;">${regieStr}</td>
        <td style="padding: 10px; font-size: 0.85rem; color: #475569;">${escapeHtml(e.reflectionNotes || '-')}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="card" style="border: 1px solid var(--border-color); padding: 24px;">
      
      <!-- Print Header (Visible on print & preview) -->
      <div class="print-header">
        <div>
          <h2 style="font-family: var(--font-heading); color: var(--brand-primary); font-size: 1.25rem; font-weight: 600; margin-bottom: 2px;">
            Kinestrop Patiënten Dagboek Rapport
          </h2>
          <p style="font-size: 0.85rem; color: var(--ink-muted);">
            Kinesitherapie & Chronische Pijnrevalidatie Gent • Egon & Mathias
          </p>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 500; color: var(--brand-primary);" id="export-display-name">Patiënt: ${escapeHtml(patientName)}</div>
          <div style="font-size: 0.82rem; color: var(--ink-muted);">Datum: ${new Date().toLocaleDateString('nl-BE')}</div>
        </div>
      </div>

      <!-- Samenvatting Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 20px;">
        <div style="background: var(--surface-elevated); padding: 12px; border-radius: 8px; text-align: center; border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.03em;">Gem. Slaap</div>
          <div style="font-size: 1.2rem; font-weight: 600; color: var(--brand-primary);">${avgSleep} uur</div>
        </div>
        <div style="background: var(--surface-elevated); padding: 12px; border-radius: 8px; text-align: center; border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.03em;">Gem. Energie</div>
          <div style="font-size: 1.2rem; font-weight: 600; color: var(--brand-secondary);">${avgEnergy}%</div>
        </div>
        <div style="background: var(--surface-elevated); padding: 12px; border-radius: 8px; text-align: center; border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.03em;">Gem. Pijn</div>
          <div style="font-size: 1.2rem; font-weight: 600; color: var(--brand-primary);">${avgPain}/10</div>
        </div>
        <div style="background: var(--surface-elevated); padding: 12px; border-radius: 8px; text-align: center; border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.03em;">Doelen uitgevoerd</div>
          <div style="font-size: 1.2rem; font-weight: 600; color: #059669;">${actCompletedCount} dagen</div>
        </div>
      </div>

      <!-- Detail Tabel -->
      <h3 style="font-family: var(--font-heading); font-size: 1rem; color: var(--brand-primary); margin-bottom: 10px; font-weight: 600;">
        Overzicht Dagen (${dates.length} recente notities)
      </h3>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
          <thead>
            <tr style="background: var(--surface-elevated); color: var(--brand-primary); border-bottom: 1px solid var(--border-color);">
              <th style="padding: 8px 10px; font-weight: 500;">Datum</th>
              <th style="padding: 8px 10px; font-weight: 500;">Zone</th>
              <th style="padding: 8px 10px; font-weight: 500;">Slaap</th>
              <th style="padding: 8px 10px; font-weight: 500;">Energie</th>
              <th style="padding: 8px 10px; font-weight: 500;">Pijn</th>
              <th style="padding: 8px 10px; font-weight: 500;">Totale belasting</th>
              <th style="padding: 8px 10px; font-weight: 500;">Waardegerichte actie</th>
              <th style="padding: 8px 10px; font-weight: 500;">Eigen Regie</th>
              <th style="padding: 8px 10px; font-weight: 500;">Reflectie</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>
      </div>

    </div>
  `;

  // Dynamic Name Sync
  if (patientNameInput) {
    patientNameInput.oninput = () => {
      const disp = document.getElementById('export-display-name');
      if (disp) disp.textContent = 'Patiënt: ' + (patientNameInput.value.trim() || '[Naam Patiënt]');
    };
  }
}

/* ==========================================================================
   Helper Utilities
   ========================================================================== */
function getRadioValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

function setRadioValue(name, val) {
  const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
  if (el) el.checked = true;
}

function formatActStatus(statusStr) {
  switch (statusStr) {
    case 'voltooid': return 'Volledig uitgevoerd';
    case 'aangepast': return 'Aangepast uitgevoerd';
    case 'niet_gelukt': return 'Bewust gepauzeerd / rust';
    default: return 'Gepland voor vandaag';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}
