const elementFields = [
  ['id', 'id'],
  ['atomic_number', 'atomic_number'],
  ['symbol', 'symbol'],
  ['name_ko', 'name_ko'],
  ['name_en', 'name_en'],
  ['atomic_mass', 'atomic_mass'],
  ['category', 'category'],
  ['period', 'period'],
  ['"group"', 'group'],
  ['block', 'block'],
  ['state_at_room_temp', 'state_at_room_temp'],
  ['electron_configuration', 'electron_configuration'],
  ['electronegativity', 'electronegativity'],
  ['oxidation_states', 'oxidation_states'],
  ['atomic_radius', 'atomic_radius'],
  ['first_ionization_energy', 'first_ionization_energy'],
  ['melting_point', 'melting_point'],
  ['boiling_point', 'boiling_point'],
  ['density', 'density'],
  ['summary', 'summary'],
  ['chemical_characteristics', 'chemical_characteristics'],
  ['series', 'series'],
  ['lanthanoid_position', 'lanthanoidPosition'],
  ['actinoid_position', 'actinoidPosition'],
];

function sqlValue(value) {
  if (value === null || value === undefined || value === '') return 'null';
  if (Array.isArray(value)) {
    return `array[${value.map(sqlValue).join(', ')}]::text[]`;
  }
  if (typeof value === 'number') return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function validateSeedData(elements, notes) {
  if (elements.length !== 118) {
    throw new Error('원소는 정확히 118개여야 합니다.');
  }

  if (new Set(elements.map(({ id }) => id)).size !== elements.length) {
    throw new Error('원소 ID 중복');
  }

  if (new Set(elements.map(({ symbol }) => symbol)).size !== elements.length) {
    throw new Error('원소 기호 중복');
  }

  const symbols = new Set(elements.map(({ symbol }) => symbol));
  for (const element of elements) {
    if (!element.examples?.length) {
      throw new Error(`${element.symbol} 예시가 없습니다.`);
    }
  }

  for (const note of notes) {
    if (!symbols.has(note.element_a_symbol) || !symbols.has(note.element_b_symbol)) {
      throw new Error('비교 설명에 알 수 없는 원소 기호가 있습니다.');
    }
  }

  return {
    elements: elements.length,
    examples: elements.reduce((count, element) => count + element.examples.length, 0),
    notes: notes.length,
  };
}

function valuesList(rows) {
  return rows.map((row) => `  (${row.join(', ')})`).join(',\n');
}

export function createSeedSql(elements, notes) {
  validateSeedData(elements, notes);

  const elementRows = elements.map((element) =>
    elementFields.map(([, key]) => sqlValue(element[key])),
  );
  const exampleRows = elements.flatMap((element) =>
    element.examples.map((example) => [
      sqlValue(element.id),
      sqlValue(example.title),
      sqlValue(example.description),
      sqlValue(example.context),
    ]),
  );
  const noteRows = notes.map((note) => [
    sqlValue(note.element_a_symbol),
    sqlValue(note.element_b_symbol),
    sqlValue(note.topic),
    sqlValue(note.note),
  ]);
  const updateFields = elementFields
    .filter(([column]) => column !== 'atomic_number')
    .map(([column]) => `  ${column} = excluded.${column}`)
    .concat('  updated_at = now()')
    .join(',\n');

  return `begin;

insert into public.elements (
  ${elementFields.map(([column]) => column).join(', ')}
) values
${valuesList(elementRows)}
on conflict (atomic_number) do update set
${updateFields};

delete from public.element_comparison_notes;
delete from public.element_examples;

insert into public.element_examples (element_id, title, description, context) values
${valuesList(exampleRows)};

insert into public.element_comparison_notes (
  element_a_symbol, element_b_symbol, topic, note
) values
${valuesList(noteRows)};

commit;
`;
}
