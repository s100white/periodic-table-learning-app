export const ALL_VALUE = 'all';

const comparableFields = [
  ['atomic_number', '원자번호', 'number'],
  ['atomic_mass', '원자량', 'number'],
  ['category', '원소 계열', 'text'],
  ['state_at_room_temp', '상온 상태', 'text'],
  ['electron_configuration', '전자배치', 'text'],
  ['electronegativity', '전기음성도', 'number'],
  ['oxidation_states', '주요 산화수', 'text'],
  ['atomic_radius', '원자 반지름', 'number'],
  ['first_ionization_energy', '1차 이온화 에너지', 'number'],
  ['melting_point', '녹는점', 'number'],
  ['boiling_point', '끓는점', 'number'],
  ['density', '밀도', 'number'],
];

export function normalizeText(value) {
  return String(value ?? '').trim().toLocaleLowerCase('ko-KR');
}

export function formatValue(value, fallback = '데이터 준비 중') {
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : fallback;
  }
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
}

function topicParticle(word) {
  const lastChar = String(word).trim().at(-1);
  const code = lastChar?.charCodeAt(0);
  if (!code || code < 0xac00 || code > 0xd7a3) {
    return '는';
  }
  return (code - 0xac00) % 28 === 0 ? '는' : '은';
}

export function filterElements(elements, filters = {}) {
  const query = normalizeText(filters.query);

  return elements.filter((element) => {
    const queryTarget = [
      element.atomic_number,
      element.symbol,
      element.name_ko,
      element.name_en,
    ]
      .map(normalizeText)
      .join(' ');

    const matchesQuery = !query || queryTarget.includes(query);
    const matchesCategory =
      !filters.category || filters.category === ALL_VALUE || element.category === filters.category;
    const matchesState =
      !filters.state || filters.state === ALL_VALUE || element.state_at_room_temp === filters.state;
    const matchesPeriod =
      !filters.period || filters.period === ALL_VALUE || String(element.period) === String(filters.period);
    const matchesGroup =
      !filters.group || filters.group === ALL_VALUE || String(element.group) === String(filters.group);

    return matchesQuery && matchesCategory && matchesState && matchesPeriod && matchesGroup;
  });
}

export function toggleComparisonSelection(selectedSymbols, symbol) {
  if (selectedSymbols.includes(symbol)) {
    return selectedSymbols.filter((selected) => selected !== symbol);
  }

  if (selectedSymbols.length < 2) {
    return [...selectedSymbols, symbol];
  }

  return [selectedSymbols[1], symbol];
}

export function compareElements(elementA, elementB) {
  if (!elementA || !elementB) {
    return [];
  }

  return comparableFields.map(([key, label, type]) => {
    const valueA = elementA[key];
    const valueB = elementB[key];
    let trend = 'same-or-text';

    if (type === 'number' && Number.isFinite(Number(valueA)) && Number.isFinite(Number(valueB))) {
      const numberA = Number(valueA);
      const numberB = Number(valueB);
      trend = numberA === numberB ? 'equal' : numberA > numberB ? 'a-higher' : 'b-higher';
    }

    return {
      key,
      label,
      valueA,
      valueB,
      trend,
    };
  });
}

export function getComparisonNote(elementA, elementB, notes = []) {
  if (!elementA || !elementB) {
    return '비교할 원소 두 개를 선택하면 주기적 경향성과 성질 차이를 설명합니다.';
  }

  const directNote = notes.find((note) => {
    const pair = [note.element_a_symbol, note.element_b_symbol].filter(Boolean).sort().join('|');
    const selectedPair = [elementA.symbol, elementB.symbol].sort().join('|');
    return pair === selectedPair;
  });

  if (directNote?.note) {
    return directNote.note;
  }

  const aElectronegativity = Number(elementA.electronegativity);
  const bElectronegativity = Number(elementB.electronegativity);
  const electronegativeElement =
    Number.isFinite(aElectronegativity) && Number.isFinite(bElectronegativity)
      ? aElectronegativity >= bElectronegativity
        ? elementA
        : elementB
      : null;
  const lessElectronegativeElement =
    electronegativeElement?.symbol === elementA.symbol ? elementB : elementA;

  const aRadius = Number(elementA.atomic_radius);
  const bRadius = Number(elementB.atomic_radius);
  const largerElement =
    Number.isFinite(aRadius) && Number.isFinite(bRadius)
      ? aRadius >= bRadius
        ? elementA
        : elementB
      : null;

  if (electronegativeElement && largerElement) {
    const electronegativeParticle = topicParticle(electronegativeElement.name_ko);
    const largerParticle = topicParticle(largerElement.name_ko);
    return `${electronegativeElement.name_ko}${electronegativeParticle} ${lessElectronegativeElement.name_ko}보다 전기음성도가 커서 결합 전자를 더 강하게 끌어당기는 경향이 있습니다. 반면 ${largerElement.name_ko}${largerParticle} 원자 반지름이 더 커서 바깥 전자가 원자핵의 영향을 상대적으로 덜 받을 수 있습니다.`;
  }

  return `${elementA.name_ko}와 ${elementB.name_ko}는 계열, 주기, 전자배치가 달라 물리적 성질과 반응성이 다르게 나타납니다.`;
}

export function getUniqueOptions(elements, key) {
  return [...new Set(elements.map((element) => element[key]).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), 'ko-KR', { numeric: true }),
  );
}

export function getElementGridStyle(element) {
  if (element.series === 'lanthanide') {
    return { gridColumn: element.lanthanoidPosition, gridRow: 9 };
  }
  if (element.series === 'actinide') {
    return { gridColumn: element.actinoidPosition, gridRow: 10 };
  }
  return { gridColumn: element.group, gridRow: element.period };
}
