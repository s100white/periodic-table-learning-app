import { fallbackComparisonNotes, fallbackElements } from '../data/fallback-elements.mjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const suffixByTable = {
  elements: '?select=*&order=atomic_number.asc',
  element_examples: '?select=*&order=element_id.asc,id.asc',
  element_comparison_notes: '?select=*&order=id.asc',
};

async function fetchSupabaseTable(tableName) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경 변수가 없어 fallback 데이터를 사용합니다.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}${suffixByTable[tableName]}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Supabase ${tableName} 조회 실패`);
  }

  return response.json();
}

export function assembleElementData(elements, examples, notes) {
  if (elements.length !== 118) {
    throw new Error('Supabase 원소 데이터는 정확히 118개여야 합니다.');
  }

  if (new Set(elements.map(({ id }) => id)).size !== elements.length) {
    throw new Error('Supabase 원소 ID가 중복되었습니다.');
  }

  if (new Set(elements.map(({ symbol }) => symbol)).size !== elements.length) {
    throw new Error('Supabase 원소 기호가 중복되었습니다.');
  }

  const examplesByElement = examples.reduce((acc, example) => {
    const key = example.element_id;
    acc[key] = [...(acc[key] ?? []), example];
    return acc;
  }, {});
  const sortedElements = [...elements].sort((a, b) => a.atomic_number - b.atomic_number);

  for (const element of sortedElements) {
    if (!examplesByElement[element.id]?.length) {
      throw new Error(`${element.symbol} 원소 예시가 없습니다.`);
    }
  }

  return {
    elements: sortedElements.map(({ lanthanoid_position, actinoid_position, ...element }) => ({
      ...element,
      lanthanoidPosition: lanthanoid_position,
      actinoidPosition: actinoid_position,
      examples: examplesByElement[element.id],
    })),
    notes,
  };
}

export async function loadElementData() {
  try {
    const [elements, examples, notes] = await Promise.all([
      fetchSupabaseTable('elements'),
      fetchSupabaseTable('element_examples'),
      fetchSupabaseTable('element_comparison_notes'),
    ]);

    const data = assembleElementData(elements, examples, notes);

    return {
      ...data,
      source: 'supabase',
      error: '',
    };
  } catch (error) {
    return {
      elements: fallbackElements,
      notes: fallbackComparisonNotes,
      source: 'fallback',
      error: '원소 데이터 서버에 연결하지 못해 예비 데이터를 표시합니다.',
    };
  }
}

