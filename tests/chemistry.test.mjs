import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  compareElements,
  filterElements,
  getComparisonNote,
  toggleComparisonSelection,
} from '../src/lib/chemistry.mjs';

const sampleElements = [
  {
    atomic_number: 1,
    symbol: 'H',
    name_ko: '수소',
    name_en: 'Hydrogen',
    category: '비금속',
    state_at_room_temp: '기체',
    period: 1,
    group: 1,
    electronegativity: 2.2,
    atomic_radius: 53,
    first_ionization_energy: 1312,
  },
  {
    atomic_number: 11,
    symbol: 'Na',
    name_ko: '나트륨',
    name_en: 'Sodium',
    category: '알칼리 금속',
    state_at_room_temp: '고체',
    period: 3,
    group: 1,
    electronegativity: 0.93,
    atomic_radius: 186,
    first_ionization_energy: 496,
  },
  {
    atomic_number: 17,
    symbol: 'Cl',
    name_ko: '염소',
    name_en: 'Chlorine',
    category: '할로젠',
    state_at_room_temp: '기체',
    period: 3,
    group: 17,
    electronegativity: 3.16,
    atomic_radius: 79,
    first_ionization_energy: 1251,
  },
];

describe('filterElements', () => {
  it('검색어와 필터를 함께 적용한다', () => {
    const result = filterElements(sampleElements, {
      query: '소',
      category: '할로젠',
      state: '기체',
      period: '3',
      group: '17',
    });

    assert.deepEqual(result.map((element) => element.symbol), ['Cl']);
  });

  it('원자번호와 영문명으로도 검색한다', () => {
    assert.equal(filterElements(sampleElements, { query: '11' })[0].symbol, 'Na');
    assert.equal(filterElements(sampleElements, { query: 'hydro' })[0].symbol, 'H');
  });
});

describe('toggleComparisonSelection', () => {
  it('두 개까지 선택하고 세 번째 선택 시 오래된 선택을 교체한다', () => {
    const selected = toggleComparisonSelection(['H', 'Na'], 'Cl');

    assert.deepEqual(selected, ['Na', 'Cl']);
  });

  it('이미 선택한 원소를 다시 누르면 비교 목록에서 제거한다', () => {
    const selected = toggleComparisonSelection(['H', 'Na'], 'H');

    assert.deepEqual(selected, ['Na']);
  });
});

describe('compareElements', () => {
  it('비교 가능한 수치 항목의 방향을 계산한다', () => {
    const rows = compareElements(sampleElements[1], sampleElements[2]);
    const electronegativity = rows.find((row) => row.key === 'electronegativity');
    const radius = rows.find((row) => row.key === 'atomic_radius');

    assert.equal(electronegativity.trend, 'b-higher');
    assert.equal(radius.trend, 'a-higher');
  });
});

describe('getComparisonNote', () => {
  it('직접 작성된 비교 설명이 없으면 원소 데이터로 기본 학습 설명을 만든다', () => {
    const note = getComparisonNote(sampleElements[1], sampleElements[2], []);

    assert.match(note, /염소/);
    assert.match(note, /전기음성도/);
    assert.match(note, /나트륨/);
  });

  it('기본 비교 설명에서 한국어 조사를 자연스럽게 붙인다', () => {
    const note = getComparisonNote(sampleElements[2], sampleElements[1], []);

    assert.match(note, /염소는/);
    assert.doesNotMatch(note, /염소은/);
  });
});
