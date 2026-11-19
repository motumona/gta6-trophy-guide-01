// Boot for the Leonida Trophy Ledger: loads the trophy list, wires the
// checklist controls, the spoiler setting, export and import, and the
// hash routing between the checklist, roadmap, missables and about views.
import { loadTrophies } from './data.js';
import { createFilterState } from './filters.js';
import { renderRoadmap } from './roadmap.js';
import {
  buildExportFile,
  downloadTextFile,
  loadProgress,
  parseImportFile,
  saveProgress,
} from './store.js';
import { renderChecklist, renderDetail, renderMissableList, renderProgress } from './views.js';

const VIEW_IDS = {
  checklist: 'view-checklist',
  roadmap: 'view-roadmap',
  missables: 'view-missables',
  about: 'view-about',
};

function currentView() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return VIEW_IDS[hash] ? hash : 'checklist';
}

function showView(view) {
  for (const [name, id] of Object.entries(VIEW_IDS)) {
    document.getElementById(id).hidden = name !== view;
  }
  for (const tab of document.querySelectorAll('#tabs .tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
}

async function bootLedger() {
  const trophies = await loadTrophies();
  const progress = loadProgress();
  const filters = createFilterState();
  let selectedId = null;

  // A spoilers query lets a link open the guide with spoilers on or off.
  const params = new URLSearchParams(window.location.search);
  if (params.get('spoilers') === 'on') progress.spoilers = true;
  if (params.get('spoilers') === 'off') progress.spoilers = false;
  saveProgress(progress);

  const spoilerToggle = document.getElementById('spoilerToggle');
  spoilerToggle.checked = progress.spoilers;

  function selectedTrophy() {
    return trophies.find((trophy) => trophy.id === selectedId) || null;
  }

  function renderAll() {
    renderProgress(progress, trophies);
    renderChecklist(trophies, filters, progress, selectedId, callbacks);
    renderDetail(selectedTrophy(), progress, callbacks);
    renderMissableList(trophies, progress, selectedId, callbacks);
    renderRoadmap(trophies, progress);
  }

  const callbacks = {
    onProgressChange() {
      saveProgress(progress);
      renderAll();
    },
    onSelect(id) {
      selectedId = id;
      renderAll();
      if (id !== null) {
        document.getElementById('detailPanel').scrollIntoView({ block: 'nearest' });
      }
    },
  };

  const searchBox = document.getElementById('searchBox');
  searchBox.addEventListener('input', () => {
    filters.query = searchBox.value;
    renderChecklist(trophies, filters, progress, selectedId, callbacks);
  });

  for (const chip of document.querySelectorAll('#kindChips .chip')) {
    chip.addEventListener('click', () => {
      filters.kind = chip.dataset.kind;
      for (const other of document.querySelectorAll('#kindChips .chip')) {
        other.classList.toggle('active', other === chip);
      }
      renderChecklist(trophies, filters, progress, selectedId, callbacks);
    });
  }

  document.getElementById('gradeFilter').addEventListener('change', (event) => {
    filters.grade = event.target.value;
    renderChecklist(trophies, filters, progress, selectedId, callbacks);
  });

  document.getElementById('earnedFilter').addEventListener('change', (event) => {
    filters.earned = event.target.value;
    renderChecklist(trophies, filters, progress, selectedId, callbacks);
  });

  spoilerToggle.addEventListener('change', () => {
    progress.spoilers = spoilerToggle.checked;
    saveProgress(progress);
    renderAll();
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    downloadTextFile('leonida-trophy-progress.json', buildExportFile(progress));
  });

  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = parseImportFile(await file.text(), trophies);
      progress.earned = imported.earned;
      progress.counts = imported.counts;
      progress.spoilers = imported.spoilers;
      spoilerToggle.checked = progress.spoilers;
      saveProgress(progress);
      renderAll();
    } catch {
      window.alert('That file is not a Leonida Trophy Ledger export.');
    }
    event.target.value = '';
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Clear all earned ticks and counters?')) return;
    progress.earned = new Set();
    progress.counts = {};
    selectedId = null;
    saveProgress(progress);
    renderAll();
  });

  window.addEventListener('hashchange', () => showView(currentView()));
  showView(currentView());
  renderAll();
}

bootLedger();
