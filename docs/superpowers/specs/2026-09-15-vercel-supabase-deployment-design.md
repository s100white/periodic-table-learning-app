# Vercel 및 Supabase 전환 설계

## 1. 목적

원소 주기율표 학습앱의 코드는 GitHub에 보관하고, 실제 서비스는 Vercel에서 배포한다. 원소와 학습 콘텐츠는 Supabase에 저장하며, 데이터베이스 장애 시에도 앱에 포함된 fallback 데이터로 핵심 기능을 계속 제공한다.

## 2. 서비스 역할

- GitHub: 앱 코드와 변경 이력을 보관하는 단일 원본 저장소
- Vercel: GitHub `main` 브랜치를 자동으로 빌드하고 공개 주소로 제공하는 배포 환경
- Supabase: 118개 원소, 원소별 활용 예시, 원소 비교 설명을 저장하는 데이터베이스

GitHub Pages는 중복 배포를 피하기 위해 사용을 중단한다. 공식 앱 주소는 Vercel의 Production URL 하나로 정한다.

## 3. 전체 흐름

1. 개발한 코드를 GitHub `main` 브랜치에 올린다.
2. Vercel이 GitHub 변경을 감지해 Next.js 앱을 자동으로 다시 배포한다.
3. 사용자가 Vercel 주소를 열면 앱이 Supabase에서 원소 데이터를 읽는다.
4. Supabase 조회에 실패하거나 환경 변수가 없으면 앱은 저장소에 포함된 fallback 데이터를 사용한다.
5. Supabase 응답은 최대 1시간 동안 재사용해 불필요한 데이터베이스 요청을 줄인다.

## 4. 애플리케이션 변경

`next.config.mjs`에서 GitHub Pages 전용 정적 내보내기, `basePath`, `assetPrefix` 설정을 제거한다. Vercel의 기본 Next.js 실행 방식을 사용해 Supabase 데이터를 서버에서 읽고 1시간 단위로 갱신한다.

`src/lib/supabase.mjs`의 기존 REST 조회 구조와 fallback 처리는 유지하되 다음을 보장한다.

- `elements`는 `atomic_number` 순서로 조회한다.
- `element_examples`는 원소별로 묶어 상세 패널에 연결한다.
- `element_comparison_notes`는 기존 비교 로직이 사용하는 필드 형태로 전달한다.
- Supabase 오류의 내부 정보나 키는 사용자 화면에 노출하지 않는다.
- 데이터가 비어 있거나 형식이 잘못된 경우 전체 fallback 데이터로 전환한다.

GitHub Pages 전용 워크플로 `.github/workflows/deploy-github-pages.yml`은 제거하고, README의 배포 설명을 Vercel과 Supabase 기준으로 바꾼다.

## 5. Supabase 데이터 구조

### `elements`

118개 원소의 기본 정보와 물성을 저장한다. `id`는 원자번호와 같은 정수로 사용하며 `atomic_number`와 `symbol`은 각각 고유해야 한다. 주요 필드는 원자번호, 기호, 한국어명, 영문명, 원자량, 계열, 주기, 족, 블록, 상온 상태, 전자배치, 전기음성도, 산화수, 원자 반지름, 1차 이온화 에너지, 녹는점, 끓는점, 밀도, 요약, 화학적 특징, 주기율표 표시 위치다.

배열 형태인 산화수는 PostgreSQL `text[]`로 저장한다. 숫자 자료가 알려지지 않은 경우에는 임의 값을 넣지 않고 `null`을 사용한다.

### `element_examples`

각 원소에 최소 한 개의 학습 예시를 저장한다. `element_id`는 `elements.id`를 참조하며, 제목, 설명, 활용 분야를 포함한다. 원소가 삭제되면 연결된 예시도 함께 삭제한다.

### `element_comparison_notes`

특정 원소 쌍의 비교 설명을 저장한다. 두 원소의 기호, 주제, 설명을 포함한다. 두 기호의 조합은 중복되지 않도록 제한한다. 저장된 설명이 없는 조합은 현재 앱의 자동 비교 설명을 사용한다.

## 6. 초기 데이터

현재 앱의 fallback 데이터를 기준으로 118개 원소를 Supabase에 입력한다. fallback에 포함된 원소별 학습 예시도 모두 입력하고, 현재 작성된 나트륨-염소 및 탄소-산소 비교 설명을 함께 저장한다.

초기 데이터 입력은 다시 실행해도 중복이 생기지 않는 SQL로 작성한다. 스키마와 시드 SQL은 저장소의 `supabase/migrations`에 보관해 데이터베이스 구조를 코드와 함께 추적한다.

## 7. 접근 권한과 보안

세 테이블 모두 Row Level Security를 활성화한다. 로그인하지 않은 방문자와 로그인 사용자는 `select`만 허용하며, 브라우저를 통한 추가, 수정, 삭제는 허용하지 않는다.

Vercel과 로컬 앱에는 다음 공개 연결 정보만 사용한다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

데이터베이스 비밀번호, service role key, 개인 토큰은 GitHub에 저장하지 않는다. `.env.local`은 계속 Git에서 제외한다.

## 8. Vercel 배포

Vercel에서 GitHub 저장소 `s100white/periodic-table-learning-app`을 가져와 같은 이름의 프로젝트를 생성한다. 프레임워크는 Next.js로 자동 감지하고 기본 빌드 명령을 사용한다.

Supabase URL과 anon key는 Vercel의 Production, Preview, Development 환경에 등록한다. 첫 배포 후 앱 화면에 `Supabase 연결됨`이 표시되는지 확인한다. 이후 `main` 브랜치 변경은 Production에 자동 배포된다.

## 9. 오류 처리

- Supabase 연결 실패: fallback 데이터로 화면을 유지하고 데이터 상태를 안내한다.
- 일부 테이블이 비어 있음: 불완전한 화면 대신 전체 fallback 데이터로 전환한다.
- Vercel 빌드 실패: 배포 로그에서 테스트, 환경 변수, Next.js 빌드 단계를 구분해 확인한다.
- 초기 데이터 입력 실패: 트랜잭션을 사용해 일부 데이터만 저장되는 상태를 방지한다.

## 10. 검증 기준

- 로컬 테스트 전체가 통과한다.
- Supabase에 `elements` 118개가 저장된다.
- 모든 원소에 한 개 이상의 `element_examples`가 존재한다.
- 익명 REST 요청은 세 테이블을 읽을 수 있지만 추가, 수정, 삭제할 수 없다.
- Vercel Production 배포가 성공한다.
- 배포된 앱에 `Supabase 연결됨`이 표시된다.
- 수소, 철, 오가네손을 선택했을 때 Supabase 데이터가 상세 패널에 표시된다.
- 검색, 필터, 두 원소 비교, 초기화 기능이 배포 환경에서 동작한다.
- Supabase 환경 변수를 제거한 로컬 빌드에서도 fallback 데이터로 앱이 동작한다.
- GitHub Pages 워크플로가 제거되고 GitHub Pages 배포는 비활성화된다.

## 11. 작업 순서

1. Supabase 스키마와 재실행 가능한 초기 데이터 SQL을 저장소에 추가한다.
2. 앱을 Vercel 방식으로 조정하고 로컬 테스트 및 빌드를 검증한다.
3. 변경사항을 GitHub `main`에 저장한다.
4. Supabase 프로젝트를 만들고 스키마와 초기 데이터를 적용한다.
5. Vercel 프로젝트를 GitHub와 연결하고 Supabase 환경 변수를 등록한다.
6. Production 배포와 실제 데이터 연결을 확인한다.
7. GitHub Pages를 비활성화한다.

