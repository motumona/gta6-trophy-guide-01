// Loads the official trophy list and the shared labels for it.
// The list itself lives in data/trophies.json: 55 trophies with their official
// name, description and grade, plus this guide's kind, missable flag, PSN
// progress target and roadmap stage for each one.
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  const document = await response.json();
  return document.trophies;
}

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectible',
  activity: 'Activity',
  online: 'Online',
  platinum: 'Platinum',
};

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Play the story',
    text: 'Play Chapters 1 to 4 and the final mission in order, and start every stranger chain the moment it unlocks. Do Lucia’s Chapter 1 balcony meditation before the chapter ends — it is the one spot reported to disappear. Story trophies pop as you play; there is nothing to grind here.',
  },
  {
    stage: 2,
    title: 'Leonida with your partner',
    text: 'With the story done, work the open world with your partner beside you: the wanted-level and shop-robbery trophies, the heists and vaults, the tank and the jet, and exploring all 52 areas of Leonida. Most of these pop from normal chaos — pick them off one at a time.',
  },
  {
    stage: 3,
    title: 'Activities and skills',
    text: 'The grind stage: 250 stunts, gold in all 42 Shooting Range challenges, drone races at all 14 locations, 20 different races won, 50 challenges, and one of each of the 9 activity types. Take them one activity at a time and let the counters climb.',
  },
  {
    stage: 4,
    title: 'Collecting and money',
    text: 'Finish the collections and the economy: 3 card sets, WAiNK at 100 locations, $250,000 laundered in Marked Bills, $100,000 spent across all shops, all 8 garages, and 10 vehicles registered to the Scooter Bros app.',
  },
  {
    stage: 5,
    title: 'The final sweep',
    text: 'Close out the 100% checklist for A Long Road, the gold for attaining 100% completion. The checklist asks for more than the trophies in places — 300 stunts, 30 races won, 70 challenges, 15 card sets, 8 bank vaults — so keep going past the trophy targets. When it pops, the platinum follows at once.',
  },
];
