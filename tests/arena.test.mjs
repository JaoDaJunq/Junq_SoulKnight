import test from 'node:test';
import assert from 'node:assert/strict';
import { blocked, moveAroundObstacle, normalizedMovement } from '../src/core/arena.ts';
import { closestTarget } from '../src/core/targeting.ts';

test('inimigo contorna a quina em vez de ficar bloqueado sem linha de tiro', () => {
  const obstacles = [{ x: 610, y: 206, w: 72, h: 68 }];
  const hero = { x: 480, y: 118 };
  let enemy = { x: 700, y: 282 };
  let escape;
  const initialDistance = Math.hypot(enemy.x - hero.x, enemy.y - hero.y);
  for (let frame = 0; frame < 240; frame++) {
    const distance = Math.hypot(hero.x - enemy.x, hero.y - enemy.y);
    const moved = moveAroundObstacle(enemy.x, enemy.y, (hero.x - enemy.x) / distance,
      (hero.y - enemy.y) / distance, 48 / 60, 20, obstacles, escape);
    enemy = moved; escape = moved.escape;
    assert.equal(blocked(enemy.x, enemy.y, 20, obstacles), false);
  }
  assert.ok(Math.hypot(enemy.x - hero.x, enemy.y - hero.y) < initialDistance - 40);
  assert.equal(closestTarget(hero, [enemy], obstacles), enemy);
});

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
