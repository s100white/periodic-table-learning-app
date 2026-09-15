import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fallbackElements } from '../src/data/fallback-elements.mjs';

const requiredDisplayFields = [
  'atomic_mass',
  'electron_configuration',
  'electronegativity',
  'oxidation_states',
  'atomic_radius',
  'first_ionization_energy',
  'melting_point',
  'boiling_point',
  'density',
];

describe('fallbackElements', () => {
  it('상세 패널과 비교 표에 표시되는 fallback 필드를 모두 채운다', () => {
    const incomplete = fallbackElements.flatMap((element) =>
      requiredDisplayFields
        .filter((field) => {
          const value = element[field];
          return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
        })
        .map((field) => `${element.symbol}.${field}`),
    );

    assert.deepEqual(incomplete, []);
  });

  it('사용자에게 보이는 fallback 문구에 준비 중 placeholder를 남기지 않는다', () => {
    const serialized = JSON.stringify(fallbackElements);

    assert.doesNotMatch(serialized, /준비 중/);
    assert.doesNotMatch(serialized, /확장될 예정/);
    assert.doesNotMatch(serialized, /Expected to be/);
    assert.doesNotMatch(serialized, /니은/);
    assert.doesNotMatch(serialized, /은 준금속은|은 비금속 원소는|은 전이 금속은/);
  });
});
