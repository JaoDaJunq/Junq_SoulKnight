import test from 'node:test';
import assert from 'node:assert/strict';
import { blocked, normalizedMovement } from '../src/core/arena.ts';

test('movimento diagonal conserva a mesma velocidade máxima', () => {
  const move = normalizedMovement(1, 1);
  assert.ok(Math.abs(Math.hypot(move.x, move.y) - 1) < 1e-9);
  assert.deepEqual(normalizedMovement(0, 0), { x: 0, y: 0 });
});

test('jogador não atravessa parede ou quina de obstáculo', () => {
  assert.equal(blocked(64, 300, 15), true);
  assert.equal(blocked(480, 385, 15), false);
  assert.equal(blocked(290, 200, 15), true);
  assert.equal(blocked(275, 190, 15), false);
});
