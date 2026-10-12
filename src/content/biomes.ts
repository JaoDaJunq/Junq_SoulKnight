export type BiomeId = 'atrium' | 'forge';

export const BIOMES: Record<BiomeId, {
  name: string; backdrop: number; rim: number; floor: number; tileA: number; tileB: number;
  line: number; glyph: number; pillar: number; pillarTop: number; pillarEdge: number; accent: number;
}> = {
  atrium: {
    name: 'ÁTRIO', backdrop: 0x101d2b, rim: 0x202d3c, floor: 0x152538,
    tileA: 0x1c3140, tileB: 0x1a2a3b, line: 0x80b5b7, glyph: 0x508b95,
    pillar: 0x243f4b, pillarTop: 0x385865, pillarEdge: 0x9bc4b8, accent: 0x77c2b8,
  },
  forge: {
    name: 'FORJA DE ÂMBAR', backdrop: 0x231922, rim: 0x503544, floor: 0x2e2430,
    tileA: 0x4a3036, tileB: 0x392831, line: 0xd5a774, glyph: 0xb78362,
    pillar: 0x644150, pillarTop: 0x875763, pillarEdge: 0xf4c78d, accent: 0xf5ad72,
  },
};
