export type WeaponId = 'bolt' | 'fan' | 'lance';
export type Shot = { vx: number; vy: number; damage: number; life: number; color: number; radius: number };

export const MAX_ENERGY = 100;
export const ENERGY_REGEN = 12;
export const ENERGY_DELAY = 0.65;

export const WEAPONS: Record<WeaponId, { name: string; cadence: number; energy: number; description: string }> = {
  bolt: { name: 'ESPADA DO JÃO', cadence: 0.23, energy: 5, description: 'Arco curto lançado pela espada' },
  fan: { name: 'ARCO DA ALICE', cadence: 0.43, energy: 9, description: 'Três flechas em leque' },
  lance: { name: 'CARTAS DO GUI', cadence: 0.53, energy: 8, description: 'Carta arcana arremessada' },
};

export function spendEnergy(current: number, id: WeaponId): number | null {
  return current >= WEAPONS[id].energy ? current - WEAPONS[id].energy : null;
}

export function restoreEnergy(current: number, dt: number, cooldown: number, maximum = MAX_ENERGY, regen = ENERGY_REGEN): number {
  return cooldown > 0 ? current : Math.min(maximum, current + regen * dt);
}

export function createShots(id: WeaponId, aimX: number, aimY: number, power = 0): Shot[] {
  const angle = Math.atan2(aimY, aimX);
  const spread = id === 'fan' ? [-0.24, 0, 0.24] : [0];
  const speed = id === 'lance' ? 620 : id === 'fan' ? 460 : 520;
  return spread.map(offset => ({
    vx: Math.cos(angle + offset) * speed,
    vy: Math.sin(angle + offset) * speed,
    damage: (id === 'lance' ? 2 : 1) + power,
    life: id === 'lance' ? 1.2 : id === 'fan' ? 0.9 : 0.6,
    color: id === 'lance' ? 0xb793d5 : id === 'fan' ? 0xf2d39a : 0xe9c48a,
    radius: id === 'lance' ? 7 : 6,
  }));
}
