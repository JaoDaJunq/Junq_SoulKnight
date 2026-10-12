import test from 'node:test';
import assert from 'node:assert/strict';
import { blocked } from '../src/core/arena.ts';
import { generateRun } from '../src/core/run.ts';

test('100 seeds geram seis salas alcançáveis com portas pareadas e spawn livre', () => {
  const opposite = { north: 'south', east: 'west', south: 'north', west: 'east' };
  const signatures = new Set();
  for (let seed = 0; seed < 100; seed++) {
    const rooms = generateRun(seed);
    assert.equal(rooms.length, 6);
    assert.equal(rooms.filter(room => room.kind === 'boss').length, 1);
    assert.equal(rooms.filter(room => room.kind === 'reward').length, 2);
    assert.equal(rooms[0].kind, 'start');
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
