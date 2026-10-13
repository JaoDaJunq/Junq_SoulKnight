import test from 'node:test';
import assert from 'node:assert/strict';
import { blocked } from '../src/core/arena.ts';
import { FIRST_CHECKPOINT_WORLD, generateRun, parseRunSeed, STAGES_PER_WORLD } from '../src/core/run.ts';
import { encounterFor, MONSTER_ROSTERS } from '../src/content/encounters.ts';

test('seed de URL aceita inteiros uint32 e rejeita entradas inválidas', () => {
  assert.equal(parseRunSeed('0'), 0);
  assert.equal(parseRunSeed('4294967295'), 4294967295);
  for (const value of [null, '', '-1', '1.5', '01', '4294967296', 'abc', '1e3']) assert.equal(parseRunSeed(value), null);
});

test('100 seeds têm três mundos de 1/5 a 5/5, recompensas alternadas e saída livre', () => {
  assert.equal(FIRST_CHECKPOINT_WORLD, 3);
  assert.equal(STAGES_PER_WORLD, 5);
  const layouts = new Set();
  for (let seed = 0; seed < 100; seed++) {
    const rooms = generateRun(seed);
    assert.equal(rooms.length, 15);
    assert.deepEqual(generateRun(seed), rooms);
    for (const room of rooms) {
      const { id, world, stage } = room;
      assert.equal(world, Math.floor(id / 5) + 1);
      assert.equal(stage, id % 5 + 1);
      assert.equal(room.reward, stage === 5 ? null : stage % 2 ? 'gear' : 'affinity');
      assert.equal(room.kind === 'boss', stage === 5);
      assert.equal(room.neighbors.west, stage === 1 ? undefined : id - 1);
      assert.equal(room.neighbors.east, stage === 5 ? undefined : id + 1);
      assert.equal(room.biome, ['atrium', 'grove', 'crypt'][world - 1]);
      assert.equal(blocked(480, 385, 15, room.obstacles), false);
      for (const [x, y] of [[89, 285], [871, 285], [480, 118], [480, 447]])
        assert.equal(blocked(x, y, 15, room.obstacles), false, `porta bloqueada: seed ${seed}, sala ${id}`);
      if (stage === 5) {
        const bosses = encounterFor(room);
        assert.equal(bosses.length, 1);
        assert.equal(bosses[0].kind, 'boss');
        if (world > 1) assert.ok(bosses[0].variant);
      }
    }
    layouts.add(rooms.map(room => room.obstacles[0].y + ':' + room.obstacles[0].x).join('|'));
    const extraWorld = generateRun(seed, 4);
    assert.deepEqual(extraWorld.slice(0, 15), rooms);
    assert.equal(extraWorld[19].kind, 'boss');
  }
  assert.ok(layouts.size > 1);
});

test('mundos 2 a 6 têm bioma e elenco próprios com 4 comuns, 2 elites e 2 chefes', () => {
  const rooms = generateRun(42, 6);
  assert.equal(rooms.length, 30);
  const expected = ['grove', 'crypt', 'tide', 'crystal', 'eclipse'];
  for (let world = 2; world <= 6; world++) {
    const worldRooms = rooms.filter(room => room.world === world);
    assert.ok(worldRooms.every(room => room.biome === expected[world - 2]));
    const roster = MONSTER_ROSTERS[worldRooms[0].biome];
    assert.equal(roster.normal.length, 4);
    assert.equal(roster.elite.length, 2);
    assert.equal(roster.bosses.length, 2);
    assert.ok(worldRooms.some(room => encounterFor(room).some(enemy => enemy.variant)));
  }
  assert.equal(generateRun(42, 8)[34].biome, 'grove');
  assert.equal(generateRun(42, 8)[39].biome, 'crypt');
});

test('encontros são reproduzíveis pela seed e variam os monstros e o chefe', () => {
  const first = generateRun(8, 3).find(room => room.world === 2 && room.stage === 4);
  assert.deepEqual(encounterFor(first), encounterFor(generateRun(8, 3).find(room => room.world === 2 && room.stage === 4)));
  const compositions = new Set();
  const bosses = new Set();
  for (let seed = 0; seed < 40; seed++) {
    const rooms = generateRun(seed, 3);
    compositions.add(encounterFor(rooms.find(room => room.world === 2 && room.stage === 4)).map(enemy => enemy.variant).join(','));
    bosses.add(encounterFor(rooms.find(room => room.world === 2 && room.stage === 5))[0].variant);
  }
  assert.ok(compositions.size > 1);
  assert.equal(bosses.size, 2);
});

