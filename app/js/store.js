// Progress saved in the browser: which trophies are earned, the running count
// for each trophy with a PSN target, and the spoiler setting. Everything is
// kept under one localStorage key so export and import move the whole state.
const STORAGE_KEY = 'leonida-trophy-ledger-v1';

function readStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: [], counts: {}, spoilers: false };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned : [],
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      spoilers: parsed.spoilers === true,
    };
  } catch {
    return { earned: [], counts: {}, spoilers: false };
  }
}

function writeStoredState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadProgress() {
  const state = readStoredState();
  return {
    earned: new Set(state.earned),
    counts: state.counts,
    spoilers: state.spoilers,
  };
}

export function saveProgress(progress) {
  writeStoredState({
    earned: [...progress.earned],
    counts: progress.counts,
    spoilers: progress.spoilers,
  });
}

export function isEarned(progress, trophyId) {
  return progress.earned.has(trophyId);
}

export function toggleEarned(progress, trophyId) {
  if (progress.earned.has(trophyId)) progress.earned.delete(trophyId);
  else progress.earned.add(trophyId);
  saveProgress(progress);
}

export function setEarned(progress, trophyId, earned) {
  if (earned) progress.earned.add(trophyId);
  else progress.earned.delete(trophyId);
  saveProgress(progress);
}

export function getCount(progress, trophyId) {
  const value = progress.counts[trophyId];
  return Number.isFinite(value) ? value : 0;
}

export function setCount(progress, trophyId, value) {
  const number = Math.max(0, Math.floor(Number(value) || 0));
  progress.counts[trophyId] = number;
  saveProgress(progress);
  return number;
}

export function earnedTotals(progress, trophies) {
  const totals = { total: 0, platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (progress.earned.has(trophy.id)) {
      totals.total += 1;
      totals[trophy.grade] += 1;
    }
  }
  return totals;
}

// Builds the export file: the earned ids, the counters and the spoiler
// setting, with the game named so a stray file is recognisable.
export function buildExportFile(progress) {
  return JSON.stringify(
    {
      app: 'Leonida Trophy Ledger',
      game: 'Grand Theft Auto VI',
      exportedAt: new Date().toISOString(),
      earned: [...progress.earned],
      counts: progress.counts,
      spoilers: progress.spoilers,
    },
    null,
    2,
  );
}

// Reads an import file back into progress. Unknown trophy ids are dropped,
// so a file from another guide cannot corrupt the list.
export function parseImportFile(text, trophies) {
  const parsed = JSON.parse(text);
  const knownIds = new Set(trophies.map((trophy) => trophy.id));
  const earned = new Set();
  if (Array.isArray(parsed.earned)) {
    for (const id of parsed.earned) {
      if (knownIds.has(id)) earned.add(id);
    }
  }
  const counts = {};
  if (parsed.counts && typeof parsed.counts === 'object') {
    for (const [key, value] of Object.entries(parsed.counts)) {
      const id = Number(key);
      if (knownIds.has(id) && Number.isFinite(value) && value >= 0) {
        counts[id] = Math.floor(value);
      }
    }
  }
  return { earned, counts, spoilers: parsed.spoilers === true };
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
