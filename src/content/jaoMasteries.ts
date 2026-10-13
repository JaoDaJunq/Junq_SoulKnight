import { ELEMENT } from '../core/affinities.ts';
import type { Affinities, ElementId } from '../core/affinities.ts';

export type JaoMasteryEffect = 'fissure' | 'wave' | 'burst' | 'blink' | 'ray' | 'echo';
export type JaoMastery = {
  element: Exclude<ElementId, 'wind'>;
  form: string;
  button: string;
  skill: string;
  effect: JaoMasteryEffect;
  color: number;
  damage: number;
  slow: number;
};

export const JAO_MASTERIES: Record<JaoMastery['element'], JaoMastery> = {
  earth: {
    element: 'earth', form: 'RONIN BASÁLTICO', button: 'FENDA',
    skill: 'Fenda Basáltica', effect: 'fissure', color: ELEMENT.earth.color, damage: 4, slow: 1.6,
  },
  water: {
    element: 'water', form: 'RONIN DA MARÉ', button: 'MARÉ',
    skill: 'Maré Ascendente', effect: 'wave', color: ELEMENT.water.color, damage: 3, slow: 2.4,
  },
  fire: {
    element: 'fire', form: 'RONIN DA BRASA', button: 'BRASA',
    skill: 'Corte da Brasa', effect: 'burst', color: ELEMENT.fire.color, damage: 4, slow: 0,
  },
  lightning: {
    element: 'lightning', form: 'RONIN DA TEMPESTADE', button: 'RAIO',
    skill: 'Passo Fulminante', effect: 'blink', color: ELEMENT.lightning.color, damage: 5, slow: 0,
  },
  light: {
    element: 'light', form: 'RONIN DA AURORA', button: 'AURORA',
    skill: 'Corte da Aurora', effect: 'ray', color: ELEMENT.light.color, damage: 5, slow: 0,
  },
  shadow: {
    element: 'shadow', form: 'RONIN DO VÉU', button: 'VÉU',
    skill: 'Corte do Véu', effect: 'echo', color: ELEMENT.shadow.color, damage: 3, slow: 0,
  },
};

export function jaoMasteryFor(affinities: Affinities): JaoMastery | null {
  const mastered = (Object.keys(JAO_MASTERIES) as JaoMastery['element'][])
    .find(element => affinities[element] >= 5);
  return mastered ? JAO_MASTERIES[mastered] : null;
}

export function jaoFormTextureSuffix(affinities: Affinities): string {
  const mastery = jaoMasteryFor(affinities);
  return mastery ? `-${mastery.element}` : '';
}
