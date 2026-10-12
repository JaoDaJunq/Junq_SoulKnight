export type BiomeId = 'atrium' | 'forge' | 'crypt';

export const BIOMES: Record<BiomeId, {
  name: string; backdrop: number; rim: number; floor: number; tileA: number; tileB: number;
  line: number; glyph: number; pillar: number; pillarTop: number; pillarEdge: number; accent: number;
}> = {
  atrium: {
    name: 'ÁTRIO', backdrop: 0x251911, rim: 0x64432b, floor: 0x38261d,
    tileA: 0x483025, tileB: 0x3e291e, line: 0xb78a55, glyph: 0x9c6b3d,
    pillar: 0x6a4b35, pillarTop: 0x9d7250, pillarEdge: 0x302018, accent: 0xe0aa60,
  },
  forge: {
    name: 'FORJA DE ÂMBAR', backdrop: 0x281710, rim: 0x79452c, floor: 0x422719,
    tileA: 0x59321e, tileB: 0x4b2a1c, line: 0xe0a45e, glyph: 0xc47c3d,
    pillar: 0x75432a, pillarTop: 0xad6940, pillarEdge: 0x42271b, accent: 0xf5ad72,
  },
  crypt: {
    name: 'CRIPTA DAS VELAS', backdrop: 0x201b27, rim: 0x6b526a, floor: 0x302633,
    tileA: 0x423348, tileB: 0x382c3e, line: 0xb9a180, glyph: 0x91779f,
    pillar: 0x65536a, pillarTop: 0x8b728e, pillarEdge: 0x312736, accent: 0xd2b6d9,
  },
};
