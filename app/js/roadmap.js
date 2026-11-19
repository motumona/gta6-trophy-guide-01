// Renders the roadmap to the platinum: five stages in order, each with its
// trophies and a per-stage progress count, built from the roadmapStage field
// of the trophy data.
import { ROADMAP_STAGES } from './data.js';
import { isEarned } from './store.js';

function makeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

export function renderRoadmap(trophies, progress) {
  const host = document.getElementById('roadmapStages');
  host.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((trophy) => trophy.roadmapStage === stage.stage);
    const earned = members.filter((trophy) => isEarned(progress, trophy.id)).length;

    const card = makeElement('article', 'stage');
    const head = makeElement('div', 'stage-head');
    head.append(makeElement('span', 'stage-num', `Stage ${stage.stage}`));
    head.append(makeElement('h3', null, stage.title));
    head.append(
      makeElement('span', 'stage-count', `${earned} of ${members.length} trophies earned`),
    );
    card.append(head);
    card.append(makeElement('p', null, stage.text));

    const chips = makeElement('div', 'stage-trophies');
    for (const trophy of members) {
      const chip = makeElement(
        'span',
        isEarned(progress, trophy.id) ? 'stage-trophy done' : 'stage-trophy',
        `${trophy.name} · ${trophy.grade}`,
      );
      chips.append(chip);
    }
    card.append(chips);
    card.append(
      makeElement(
        'p',
        'stage-progress',
        earned === members.length
          ? 'Stage complete.'
          : `${members.length - earned} to go in this stage.`,
      ),
    );
    host.append(card);
  }
}
