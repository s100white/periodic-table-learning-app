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

## GitHub Pages 배포

이 저장소는 `.github/workflows/deploy-github-pages.yml` 워크플로를 통해 GitHub Pages에 정적 배포할 수 있습니다.

GitHub 저장소에서 `Settings > Pages`로 이동한 뒤 `Build and deployment`의 Source를 `GitHub Actions`로 설정합니다.

