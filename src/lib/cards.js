import cardData from '../riftbound-cards.json'
import { CHAMPION_BY_LEGEND_NAME } from './champions'

// cardType is empty in the JSON (data extraction bug in fetch-cards.js).
// Derive type from cardImage.accessibilityText, which starts with e.g. "Riftbound Legend:".
const TYPE_RE = /^Riftbound ([A-Za-z ]+?):/

export function getCardType(card) {
  const m = (card?.cardImage?.accessibilityText || '').match(TYPE_RE)
  return m ? m[1] : null
}

const byId = new Map(cardData.map(c => [c.id, c]))
export function getCardById(id) {
  return byId.get(id) || null
}

// Many legends have multiple printings (rare + showcase variants) with the same name and text.
// For the dropdown, dedupe by name and prefer the lowest-rarity printing as canonical.
const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, epic: 3, showcase: 4 }

function pickCanonical(cards) {
  return [...cards].sort((a, b) => {
    const ar = RARITY_ORDER[a.rarity?.id] ?? 99
    const br = RARITY_ORDER[b.rarity?.id] ?? 99
    if (ar !== br) return ar - br
    return (a.collectorNumber ?? 0) - (b.collectorNumber ?? 0)
  })[0]
}

function dedupedByName(cards) {
  const groups = new Map()
  for (const c of cards) {
    const key = c.name
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(c)
  }
  return [...groups.values()].map(pickCanonical).sort((a, b) => a.name.localeCompare(b.name))
}

let _legends, _battlefields
export function getLegends() {
  if (!_legends) {
    _legends = dedupedByName(cardData.filter(c => getCardType(c) === 'Legend')).map(c => ({
      ...c,
      champion: CHAMPION_BY_LEGEND_NAME[c.name] || null,
    }))
  }
  return _legends
}

export function getBattlefields() {
  if (!_battlefields) {
    _battlefields = dedupedByName(cardData.filter(c => getCardType(c) === 'Battlefield'))
  }
  return _battlefields
}

export const BARON_PIT_NAME = 'Baron Pit'
export function getBaronPitCard() {
  return getBattlefields().find(b => b.name === BARON_PIT_NAME) || null
}
