import test from 'node:test';
import assert from 'node:assert/strict';
import { blocked } from '../src/core/arena.ts';
import { generateRun, parseRunSeed } from '../src/core/run.ts';
import { encounterFor } from '../src/content/encounters.ts';

test('seed de URL aceita inteiros uint32 e rejeita entradas inválidas', () => {
  assert.equal(parseRunSeed('0'), 0);
  assert.equal(parseRunSeed('4294967295'), 4294967295);
  for (const value of [null, '', '-1', '1.5', '01', '4294967296', 'abc', '1e3']) assert.equal(parseRunSeed(value), null);
});

test('100 seeds geram seis salas alcançáveis com portas pareadas e spawn livre', () => {
  const opposite = { north: 'south', east: 'west', south: 'north', west: 'east' };
  const signatures = new Set();
  for (let seed = 0; seed < 100; seed++) {
    const rooms = generateRun(seed);
    assert.equal(rooms.length, 6);
    assert.equal(rooms.filter(room => room.kind === 'boss').length, 1);
    assert.equal(rooms.filter(room => room.kind === 'reward').length, 2);
    assert.equal(rooms[0].kind, 'start');
    assert.equal(rooms[0].biome, 'atrium');
    assert.ok(rooms.some(room => room.biome === 'forge' && room.kind !== 'boss'), `seed ${seed}: sem encontro na forja`);
    assert.ok(rooms.some(room => room.biome === 'forge' && room.kind === 'reward'), `seed ${seed}: sem baú na forja`);
    const reached = new Set([0]);
    const pending = [0];
    while (pending.length) {
      const room = rooms[pending.pop()];
      assert.equal(blocked(480, 385, 15, room.obstacles), false);
      for (const [x, y] of [[89, 285], [871, 285], [480, 118], [480, 447]]) {
        assert.equal(blocked(x, y, 15, room.obstacles), false, `porta bloqueada: seed ${seed}, sala ${room.id}`);
      }
      for (const [direction, neighbor] of Object.entries(room.neighbors)) {
        assert.equal(rooms[neighbor].neighbors[opposite[direction]], room.id);
        if (!reached.has(neighbor)) { reached.add(neighbor); pending.push(neighbor); }
      }
    }
    assert.equal(reached.size, 6, `seed ${seed}`);
    const boss = rooms.find(room => room.kind === 'boss');
    assert.ok(reached.has(boss.id));
    assert.equal(boss.biome, 'forge');
    for (const room of rooms) {
      const encounter = encounterFor(room);
      if (room.kind === 'boss') assert.deepEqual(encounter, ['boss']);
      else if (room.biome === 'forge') assert.ok(encounter.includes('sentry') && !encounter.includes('shooter'));
      else assert.ok(encounter.includes('shooter') && !encounter.includes('sentry'));
    }
    const parent = new Map([[0, null]]);
    const search = [0];
    while (search.length) {
      const id = search.shift();
      for (const next of Object.values(rooms[id].neighbors)) {
        if (!parent.has(next)) { parent.set(next, id); search.push(next); }
      }
    }
    let rewardOnPath = false;
    for (let id = parent.get(boss.id); id !== null; id = parent.get(id)) {
      if (rooms[id].kind === 'reward') rewardOnPath = true;
    }
    assert.ok(rewardOnPath, `seed ${seed}: sem recompensa antes do chefe`);
    signatures.add(rooms.map(room => Object.entries(room.neighbors).sort().join(':')).join('|'));
    assert.deepEqual(generateRun(seed), rooms);
  }
  assert.ok(signatures.size > 1, 'seeds diferentes devem variar as conexões');
});
