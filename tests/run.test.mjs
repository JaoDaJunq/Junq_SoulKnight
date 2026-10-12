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
    const reached = new Set([0]);
    const pending = [0];
    while (pending.length) {
      const room = rooms[pending.pop()];
      assert.equal(blocked(480, 385, 15, room.obstacles), false);
      for (const [direction, neighbor] of Object.entries(room.neighbors)) {
        assert.equal(rooms[neighbor].neighbors[opposite[direction]], room.id);
        if (!reached.has(neighbor)) { reached.add(neighbor); pending.push(neighbor); }
      }
    }
    assert.equal(reached.size, 6, `seed ${seed}`);
    signatures.add(rooms.map(room => Object.entries(room.neighbors).sort().join(':')).join('|'));
    assert.deepEqual(generateRun(seed), rooms);
  }
  assert.ok(signatures.size > 1, 'seeds diferentes devem variar as conexões');
});
