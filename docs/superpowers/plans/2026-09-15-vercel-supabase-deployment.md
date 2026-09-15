# Vercel 및 Supabase 전환 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub를 단일 코드 저장소로 유지하면서 원소 데이터를 Supabase에서 읽고 Vercel에서 자동 배포되는 주기율표 앱을 구축한다.

**Architecture:** Next.js 서버 컴포넌트가 Supabase REST API에서 세 테이블을 읽고 완전한 데이터일 때만 UI에 전달한다. 조회 실패나 불완전한 응답은 저장소의 fallback 데이터로 대체하며, GitHub `main` 브랜치는 Vercel Production에 자동 배포된다.

**Tech Stack:** Next.js 16, React, Node.js test runner, PostgreSQL/Supabase, GitHub, Vercel

**Spec:** `docs/superpowers/specs/2026-09-15-vercel-supabase-deployment-design.md`

## Global Constraints

- 공식 앱 주소는 Vercel Production URL 하나만 사용한다.
- Supabase에는 118개 원소와 각 원소의 예시를 한 개 이상 저장한다.
- 익명 사용자와 로그인 사용자는 Supabase 데이터를 읽기만 할 수 있다.
- 데이터베이스 비밀번호, service role key, 개인 토큰은 GitHub에 저장하지 않는다.
- `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`만 앱 환경 변수로 사용한다.
- Supabase 조회가 실패하거나 불완전하면 전체 fallback 데이터로 전환한다.
- GitHub Pages 워크플로와 GitHub Pages 서비스는 제거한다.

---

### Task 1: Supabase 스키마와 데이터 생성기

**Files:**
- Create: `supabase/migrations/202609150001_create_periodic_table.sql`
- Create: `scripts/generate-supabase-seed.mjs`
- Create: `src/lib/seed-sql.mjs`
- Create: `tests/seed-sql.test.mjs`
- Generate: `supabase/migrations/202609150002_seed_periodic_table.sql`

**Interfaces:**
- Consumes: `fallbackElements`와 `fallbackComparisonNotes` from `src/data/fallback-elements.mjs`
- Produces: `validateSeedData(elements, notes)`와 `createSeedSql(elements, notes)` from `src/lib/seed-sql.mjs`
- Produces: 재실행 가능한 PostgreSQL 스키마 및 시드 SQL

- [ ] **Step 1: 데이터 검증 실패 테스트 작성**

`tests/seed-sql.test.mjs`에 다음 동작을 검증한다.

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { fallbackComparisonNotes, fallbackElements } from '../src/data/fallback-elements.mjs';
import { createSeedSql, validateSeedData } from '../src/lib/seed-sql.mjs';

test('118개 원소와 원소별 예시를 검증한다', () => {
  const summary = validateSeedData(fallbackElements, fallbackComparisonNotes);
  assert.deepEqual(summary, { elements: 118, examples: 118, notes: 2 });
});

test('중복 원소 기호를 거부한다', () => {
  const duplicate = [...fallbackElements, { ...fallbackElements[0], id: 119 }];
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
});
```

- [ ] **Step 2: 테스트가 구현 부재로 실패하는지 확인**

Run: `pnpm test`

Expected: `src/lib/seed-sql.mjs`를 찾을 수 없어 FAIL.

- [ ] **Step 3: 시드 검증 및 SQL 직렬화 구현**

`src/lib/seed-sql.mjs`는 다음 규칙을 구현한다.

```js
const elementFields = [
  ['id', 'id'], ['atomic_number', 'atomic_number'], ['symbol', 'symbol'],
  ['name_ko', 'name_ko'], ['name_en', 'name_en'], ['atomic_mass', 'atomic_mass'],
  ['category', 'category'], ['period', 'period'], ['"group"', 'group'],
  ['block', 'block'], ['state_at_room_temp', 'state_at_room_temp'],
  ['electron_configuration', 'electron_configuration'],
  ['electronegativity', 'electronegativity'], ['oxidation_states', 'oxidation_states'],
  ['atomic_radius', 'atomic_radius'],
  ['first_ionization_energy', 'first_ionization_energy'],
  ['melting_point', 'melting_point'], ['boiling_point', 'boiling_point'],
  ['density', 'density'], ['summary', 'summary'],
  ['chemical_characteristics', 'chemical_characteristics'], ['series', 'series'],
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
  if (elements.length !== 118) throw new Error('원소는 정확히 118개여야 합니다.');
  if (new Set(elements.map(({ id }) => id)).size !== 118) throw new Error('원소 ID 중복');
  if (new Set(elements.map(({ symbol }) => symbol)).size !== 118) throw new Error('원소 기호 중복');
  for (const element of elements) {
    if (!element.examples?.length) throw new Error(`${element.symbol} 예시가 없습니다.`);
  }
  return {
    elements: elements.length,
    examples: elements.reduce((count, element) => count + element.examples.length, 0),
    notes: notes.length,
  };
}
```

`createSeedSql`은 `elementFields`의 첫 항목을 SQL 열 이름으로, 두 번째 항목을 JavaScript 객체 키로 사용한다. 따라서 예약어인 `"group"`은 항상 따옴표 처리되고 camelCase 위치 값은 snake_case 데이터베이스 열에 들어간다. 함수는 `begin;`으로 시작하고 다음 순서로 SQL을 만든다.

1. `elements`를 `atomic_number` 충돌 시 전체 필드 갱신 방식으로 upsert한다.
2. `element_examples`와 `element_comparison_notes`를 비운다.
3. fallback의 모든 예시와 비교 설명을 삽입한다.
4. `commit;`으로 끝낸다.

- [ ] **Step 4: PostgreSQL 스키마 작성**

`supabase/migrations/202609150001_create_periodic_table.sql`에 다음 구조를 작성한다.

```sql
create table if not exists public.elements (
  id integer primary key,
  atomic_number smallint not null unique check (atomic_number between 1 and 118),
  symbol text not null unique,
  name_ko text not null,
  name_en text not null,
  atomic_mass double precision,
  category text not null,
  period smallint not null check (period between 1 and 7),
  "group" smallint check ("group" between 1 and 18),
  block text not null,
  state_at_room_temp text not null,
  electron_configuration text,
  electronegativity double precision,
  oxidation_states text[] not null default '{}',
  atomic_radius double precision,
  first_ionization_energy double precision,
  melting_point double precision,
  boiling_point double precision,
  density double precision,
  summary text not null,
  chemical_characteristics text not null,
  series text not null default 'main',
  lanthanoid_position smallint,
  actinoid_position smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.element_examples (
  id bigint generated always as identity primary key,
  element_id integer not null references public.elements(id) on delete cascade,
  title text not null,
  description text not null,
  context text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (element_id, title)
);

create table if not exists public.element_comparison_notes (
  id bigint generated always as identity primary key,
  element_a_symbol text not null references public.elements(symbol) on delete cascade,
  element_b_symbol text not null references public.elements(symbol) on delete cascade,
  topic text not null,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (element_a_symbol, element_b_symbol, topic),
  check (element_a_symbol <> element_b_symbol)
);

alter table public.elements enable row level security;
alter table public.element_examples enable row level security;
alter table public.element_comparison_notes enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.elements to anon, authenticated;
grant select on public.element_examples to anon, authenticated;
grant select on public.element_comparison_notes to anon, authenticated;

create policy "public read elements" on public.elements
  for select to anon, authenticated using (true);
create policy "public read examples" on public.element_examples
  for select to anon, authenticated using (true);
create policy "public read comparison notes" on public.element_comparison_notes
  for select to anon, authenticated using (true);
```

- [ ] **Step 5: 시드 생성 명령 작성 및 실행**

`scripts/generate-supabase-seed.mjs`:

```js
import { writeFile } from 'node:fs/promises';
import { fallbackComparisonNotes, fallbackElements } from '../src/data/fallback-elements.mjs';
import { createSeedSql, validateSeedData } from '../src/lib/seed-sql.mjs';

validateSeedData(fallbackElements, fallbackComparisonNotes);
await writeFile(
  new URL('../supabase/migrations/202609150002_seed_periodic_table.sql', import.meta.url),
  createSeedSql(fallbackElements, fallbackComparisonNotes),
  'utf8',
);
```

Run: `node scripts/generate-supabase-seed.mjs`

Expected: `supabase/migrations/202609150002_seed_periodic_table.sql` 생성.

- [ ] **Step 6: 테스트 및 생성 결과 확인**

Run: `pnpm test && rg -c "insert into public.elements" supabase/migrations/202609150002_seed_periodic_table.sql`

Expected: 모든 테스트 PASS, 검색 결과가 `1` 이상.

- [ ] **Step 7: 커밋**

```bash
git add src/lib/seed-sql.mjs scripts/generate-supabase-seed.mjs tests/seed-sql.test.mjs supabase/migrations
git commit -m "feat: add Supabase schema and periodic table seed"
```

---

### Task 2: Supabase 응답 검증과 안전한 fallback

**Files:**
- Modify: `src/lib/supabase.mjs`
- Create: `tests/supabase-data.test.mjs`

**Interfaces:**
- Consumes: Supabase REST 배열 `elements`, `element_examples`, `element_comparison_notes`
- Produces: `assembleElementData(elements, examples, notes)`
- Produces: `loadElementData(): Promise<{elements, notes, source, error}>`

- [ ] **Step 1: 응답 조립 테스트 작성**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { fallbackElements } from '../src/data/fallback-elements.mjs';
import { assembleElementData } from '../src/lib/supabase.mjs';

test('원소를 원자번호 순으로 정렬하고 예시를 연결한다', () => {
  const elements = fallbackElements
    .map(({ examples, lanthanoidPosition, actinoidPosition, ...element }) => ({
      ...element,
      lanthanoid_position: lanthanoidPosition,
      actinoid_position: actinoidPosition,
    }))
    .reverse();
  const examples = fallbackElements.flatMap((element) =>
    element.examples.map((example, index) => ({
      id: index + 1,
      element_id: element.id,
      ...example,
    })),
  );
  const result = assembleElementData(elements, examples, []);
  assert.deepEqual(result.elements.slice(0, 2).map(({ symbol }) => symbol), ['H', 'He']);
  assert.equal(result.elements[0].examples[0].title, '연료전지');
  assert.equal(result.elements.find(({ symbol }) => symbol === 'Ce').lanthanoidPosition, 4);
});

test('원소 또는 예시가 불완전하면 거부한다', () => {
  assert.throws(() => assembleElementData([], [], []), /118개/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test`

Expected: `assembleElementData`가 export되지 않아 FAIL.

- [ ] **Step 3: 데이터 조립과 검증 구현**

`assembleElementData`는 원소가 정확히 118개인지, ID와 기호가 고유한지, 모든 원소에 예시가 있는지 확인한다. 통과한 경우 `atomic_number` 순서로 정렬하고 예시를 연결한다. 데이터베이스의 `lanthanoid_position`과 `actinoid_position`은 각각 화면 코드가 사용하는 `lanthanoidPosition`과 `actinoidPosition`으로 변환한다.

REST URL은 다음처럼 정렬 조건을 명시한다.

```js
const suffixByTable = {
  elements: '?select=*&order=atomic_number.asc',
  element_examples: '?select=*&order=element_id.asc,id.asc',
  element_comparison_notes: '?select=*&order=id.asc',
};
```

오류 시 화면에 전달하는 문구는 내부 오류 대신 다음 고정 문구로 바꾼다.

```js
error: '원소 데이터 서버에 연결하지 못해 예비 데이터를 표시합니다.'
```

- [ ] **Step 4: 전체 테스트와 fallback 빌드 확인**

Run: `pnpm test && pnpm build`

Expected: 테스트 PASS, Supabase 환경 변수 없이 정적 데이터로 빌드 PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/lib/supabase.mjs tests/supabase-data.test.mjs
git commit -m "feat: validate Supabase element data"
```

---

### Task 3: Vercel 배포 구조로 전환

**Files:**
- Modify: `next.config.mjs`
- Modify: `README.md`
- Create: `.env.example`
- Create: `tests/vercel-config.test.mjs`
- Delete: `.github/workflows/deploy-github-pages.yml`

**Interfaces:**
- Consumes: Vercel 환경 변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Produces: Vercel 기본 Next.js 빌드와 1시간 재검증 동작

- [ ] **Step 1: Vercel 설정 검증 테스트 추가**

`tests/vercel-config.test.mjs`를 생성한다.

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Next 설정에 GitHub Pages 경로가 없다', async () => {
  const source = await readFile(new URL('../next.config.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /basePath|assetPrefix|output:\s*['"]export/);
});

test('GitHub Pages 워크플로가 제거되었다', async () => {
  await assert.rejects(
    () => readFile(new URL('../.github/workflows/deploy-github-pages.yml', import.meta.url)),
    /ENOENT/,
  );
});
```

- [ ] **Step 2: 테스트가 기존 Pages 설정 때문에 실패하는지 확인**

Run: `pnpm test`

Expected: `basePath`, `assetPrefix`, `output: 'export'` 및 Pages 워크플로 때문에 FAIL.

- [ ] **Step 3: Next.js 설정 전환**

`next.config.mjs`를 다음으로 단순화한다.

```js
const nextConfig = {
  agentRules: false,
};

export default nextConfig;
```

`.github/workflows/deploy-github-pages.yml`을 삭제한다.

- [ ] **Step 4: 공개 환경 변수 예시 추가**

`.env.example`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

- [ ] **Step 5: README를 비개발자도 이해할 수 있게 갱신**

README에 GitHub, Vercel, Supabase의 역할과 다음 운영 흐름을 기록한다.

```text
코드 수정 → GitHub main에 저장 → Vercel 자동 배포
원소 데이터 수정 → Supabase 저장 → 최대 1시간 안에 앱 반영
```

GitHub Pages 설정 안내는 제거하고 Vercel Production URL과 Supabase 환경 변수 등록 위치를 설명한다.

- [ ] **Step 6: 테스트와 Production 빌드 확인**

Run: `pnpm test && pnpm build`

Expected: 모든 테스트 PASS, Next.js Production 빌드 PASS.

- [ ] **Step 7: 커밋**

```bash
git add next.config.mjs README.md .env.example tests/vercel-config.test.mjs .github/workflows/deploy-github-pages.yml
git commit -m "chore: switch deployment from GitHub Pages to Vercel"
```

---

### Task 4: GitHub에 구현 저장

**Files:**
- Verify only: entire repository

**Interfaces:**
- Consumes: Tasks 1-3의 검증된 커밋
- Produces: `origin/main`에 동일한 커밋 상태

- [ ] **Step 1: 공개 업로드 대상 확인**

Run: `git status --short && git diff origin/main...HEAD --stat && git ls-files | rg "(^|/)\.env($|\.)"`

Expected: 의도한 파일만 변경되고 `.env.local`이나 비밀 키 파일은 추적되지 않음.

- [ ] **Step 2: 전체 검증**

Run: `pnpm test && pnpm build`

Expected: 모든 테스트 PASS, 빌드 PASS.

- [ ] **Step 3: GitHub 업로드**

Run: `git push origin main`

Expected: 로컬 `main`과 `origin/main`이 같은 커밋을 가리킴.

---

### Task 5: Supabase 프로젝트 구축

**Files:**
- Apply: `supabase/migrations/202609150001_create_periodic_table.sql`
- Apply: `supabase/migrations/202609150002_seed_periodic_table.sql`
- Local only: `.env.local`

**Interfaces:**
- Consumes: GitHub에 저장된 스키마와 시드 SQL
- Produces: Supabase Project URL과 anon public key
- Produces: 읽기 전용 REST API의 118개 원소 데이터

- [ ] **Step 1: Supabase 프로젝트 생성**

Supabase Dashboard에서 로그인 후 새 프로젝트를 만든다.

- Project name: `periodic-table-learning-app`
- Region: `Northeast Asia (Seoul)` 또는 화면에 표시되는 가장 가까운 Seoul 리전
- Database password: Supabase가 생성한 강력한 비밀번호를 사용하고 GitHub나 대화에 출력하지 않음

Expected: 프로젝트 상태가 `Healthy`가 됨.

- [ ] **Step 2: 스키마 적용**

SQL Editor에서 `202609150001_create_periodic_table.sql` 전체를 실행한다.

Expected: 세 테이블이 생성되고 오류가 없음.

- [ ] **Step 3: 초기 데이터 적용**

SQL Editor에서 `202609150002_seed_periodic_table.sql` 전체를 실행한다.

Expected: 트랜잭션이 완료되고 오류가 없음.

- [ ] **Step 4: 데이터 개수 검증**

SQL Editor에서 실행한다.

```sql
select
  (select count(*) from public.elements) as elements,
  (select count(*) from public.element_examples) as examples,
  (select count(*) from public.element_comparison_notes) as notes,
  (select count(*) from public.elements e where not exists (
    select 1 from public.element_examples x where x.element_id = e.id
  )) as elements_without_examples;
```

Expected: `elements = 118`, `examples >= 118`, `notes = 2`, `elements_without_examples = 0`.

- [ ] **Step 5: 공개 읽기와 쓰기 차단 검증**

Project URL과 anon key로 `GET /rest/v1/elements?select=id&limit=1` 요청이 `200`인지 확인한다. 같은 anon key로 `POST /rest/v1/elements` 요청은 `401` 또는 `403`이어야 한다.

- [ ] **Step 6: 로컬 연결 정보 저장**

`.env.local`에는 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 두 줄만 만든다. 각 등호 오른쪽에는 Supabase Dashboard의 `Project Settings > API`에서 복사한 실제 Project URL과 anon public key를 입력한다.

`git status --short`에서 `.env.local`이 보이지 않는지 확인한다.

---

### Task 6: Vercel 연결과 Production 배포

**Files:**
- External configuration: Vercel project settings

**Interfaces:**
- Consumes: GitHub 저장소 `s100white/periodic-table-learning-app`
- Consumes: Supabase Project URL과 anon public key
- Produces: Vercel Production URL

- [ ] **Step 1: Vercel에서 GitHub 저장소 가져오기**

Vercel Dashboard에서 GitHub 계정으로 로그인하고 `Add New Project`를 선택한다. `s100white/periodic-table-learning-app`을 Import하고 Framework Preset이 `Next.js`인지 확인한다.

- [ ] **Step 2: Supabase 환경 변수 등록**

배포 전 Environment Variables에 아래 두 값을 추가하고 Production, Preview, Development를 모두 선택한다.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

- [ ] **Step 3: 첫 Production 배포**

기본 Root Directory와 `pnpm build` 설정으로 Deploy를 실행한다.

Expected: 배포 상태 `Ready`, Production URL 생성.

- [ ] **Step 4: 앱 데이터 연결 확인**

Production URL에서 다음을 확인한다.

1. 상단 데이터 상태가 `Supabase 연결됨`으로 표시된다.
2. 수소, 철, 오가네손의 상세 정보와 예시가 표시된다.
3. 검색, 계열 필터, 상태 필터, 두 원소 비교, 초기화가 동작한다.
4. 브라우저 콘솔에 Supabase 요청 오류가 없다.

- [ ] **Step 5: 자동 배포 연결 확인**

Vercel Project Settings의 Git에서 Production Branch가 `main`인지 확인한다.

Expected: 이후 GitHub `main` push가 자동 Production 배포를 생성함.

---

### Task 7: GitHub Pages 종료 및 최종 검증

**Files:**
- Verify only: GitHub repository settings and deployed URLs

**Interfaces:**
- Consumes: 성공한 Vercel Production 배포
- Produces: Vercel만 남은 단일 공식 배포 상태

- [ ] **Step 1: GitHub Pages 비활성화**

GitHub 저장소 `Settings > Pages > Build and deployment > Source`에서 Pages를 비활성화한다. Vercel Production이 정상임을 확인한 뒤 수행한다.

- [ ] **Step 2: GitHub Actions 상태 확인**

`.github/workflows/deploy-github-pages.yml`이 저장소에서 제거되었고 새 Pages 배포가 실행되지 않는지 확인한다.

- [ ] **Step 3: 최종 원격 상태 확인**

Run: `git fetch origin && git status --branch --short`

Expected: `main...origin/main`이며 앞섬 또는 뒤처짐 표시가 없음.

- [ ] **Step 4: 최종 서비스 검증**

Vercel Production URL에 HTTP 요청을 보내 `200` 응답, 페이지 제목 `원소 비교 주기율표`, 본문 `Supabase 연결됨`을 확인한다. Supabase REST에서 원소 118개와 예시 118개 이상을 다시 확인한다.

- [ ] **Step 5: 결과 기록**

최종 보고에 GitHub 저장소 URL, Vercel Production URL, Supabase 프로젝트명, 테스트 수, 데이터 개수, fallback 검증 결과를 포함한다. 비밀번호와 API 키 값은 포함하지 않는다.
