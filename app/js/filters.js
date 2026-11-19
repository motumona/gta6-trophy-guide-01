// Filtering for the checklist: by kind, grade, earned state and search text,
// plus the spoiler rule that hides story trophies until they are earned.
import { isEarned } from './store.js';

export function createFilterState() {
  return { kind: 'all', grade: 'all', earned: 'all', query: '' };
}

export function applyFilters(trophies, filters, progress) {
  const query = filters.query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.kind === 'missable' && !trophy.missable) return false;
    if (filters.kind === 'online') return false;
    if (filters.kind !== 'all' && filters.kind !== 'missable' && trophy.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    const earned = isEarned(progress, trophy.id);
    if (filters.earned === 'earned' && !earned) return false;
    if (filters.earned === 'unearned' && earned) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

// A trophy is spoiler-hidden when the setting is on, the trophy is hidden on
// PlayStation or is a story trophy, and it has not been earned yet.
export function isSpoilerHidden(trophy, progress) {
  if (!progress.spoilers) return false;
  if (isEarned(progress, trophy.id)) return false;
  return trophy.hidden === true || trophy.kind === 'story';
}

export function displayName(trophy, progress) {
  return isSpoilerHidden(trophy, progress) ? '??? (Hidden trophy)' : trophy.name;
}

export function displayDescription(trophy, progress) {
  return isSpoilerHidden(trophy, progress)
    ? 'Hidden until earned.'
    : trophy.description;
}
