import test from 'node:test';
import assert from 'node:assert/strict';
import { OBSTACLES, blocked } from '../src/core/arena.ts';
import { ADMIN_FORMS, adminAffinitiesFor, adminSpawnPoint } from '../src/core/admin.ts';
import { ELEMENTS, totalAffinity } from '../src/core/affinities.ts';
import { jaoMasteryFor } from '../src/content/jaoMasteries.ts';

test('kit ADM define forma base e libera cada sintonia pura do Jão no nível máximo', () => {
  assert.deepEqual(adminAffinitiesFor('base'), { fire: 0, water: 0, lightning: 0, wind: 0, earth: 0, shadow: 0, light: 0 });
  for (const form of ADMIN_FORMS.filter(option => option.element)) {
    const affinities = adminAffinitiesFor(form.id);
    assert.equal(totalAffinity(affinities), 5);
    assert.equal(affinities[form.element], 5);
    assert.equal(ELEMENTS.filter(element => affinities[element] > 0).length, 1);
    assert.equal(jaoMasteryFor(affinities)?.element, form.element);
  }
});

test('spawn do ADM mantém inimigos dentro da arena e afastados entre si', () => {
  const kinds = ['chaser', 'shooter', 'sentry', 'brute', 'boss'];
  const occupied = [];
  let previous = null;
  for (const [sequence, kind] of kinds.entries()) {
    const point = adminSpawnPoint({ x: 480, y: 385 }, kind, OBSTACLES, occupied, sequence);
    assert.ok(point, `deveria encontrar posição para ${kind}`);
    assert.equal(blocked(point.x, point.y, kind === 'boss' ? 34 : kind === 'brute' ? 22 : 17, OBSTACLES), false);
    if (previous) assert.ok(Math.hypot(point.x - previous.x, point.y - previous.y) >= 50);
    occupied.push({ ...point, kind });
    previous = point;
  }
});
