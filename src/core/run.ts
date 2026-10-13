import type { OBSTACLES } from './arena';
import { biomeForRun, type BiomeId } from '../content/biomes.ts';

export type Direction = 'north' | 'east' | 'south' | 'west';
export type RoomKind = 'start' | 'combat' | 'reward' | 'boss';
export type RewardKind = 'gear' | 'affinity' | null;
export type Room = {
  id: number;
  world: number;
  stage: number;
  x: number;
  y: number;
  neighbors: Partial<Record<Direction, number>>;
  obstacles: typeof OBSTACLES;
  kind: RoomKind;
  reward: RewardKind;
  biome: BiomeId;
  encounterSeed: number;
};

export const STAGES_PER_WORLD = 5;
export const FIRST_CHECKPOINT_WORLD = 3;

export function parseRunSeed(value: string | null): number | null {
  if (value === null || !/^(0|[1-9]\d*)$/.test(value)) return null;
  const seed = Number(value);
  return Number.isSafeInteger(seed) && seed <= 0xffffffff ? seed : null;
}

/** Five stages per world, with a boss at 5/5 and rewards alternating gear and affinity. */
export function generateRun(seed: number, worlds = FIRST_CHECKPOINT_WORLD): Room[] {
  const rooms: Room[] = [];
  for (let world = 1; world <= worlds; world++) {
    for (let stage = 1; stage <= STAGES_PER_WORLD; stage++) {
      const id = (world - 1) * STAGES_PER_WORLD + stage - 1;
      const value = (seed ^ Math.imul(id + 1, 0x9e3779b1)) >>> 0;
      const flip = (value & 1) === 1;
      const offset = (value >>> 8) % 25 - 12;
      const obstacles = flip
        ? [{ x: 296 + offset, y: 206, w: 72, h: 68 }, { x: 610 - offset, y: 326, w: 72, h: 68 }]
        : [{ x: 296 + offset, y: 326, w: 72, h: 68 }, { x: 610 - offset, y: 206, w: 72, h: 68 }];
      rooms.push({
        id, world, stage, x: stage - 1, y: world - 1, obstacles, encounterSeed: value,
        neighbors: {
          ...(stage > 1 ? { west: id - 1 } : {}),
          ...(stage < STAGES_PER_WORLD ? { east: id + 1 } : {}),
        },
        kind: stage === 5 ? 'boss' : stage === 1 && world === 1 ? 'start' : stage % 2 ? 'reward' : 'combat',
        reward: stage === 5 ? null : stage % 2 ? 'gear' : 'affinity',
        biome: biomeForRun(seed),
      });
    }
  }
  return rooms;
}

