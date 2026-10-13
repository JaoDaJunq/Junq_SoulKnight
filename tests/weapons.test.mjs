import test from 'node:test';
import assert from 'node:assert/strict';
import { createShots, ENERGY_DELAY, MAX_ENERGY, restoreEnergy, spendEnergy, WEAPONS } from '../src/core/weapons.ts';
import { activeSynergy, altarChoices, affinityDamageBonus, ELEMENTS, emptyAffinities, gainAffinity, hasPureMastery, totalAffinity } from '../src/core/affinities.ts';
import { emptyEquipment, energyRegen, gearChoices, maxEnergy, maxHealth, maxShield } from '../src/core/equipment.ts';
import { closestTarget } from '../src/core/targeting.ts';
import { distanceToSegment } from '../src/core/geometry.ts';
import { jaoMasteryFor, jaoFormTextureSuffix } from '../src/content/jaoMasteries.ts';

test('altares oferecem três elementos distintos pela seed e mantêm um elemento já escolhido', () => {
  for (let seed = 0; seed < 100; seed++) {
    const empty = emptyAffinities();
    const first = altarChoices(seed, 0, empty);
    assert.equal(first.length, 3);
    assert.equal(new Set(first).size, 3);
    assert.deepEqual(altarChoices(seed, 0, empty), first);
    let focused = gainAffinity(empty, first[0]);
    for (let room = 1; room < 5; room++) {
      assert.ok(altarChoices(seed, room, focused).includes(first[0]));
      focused = gainAffinity(focused, first[0]);
    }
    assert.equal(totalAffinity(focused), 5);
    assert.ok(hasPureMastery(focused, first[0]));
  }
});

test('dois elementos escolhidos continuam disponíveis para fechar uma fusão 3 + 3', () => {
  for (let seed = 0; seed < 100; seed++) {
    let build = emptyAffinities();
    build = gainAffinity(build, 'fire'); build = gainAffinity(build, 'lightning');
    for (let room = 2; room < 6; room++) {
      const choices = altarChoices(seed, room, build);
      assert.ok(choices.includes('fire') && choices.includes('lightning'));
      build = gainAffinity(build, room % 2 ? 'fire' : 'lightning');
    }
    assert.equal(activeSynergy(build), 'plasma');
    assert.equal(totalAffinity(build), 6);
    assert.equal(hasPureMastery(build, 'fire'), false);
  }
  let mud = emptyAffinities();
  for (let i = 0; i < 3; i++) { mud = gainAffinity(mud, 'water'); mud = gainAffinity(mud, 'earth'); }
  assert.equal(activeSynergy(mud), 'mud');
  mud = gainAffinity(gainAffinity(mud, 'water'), 'water');
  assert.equal(activeSynergy(mud), null, 'domínio puro substitui a fusão ativa');
});

test('reliquias do baú alteram vida, escudo e energia sem trocar a arma inicial', () => {
  const empty = emptyEquipment();
  for (let seed = 0; seed < 100; seed++) {
    const choices = gearChoices(seed, 0, empty);
    assert.equal(choices.length, 3);
    assert.equal(new Set(choices).size, 3);
    assert.deepEqual(gearChoices(seed, 0, empty), choices);
  }
  const equipped = { ring: 2, armor: 1, pendant: 1, rune: 2 };
  assert.equal(maxHealth(equipped), 7);
  assert.equal(maxShield(equipped), 1);
  assert.equal(maxEnergy(equipped), 120);
  assert.ok(restoreEnergy(0, 1, 0, maxEnergy(equipped), energyRegen(equipped)) > restoreEnergy(0, 1, 0));
});

test('híbrido 3 fogo + 2 raio causa dano acumulado sem domínio puro', () => {
  let build = emptyAffinities();
  for (let i = 0; i < 3; i++) build = gainAffinity(build, 'fire');
  for (let i = 0; i < 2; i++) build = gainAffinity(build, 'lightning');
  assert.equal(totalAffinity(build), 5);
  assert.equal(affinityDamageBonus(build), 2);
  assert.equal(hasPureMastery(build, 'lightning'), false);
  assert.equal(ELEMENTS.length, 7);
});

test('Jão recebe forma e habilidade próprias ao alcançar cinco pontos elementais', () => {
  const expected = {
    earth: ['FENDA', '-earth', 'fissure'],
    water: ['MARÉ', '-water', 'wave'],
    fire: ['BRASA', '-fire', 'burst'],
    lightning: ['RAIO', '-lightning', 'blink'],
    light: ['AURORA', '-light', 'ray'],
    shadow: ['VÉU', '-shadow', 'echo'],
  };
  for (const [element, [button, suffix, effect]] of Object.entries(expected)) {
    const affinities = { ...emptyAffinities(), [element]: 4 };
    assert.equal(jaoMasteryFor(affinities), null);
    affinities[element] = 5;
    assert.equal(jaoMasteryFor(affinities)?.button, button);
    assert.equal(jaoMasteryFor(affinities)?.effect, effect);
    assert.equal(jaoFormTextureSuffix(affinities), suffix);
  }
  assert.equal(jaoMasteryFor(emptyAffinities()), null);
});

test('distância ao segmento inclui extremos e calcula a largura de cortes elementais', () => {
  assert.equal(distanceToSegment(5, 4, 0, 0, 10, 0), 4);
  assert.equal(distanceToSegment(10, 3, 0, 0, 10, 0), 3);
  assert.equal(distanceToSegment(13, 0, 0, 0, 10, 0), 3, 'ponto depois da ponta mede até a ponta');
  assert.equal(distanceToSegment(3, 4, 2, 2, 2, 2), Math.sqrt(5), 'segmento de tamanho zero vira ponto');
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

test('equipamentos iniciais têm padrões e custos de tiro distintos', () => {
  const bolt = createShots('bolt', 1, 0);
  const fan = createShots('fan', 1, 0);
  const lance = createShots('lance', 1, 0);
  assert.equal(bolt.length, 1);
  assert.equal(fan.length, 1);
  assert.equal(fan[0].vy, 0);
  assert.ok(fan[0].vx > lance[0].vx);
  assert.equal(bolt[0].vx, 0, 'espada não cria projétil');
  assert.ok(lance[0].damage > bolt[0].damage);
  assert.ok(WEAPONS.bolt.cadence < WEAPONS.lance.cadence);
  assert.equal(WEAPONS.lance.name, 'CARTAS DO GUI');
});
