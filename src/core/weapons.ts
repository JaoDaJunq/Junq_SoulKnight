export type WeaponId = 'bolt' | 'fan' | 'lance';
export type Shot = { vx: number; vy: number; damage: number; life: number; color: number; radius: number };

export const MAX_ENERGY = 100;
export const ENERGY_REGEN = 12;
export const ENERGY_DELAY = 0.65;

export const WEAPONS: Record<WeaponId, { name: string; cadence: number; energy: number; description: string }> = {
  bolt: { name: 'FAÍSCA', cadence: 0.19, energy: 4, description: 'Tiro básico rápido e preciso' },
  fan: { name: 'LEQUE', cadence: 0.48, energy: 10, description: 'Três projéteis abertos' },
  lance: { name: 'LANÇA', cadence: 0.66, energy: 14, description: 'Impacto forte e alcance maior' },
};

export function chestWeapon(seed: number, roomId: number, rewardRoomIds: number[]): WeaponId {
  const position = rewardRoomIds.indexOf(roomId);
  if (position < 0) throw new Error('Baú fora de uma sala de recompensa');
  return ((seed & 1) + position) % 2 === 0 ? 'fan' : 'lance';
}

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
    color: id === 'lance' ? 0xffd48c : id === 'fan' ? 0x9af6c7 : 0x7beaff,
    radius: id === 'lance' ? 8 : 6,
  }));
}
