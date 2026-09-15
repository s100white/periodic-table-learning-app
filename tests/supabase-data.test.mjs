import assert from 'node:assert/strict';
import test from 'node:test';
import { fallbackElements } from '../src/data/fallback-elements.mjs';
import { assembleElementData } from '../src/lib/supabase.mjs';

function createSupabaseRows() {
  const elements = fallbackElements
    .map(({ examples, lanthanoidPosition, actinoidPosition, ...element }) => ({
      ...element,
      lanthanoid_position: lanthanoidPosition,
      actinoid_position: actinoidPosition,
    }))
    .reverse();
  const examples = fallbackElements.flatMap((element, elementIndex) =>
    element.examples.map((example, exampleIndex) => ({
      id: elementIndex * 10 + exampleIndex + 1,
      element_id: element.id,
      ...example,
    })),
  );

  return { elements, examples };
}

test('원소를 원자번호 순으로 정렬하고 예시를 연결한다', () => {
  const { elements, examples } = createSupabaseRows();
  const result = assembleElementData(elements, examples, []);

  assert.deepEqual(result.elements.slice(0, 2).map(({ symbol }) => symbol), ['H', 'He']);
  assert.equal(result.elements[0].examples[0].title, '연료전지');
  assert.equal(result.elements.find(({ symbol }) => symbol === 'Ce').lanthanoidPosition, 4);
  assert.equal(result.elements.find(({ symbol }) => symbol === 'Th').actinoidPosition, 4);
});

test('원소가 118개가 아니면 거부한다', () => {
  const { elements, examples } = createSupabaseRows();

  assert.throws(() => assembleElementData(elements.slice(1), examples, []), /118개/);
});

test('예시가 없는 원소가 있으면 거부한다', () => {
  const { elements, examples } = createSupabaseRows();
  const hydrogenExamplesRemoved = examples.filter(({ element_id }) => element_id !== 1);

  assert.throws(() => assembleElementData(elements, hydrogenExamplesRemoved, []), /예시/);
});
