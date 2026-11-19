// Renders the checklist rows, the trophy detail pane and the missables list.
// Every string shown comes from the trophy data or the progress state, set as
// text, never as markup, so a trophy name can never break the page.
import { GRADE_LABELS, KIND_LABELS } from './data.js';
import {
  earnedTotals,
  getCount,
  isEarned,
  setCount,
  setEarned,
  toggleEarned,
} from './store.js';
import {
  applyFilters,
  displayDescription,
  displayName,
  isSpoilerHidden,
} from './filters.js';

function makeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

export function renderProgress(progress, trophies) {
  const totals = earnedTotals(progress, trophies);
  document.getElementById('earnedCount').textContent = String(totals.total);
  document.getElementById('progressFill').style.width = `${Math.round(
    (totals.total / trophies.length) * 100,
  )}%`;
  document.getElementById('progressDetail').textContent =
    `Platinum ${totals.platinum}/1 · Gold ${totals.gold}/2 · ` +
    `Silver ${totals.silver}/6 · Bronze ${totals.bronze}/46`;
}

function gradeBadge(trophy) {
  return makeElement('span', `badge ${trophy.grade}`, GRADE_LABELS[trophy.grade]);
}

function kindTag(trophy) {
  const label = KIND_LABELS[trophy.kind] || trophy.kind;
  return makeElement('span', 'tag', label);
}

function missableTag() {
  return makeElement('span', 'tag missable', 'Missable');
}

function hiddenTag() {
  return makeElement('span', 'tag hidden-flag', 'Hidden on PS5');
}

function counterLine(trophy, progress, onCountChange) {
  const wrap = makeElement('div', 'counter-line');
  const label = makeElement('span', null, 'Your progress: ');
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.max = String(trophy.count);
  input.value = String(getCount(progress, trophy.id));
  input.setAttribute('aria-label', `Your progress on ${trophy.name}, out of ${trophy.count} ${trophy.countLabel}`);
  input.addEventListener('change', () => {
    const value = setCount(progress, trophy.id, input.value);
    input.value = String(value);
    if (value >= trophy.count) setEarned(progress, trophy.id, true);
    onCountChange();
  });
  const target = makeElement('span', null, ` / ${trophy.count} ${trophy.countLabel}`);
  const bar = makeElement('div', 'counter-bar');
  const fill = makeElement('div');
  fill.style.width = `${Math.min(100, Math.round((getCount(progress, trophy.id) / trophy.count) * 100))}%`;
  bar.append(fill);
  wrap.append(label, input, target, bar);
  return wrap;
}

function trophyRow(trophy, progress, selectedId, callbacks) {
  const row = makeElement('li', 'trophy-row');
  if (isEarned(progress, trophy.id)) row.classList.add('earned');
  if (trophy.id === selectedId) row.classList.add('selected');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(progress, trophy.id);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    toggleEarned(progress, trophy.id);
    callbacks.onProgressChange();
  });
  box.addEventListener('click', (event) => event.stopPropagation());
  row.append(box);

  const body = makeElement('div', 'trophy-body');
  body.append(makeElement('div', 'trophy-name', displayName(trophy, progress)));
  body.append(makeElement('div', 'trophy-desc', displayDescription(trophy, progress)));
  const meta = makeElement('div', 'trophy-meta');
  meta.append(gradeBadge(trophy));
  meta.append(kindTag(trophy));
  if (trophy.missable) meta.append(missableTag());
  if (trophy.hidden) meta.append(hiddenTag());
  body.append(meta);
  if (trophy.count) body.append(counterLine(trophy, progress, callbacks.onProgressChange));
  row.append(body);

  row.addEventListener('click', () => callbacks.onSelect(trophy.id));
  return row;
}

export function renderChecklist(trophies, filters, progress, selectedId, callbacks) {
  const list = document.getElementById('trophyList');
  const shown = applyFilters(trophies, filters, progress);
  list.replaceChildren();
  for (const trophy of shown) {
    list.append(trophyRow(trophy, progress, selectedId, callbacks));
  }
  const count = document.getElementById('resultCount');
  count.textContent =
    shown.length === trophies.length
      ? `Showing all ${trophies.length} trophies.`
      : `Showing ${shown.length} of ${trophies.length} trophies.`;
  const note = document.getElementById('spoilerNote');
  note.hidden = !progress.spoilers;
}

export function renderDetail(trophy, progress, callbacks) {
  const panel = document.getElementById('detailPanel');
  panel.replaceChildren();
  if (!trophy) {
    panel.append(makeElement('p', 'detail-empty', 'Select a trophy to read its guide and sources.'));
    return;
  }
  const hidden = isSpoilerHidden(trophy, progress);
  const meta = makeElement('div', 'trophy-meta');
  meta.append(gradeBadge(trophy));
  meta.append(kindTag(trophy));
  if (trophy.missable) meta.append(missableTag());
  if (trophy.hidden) meta.append(hiddenTag());
  panel.append(meta);
  panel.append(makeElement('h2', null, displayName(trophy, progress)));
  panel.append(makeElement('p', 'official-desc', displayDescription(trophy, progress)));

  if (hidden) {
    panel.append(
      makeElement(
        'p',
        'guide-text',
        'This is a hidden story trophy. Turn off “Hide story spoilers” above, or earn it, to read the guide.',
      ),
    );
  } else {
    if (trophy.missable && trophy.missableNote) {
      panel.append(makeElement('div', 'missable-callout', trophy.missableNote));
    }
    panel.append(makeElement('h3', null, 'Guide'));
    panel.append(makeElement('p', 'guide-text', trophy.guide));
    if (trophy.count) {
      panel.append(makeElement('h3', null, 'Your progress'));
      panel.append(counterLine(trophy, progress, callbacks.onProgressChange));
    }
    panel.append(makeElement('h3', null, 'Sources'));
    const sources = makeElement('ul', 'sources');
    for (const source of trophy.sources) {
      sources.append(makeElement('li', null, source));
    }
    panel.append(sources);
  }

  const actions = makeElement('div', 'detail-actions');
  const markButton = makeElement(
    'button',
    null,
    isEarned(progress, trophy.id) ? 'Mark as not earned' : 'Mark as earned',
  );
  markButton.type = 'button';
  markButton.addEventListener('click', () => {
    toggleEarned(progress, trophy.id);
    callbacks.onProgressChange();
  });
  actions.append(markButton);
  const closeButton = makeElement('button', 'secondary', 'Close guide');
  closeButton.type = 'button';
  closeButton.addEventListener('click', () => callbacks.onSelect(null));
  actions.append(closeButton);
  panel.append(actions);
}

export function renderMissableList(trophies, progress, selectedId, callbacks) {
  const list = document.getElementById('missableList');
  list.replaceChildren();
  const missables = trophies.filter((trophy) => trophy.missable);
  for (const trophy of missables) {
    list.append(trophyRow(trophy, progress, selectedId, callbacks));
  }
}
