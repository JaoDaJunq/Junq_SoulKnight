export type BiomeId = 'atrium' | 'forge' | 'crypt' | 'grove' | 'tide' | 'crystal' | 'eclipse';

export const WORLD_BIOMES: readonly BiomeId[] = ['grove', 'crypt', 'tide', 'crystal', 'eclipse'];

/** The run seed chooses one map, which stays active for the whole expedition. */
export function biomeForRun(seed: number): BiomeId {
  let state = seed >>> 0;
  state = Math.imul(state ^ (state >>> 16), 0x7feb352d);
  state = Math.imul(state ^ (state >>> 15), 0x846ca68b);
  state = (state ^ (state >>> 16)) >>> 0;
  if (state === 0) state = 0x9e3779b9;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
  return WORLD_BIOMES[Math.floor(random() * WORLD_BIOMES.length)];
}

export const BIOMES: Record<BiomeId, {
  name: string; backdrop: number; backdropTint?: number; rim: number; floor: number; tileA: number; tileB: number;
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
  grove: {
    name: 'MATA DE ESPOROS', backdrop: 0x14231c, backdropTint: 0xa8c783, rim: 0x32563c, floor: 0x1e3225,
    tileA: 0x294331, tileB: 0x20372b, line: 0x71925b, glyph: 0x6d9a63,
    pillar: 0x34543a, pillarTop: 0x537344, pillarEdge: 0x1a3023, accent: 0xb0d97a,
  },
  crypt: {
    name: 'CRIPTA DAS VELAS', backdrop: 0x201b27, backdropTint: 0xb8a6d2, rim: 0x6b526a, floor: 0x302633,
    tileA: 0x423348, tileB: 0x382c3e, line: 0xb9a180, glyph: 0x91779f,
    pillar: 0x65536a, pillarTop: 0x8b728e, pillarEdge: 0x312736, accent: 0xd2b6d9,
  },
  tide: {
    name: 'RUÍNAS AFOGADAS', backdrop: 0x10232b, backdropTint: 0x83c8c8, rim: 0x235463, floor: 0x183640,
    tileA: 0x214956, tileB: 0x1a3d49, line: 0x63b4b6, glyph: 0x438b96,
    pillar: 0x315d65, pillarTop: 0x4d7e7f, pillarEdge: 0x17323c, accent: 0x75d9d3,
  },
  crystal: {
    name: 'CAVERNAS DE CRISTAL', backdrop: 0x17172d, backdropTint: 0xaaa3e3, rim: 0x494b83, floor: 0x262641,
    tileA: 0x36365b, tileB: 0x2d2d50, line: 0x9a91dc, glyph: 0x7777bb,
    pillar: 0x44466e, pillarTop: 0x6c6da0, pillarEdge: 0x21223c, accent: 0xc5b5ff,
  },
  eclipse: {
    name: 'FENDA DO ECLIPSE', backdrop: 0x111322, backdropTint: 0x7779bb, rim: 0x353657, floor: 0x1b1d34,
    tileA: 0x292b48, tileB: 0x22243d, line: 0x7779bb, glyph: 0x55578e,
    pillar: 0x3c3d61, pillarTop: 0x5d5f8c, pillarEdge: 0x191a30, accent: 0xa9a7ff,
  },
};
