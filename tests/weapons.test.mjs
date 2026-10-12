import test from 'node:test';
import assert from 'node:assert/strict';
import { chestWeapon, createShots, ENERGY_DELAY, MAX_ENERGY, restoreEnergy, spendEnergy, WEAPONS } from '../src/core/weapons.ts';
import { closestTarget } from '../src/core/targeting.ts';

test('baús oferecem as duas armas extras na run e são reproduzíveis pela seed', () => {
  for (let seed = 0; seed < 100; seed++) {
    const contents = [chestWeapon(seed, 2, [2, 4]), chestWeapon(seed, 4, [2, 4])];
    assert.deepEqual(new Set(contents), new Set(['fan', 'lance']));
    assert.equal(chestWeapon(seed, 2, [2, 4]), contents[0]);
  }
  assert.throws(() => chestWeapon(0, 1, [2, 4]));
});

test('segurar o disparo esgota a energia, pausa e restaura sem ultrapassar o máximo', () => {
  for (const weapon of Object.keys(WEAPONS)) {
    let energy = MAX_ENERGY;
    let shots = 0;
    while (spendEnergy(energy, weapon) !== null) { energy = spendEnergy(energy, weapon); shots++; }
    assert.ok(shots > 0 && shots <= MAX_ENERGY / WEAPONS[weapon].energy);
    assert.equal(spendEnergy(energy, weapon), null);
    assert.equal(restoreEnergy(energy, ENERGY_DELAY / 2, ENERGY_DELAY / 2), energy);
    assert.ok(restoreEnergy(energy, 1, 0) > energy);
    assert.equal(restoreEnergy(MAX_ENERGY, 1, 0), MAX_ENERGY);
  }
});

test('mira escolhe o inimigo visível mais próximo e ignora obstáculos', () => {
  const hero = { x: 200, y: 250 };
  const hidden = { x: 390, y: 250, id: 'oculto' };
  const visible = { x: 220, y: 440, id: 'visível' };
  const obstacles = [{ x: 270, y: 220, w: 60, h: 65 }];
  assert.equal(closestTarget(hero, [hidden, visible], obstacles), visible);
  assert.equal(closestTarget(hero, [hidden], obstacles), undefined);
  assert.equal(closestTarget(hero, [visible, hidden], []), hidden);
  assert.equal(closestTarget(hero, [], []), undefined);
});

test('armas mudam o padrão de tiro', () => {
  const bolt = createShots('bolt', 1, 0);
  const fan = createShots('fan', 1, 0);
  const lance = createShots('lance', 1, 0);
  assert.equal(bolt.length, 1);
  assert.equal(fan.length, 3);
  assert.ok(fan[0].vy < 0 && fan[2].vy > 0);
  assert.ok(lance[0].damage > bolt[0].damage);
  assert.ok(WEAPONS.bolt.cadence < WEAPONS.lance.cadence);
});
