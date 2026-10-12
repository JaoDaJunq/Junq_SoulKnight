import test from 'node:test';
import assert from 'node:assert/strict';
import { createShots, rewardOptions, WEAPONS } from '../src/core/weapons.ts';

test('recompensas sempre oferecem duas armas diferentes e melhoria útil', () => {
  for (const id of Object.keys(WEAPONS)) {
    const choices = rewardOptions(id);
    assert.equal(choices.length, 3);
    assert.equal(new Set(choices).size, 3);
    assert.ok(!choices.includes(id));
    assert.ok(choices.includes('power'));
  }
});

test('armas mudam o padrão de tiro e o upgrade aumenta dano', () => {
  const bolt = createShots('bolt', 1, 0);
  const fan = createShots('fan', 1, 0);
  const lance = createShots('lance', 1, 0);
  assert.equal(bolt.length, 1);
  assert.equal(fan.length, 3);
  assert.ok(fan[0].vy < 0 && fan[2].vy > 0);
  assert.ok(lance[0].damage > bolt[0].damage);
  assert.ok(WEAPONS.bolt.cadence < WEAPONS.lance.cadence);
  assert.equal(createShots('bolt', 1, 0, 1)[0].damage, bolt[0].damage + 1);
});
