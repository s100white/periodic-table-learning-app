import assert from 'node:assert/strict';
import test from 'node:test';
import { fallbackComparisonNotes, fallbackElements } from '../src/data/fallback-elements.mjs';
import { createSeedSql, validateSeedData } from '../src/lib/seed-sql.mjs';

test('118개 원소와 원소별 예시를 검증한다', () => {
  const summary = validateSeedData(fallbackElements, fallbackComparisonNotes);

  assert.deepEqual(summary, { elements: 118, examples: 118, notes: 2 });
});

test('중복 원소 기호를 거부한다', () => {
  const duplicate = fallbackElements.map((element, index) =>
    index === 1 ? { ...element, symbol: fallbackElements[0].symbol } : element,
  );

  assert.throws(() => validateSeedData(duplicate, fallbackComparisonNotes), /원소 기호 중복/);
});

test('예시가 없는 원소를 거부한다', () => {
  const missing = fallbackElements.map((element, index) =>
    index === 0 ? { ...element, examples: [] } : element,
  );

  assert.throws(() => validateSeedData(missing, fallbackComparisonNotes), /예시가 없습니다/);
});

test('시드 SQL은 트랜잭션과 충돌 갱신을 포함한다', () => {
  const sql = createSeedSql(fallbackElements, fallbackComparisonNotes);

  assert.match(sql, /^begin;/i);
  assert.match(sql, /on conflict \(atomic_number\) do update/i);
  assert.match(sql, /commit;\s*$/i);
  assert.match(sql, /"group"/);
  assert.match(sql, /lanthanoid_position/);
});
