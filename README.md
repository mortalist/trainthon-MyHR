# MyHR

**당신은 당신 네트워크의 CEO다. MyHR은 그 회사의 인사팀이다.**

전화번호부는 이름과 번호만 남긴다. 수첩·메모는 직접 적어야 해서 죽는다. MyHR은 카톡 캡처·짧은 메모를 던지면 AI가 **사실 한 줄**로 잘라 저장하고, 나중에 「매운거 잘 먹음」이나 「주말 축구 11명」을 검색·질문으로 꺼내는 **개인용 인맥 기억 레이어**다.

앱을 열면 평범한 연락처 목록이다. 차이는 검색이 된다는 것 하나다.

## Docs

| 파일 | 역할 |
| --- | --- |
| [docs/PRODUCT.md](docs/PRODUCT.md) | **정본 스펙.** 문제, 데이터 모델, 파이프라인, 화면, 데모, 스택, 빌드 순서. 구현은 이걸 따른다 |
| [docs/DECISIONS.md](docs/DECISIONS.md) | 결정 로그. 버린 대안과 이유 |
| [docs/PITCH.md](docs/PITCH.md) | 마감, 준비 체크리스트, 심사 Q&A, 사업 모델 |
| [docs/AGENT.md](docs/AGENT.md) | 코딩 에이전트 규칙 설치 |

새 결정이 나면 PRODUCT.md를 고치고 DECISIONS.md에 한 줄 남긴다. 다른 곳에 기획을 두지 않는다.

## Status

Trainthon 해커톤 MVP (2026-09-09~10, 최종 피칭 9/10 10:00). 앱 코드는 아직 없다.

의도한 GitHub: [github.com/mortalist/trainthon-MyHR](https://github.com/mortalist/trainthon-MyHR)

## v1 in one page

| | |
| --- | --- |
| Who | 누구나 (예시: 대학생·창업가·심사역). 첫 사용자는 본인 데모 그래프 |
| Shell | 390px 폰 프레임 웹. 로그인·온보딩·설정 없음 |
| Input | 텍스트 + 카톡/명함 이미지 붙여넣기. 음성은 UI만, API는 시간 남으면 |
| Save | `/extract` → 사람 단위 스와이프 승인 후에만 DB에 씀 |
| Facts | `attributes(person_id, key, value, source)` — 컬럼을 늘리지 않고 **행을 늘림** |
| Wow | 「매운거 잘 먹음」검색 또는 「축구 11명」질문 |
| Not in v1 | 폰/구글 주소록 동기화, RAG, 멀티유저, 그래프 필수 화면 |

## Run

**Production:** https://trainthon-myhr.vercel.app — 재배포: `npx vercel --prod`

```
cp .env.local.example .env.local   # GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL 채우기
npm install
npm run seed                       # schema.sql 재실행 + 시드 31명 + 더미 800 (= 리셋)
npm run dev
```
