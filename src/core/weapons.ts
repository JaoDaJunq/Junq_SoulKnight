export type WeaponId = 'bolt' | 'fan' | 'lance';
export type Shot = { vx: number; vy: number; damage: number; life: number; color: number; radius: number };

export const MAX_ENERGY = 100;
export const ENERGY_REGEN = 12;
export const ENERGY_DELAY = 0.65;

export const WEAPONS: Record<WeaponId, { name: string; cadence: number; energy: number; description: string }> = {
  bolt: { name: 'ESPADA DO JÃO', cadence: 0.23, energy: 5, description: 'Corte de energia lançado' },
  fan: { name: 'ARCO DA ALICE', cadence: 0.43, energy: 9, description: 'Três flechas em leque' },
  lance: { name: 'MARTELO DO GUI', cadence: 0.65, energy: 13, description: 'Impacto pesado à distância' },
};

export function spendEnergy(current: number, id: WeaponId): number | null {
  return current >= WEAPONS[id].energy ? current - WEAPONS[id].energy : null;
}

export function restoreEnergy(current: number, dt: number, cooldown: number): number {
  return cooldown > 0 ? current : Math.min(MAX_ENERGY, current + ENERGY_REGEN * dt);
}

export function createShots(id: WeaponId, aimX: number, aimY: number, power = 0): Shot[] {
  const angle = Math.atan2(aimY, aimX);
  const spread = id === 'fan' ? [-0.24, 0, 0.24] : [0];
  const speed = id === 'lance' ? 730 : id === 'fan' ? 460 : 520;
  return spread.map(offset => ({
    vx: Math.cos(angle + offset) * speed,
    vy: Math.sin(angle + offset) * speed,
    damage: (id === 'lance' ? 3 : 1) + power,
    life: id === 'lance' ? 1.4 : id === 'fan' ? 0.9 : 1.5,
    color: id === 'lance' ? 0xd9a36c : id === 'fan' ? 0xf2d39a : 0xe9c48a,
    radius: id === 'lance' ? 8 : 6,
  }));
}
