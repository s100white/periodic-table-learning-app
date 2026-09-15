import { fallbackComparisonNotes, fallbackElements } from '../data/fallback-elements.mjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchSupabaseTable(tableName) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경 변수가 없어 fallback 데이터를 사용합니다.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*`, {
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

export async function loadElementData() {
  try {
    const [elements, examples, notes] = await Promise.all([
      fetchSupabaseTable('elements'),
      fetchSupabaseTable('element_examples'),
      fetchSupabaseTable('element_comparison_notes'),
    ]);

    const examplesByElement = examples.reduce((acc, example) => {
      const key = example.element_id;
      acc[key] = [...(acc[key] ?? []), example];
      return acc;
    }, {});

    return {
      elements: elements.map((element) => ({
        ...element,
        examples: examplesByElement[element.id] ?? [],
      })),
      notes,
      source: 'supabase',
      error: '',
    };
  } catch (error) {
    return {
      elements: fallbackElements,
      notes: fallbackComparisonNotes,
      source: 'fallback',
      error: error.message,
    };
  }
}

