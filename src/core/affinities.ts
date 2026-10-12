export const ELEMENTS = ['fire', 'water', 'lightning', 'wind', 'earth', 'shadow', 'light'] as const;
export type ElementId = typeof ELEMENTS[number];
export type Affinities = Record<ElementId, number>;

export const ELEMENT: Record<ElementId, { name: string; glyph: string; color: number; css: string }> = {
  fire: { name: 'FOGO', glyph: '♨', color: 0xff7045, css: '#ff9c65' },
  water: { name: 'ÁGUA', glyph: '≈', color: 0x64b9ea, css: '#8ed6fb' },
  lightning: { name: 'RAIO', glyph: 'ϟ', color: 0xf6d66b, css: '#ffe788' },
  wind: { name: 'VENTO', glyph: '≋', color: 0xa6dfb2, css: '#b9eec3' },
  earth: { name: 'TERRA', glyph: '◆', color: 0xbf9c64, css: '#d4ad74' },
  shadow: { name: 'SOMBRA', glyph: '☾', color: 0x9c81c5, css: '#c3a4e3' },
  light: { name: 'LUZ', glyph: '✦', color: 0xffe3ad, css: '#fff0c7' },
};

export function emptyAffinities(): Affinities {
  return { fire: 0, water: 0, lightning: 0, wind: 0, earth: 0, shadow: 0, light: 0 };
}

export function totalAffinity(affinities: Affinities): number {
  return ELEMENTS.reduce((sum, id) => sum + affinities[id], 0);
}

export function gainAffinity(affinities: Affinities, id: ElementId): Affinities {
  if (affinities[id] >= 5) return affinities;
  return { ...affinities, [id]: affinities[id] + 1 };
}

export function primaryElement(affinities: Affinities): ElementId | null {
  return ELEMENTS.reduce<ElementId | null>((best, id) => affinities[id] > (best ? affinities[best] : 0) ? id : best, null);
}

export function affinityDamageBonus(affinities: Affinities): number {
  return Math.floor(totalAffinity(affinities) / 2);
}

/** Three reproducible altar offerings. An owned element stays available for focused builds. */
export function altarChoices(seed: number, roomId: number, affinities: Affinities): ElementId[] {
  let value = (seed ^ Math.imul(roomId + 1, 0x9e3779b1)) >>> 0;
  const pool = ELEMENTS.filter(id => affinities[id] < 5);
  const choices: ElementId[] = [];
  const primary = primaryElement(affinities);
  if (primary && affinities[primary] < 5) choices.push(primary);
  for (let attempt = 0; choices.length < 3 && choices.length < pool.length && attempt < 24; attempt++) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    const pick = pool[value % pool.length];
    if (!choices.includes(pick)) choices.push(pick);
  }
  for (const id of pool) if (choices.length < 3 && !choices.includes(id)) choices.push(id);
  return choices;
}

export function hasPureMastery(affinities: Affinities, id: ElementId): boolean {
  return affinities[id] >= 5;
}
