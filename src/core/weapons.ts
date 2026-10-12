export type WeaponId = 'bolt' | 'fan' | 'lance';
export type RewardOption = WeaponId | 'power';
export type Shot = { vx: number; vy: number; damage: number; life: number; color: number; radius: number };

export const WEAPONS: Record<WeaponId, { name: string; cadence: number; description: string }> = {
  bolt: { name: 'FAÍSCA', cadence: 0.19, description: 'Tiro rápido e preciso' },
  fan: { name: 'LEQUE', cadence: 0.48, description: 'Três projéteis abertos' },
  lance: { name: 'LANÇA', cadence: 0.66, description: 'Impacto forte e alcance maior' },
};

export function rewardOptions(equipped: WeaponId): RewardOption[] {
  return ([...Object.keys(WEAPONS) as WeaponId[]].filter(id => id !== equipped) as RewardOption[]).concat('power');
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
