export const GEAR_IDS = ['ring', 'armor', 'pendant', 'rune'] as const;
export type GearId = typeof GEAR_IDS[number];
export type Equipment = Record<GearId, number>;
export const GEAR: Record<GearId, { name: string; glyph: string; description: string }> = {
  ring: { name: 'ANEL VITAL', glyph: '○', description: '+1 vida máxima e cura 1' },
  armor: { name: 'ARMADURA', glyph: '⬡', description: '+1 escudo; regenera fora de combate' },
  pendant: { name: 'PINGENTE', glyph: '◇', description: '+20 energia máxima' },
  rune: { name: 'RUNA DE FLUXO', glyph: '✧', description: '+20% regeneração de energia' },
};

export function emptyEquipment(): Equipment { return { ring: 0, armor: 0, pendant: 0, rune: 0 }; }
export function maxHealth(equipment: Equipment): number { return 5 + equipment.ring; }
export function maxShield(equipment: Equipment): number { return equipment.armor; }
export function maxEnergy(equipment: Equipment): number { return 100 + 20 * equipment.pendant; }
export function energyRegen(equipment: Equipment): number { return 12 * (1 + 0.2 * equipment.rune); }

export function gearChoices(seed: number, roomId: number, equipment: Equipment): GearId[] {
  let value = (seed ^ Math.imul(roomId + 1, 0x85ebca6b)) >>> 0;
  const pool = GEAR_IDS.filter(id => equipment[id] < 5);
  const choices: GearId[] = [];
  for (let attempt = 0; choices.length < 3 && attempt < 20; attempt++) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    const candidate = pool[value % pool.length];
    if (candidate && !choices.includes(candidate)) choices.push(candidate);
  }
  for (const id of pool) if (choices.length < 3 && !choices.includes(id)) choices.push(id);
  return choices;
}
