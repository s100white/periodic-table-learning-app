# 원소 비교 주기율표

대학생 입문자를 위한 한국어 원소 주기율표 학습앱입니다.

## 주요 기능

- 표준 주기율표 레이아웃
- 원소명, 영문명, 기호, 원자번호 검색
- 계열, 상온 상태, 주기, 족 필터
- 원소 상세 패널
- 두 원소 비교 모드
- Supabase 환경 변수가 없을 때 fallback 데이터 사용

## 로컬 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 테스트와 빌드

```bash
pnpm test
pnpm build
```

## 서비스 구성

- GitHub: 앱 코드와 변경 이력을 보관합니다.
- Vercel: GitHub `main` 브랜치를 자동으로 배포합니다.
- Supabase: 118개 원소와 학습 예시를 저장합니다.

운영 흐름은 다음과 같습니다.

```text
코드 수정 → GitHub main에 저장 → Vercel 자동 배포
원소 데이터 수정 → Supabase 저장 → 최대 1시간 안에 앱 반영
```

## Supabase 연결

`.env.example`을 참고해 로컬 `.env.local`과 Vercel 프로젝트에 다음 환경 변수를 등록합니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=Supabase anon public key
```

스키마와 118개 원소 초기 데이터는 `supabase/migrations`에 있습니다. 앱은 Supabase 연결에 실패하면 저장소에 포함된 fallback 데이터로 계속 동작합니다.

## Vercel 배포

Vercel에서 GitHub 저장소 `s100white/periodic-table-learning-app`을 가져오고 Framework Preset을 Next.js로 사용합니다. 위 두 Supabase 환경 변수를 Production, Preview, Development에 등록하면 `main` 브랜치 변경이 자동으로 Production에 배포됩니다.

