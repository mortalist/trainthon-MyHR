# MyHR

**당신은 당신 네트워크의 CEO다. MyHR은 그 회사의 인사팀이다.**

전화번호부는 이름과 번호만 남긴다. 개인 CRM은 직접 적어야 해서 죽는다. MyHR은 카톡 캡처·짧은 메모를 던지면 AI가 **사실 한 줄**로 잘라 저장하고, 나중에 「매운거 잘 먹음」이나 「주말 축구 11명」을 검색·질문으로 꺼내는 **개인용 인맥 기억 레이어**다.

앱을 열면 평범한 연락처 목록이다. 차이는 검색이 된다는 것 하나다.

상세 스펙(문제, 데이터, 화면, 데모, 스택, 빌드 순서): **[docs/PRODUCT.md](docs/PRODUCT.md)**

## Status

Trainthon 해커톤 MVP. 앱 코드는 아직 없다. 제품 정의는 [docs/PRODUCT.md](docs/PRODUCT.md).

의도한 GitHub: [github.com/mortalist/trainthon-MyHR](https://github.com/mortalist/trainthon-MyHR)

## v1 in one page

| | |
| --- | --- |
| Who | 네트워킹이 빠른 대학생·창업가 (첫 사용자는 본인 데모 그래프) |
| Shell | 390px 폰 프레임 웹. 로그인·온보딩·설정 없음 |
| Input | 텍스트 + 카톡/명함 이미지 붙여넣기. 음성은 UI만, API는 시간 남으면 |
| Save | `/extract` → 사람 단위 스와이프 승인 후에만 DB에 씀 |
| Facts | `attributes(person_id, key, value, source)` — 컬럼을 늘리지 않고 **행을 늘림** |
| Wow | 「매운거 잘 먹음」검색 또는 「축구 11명」질문 |
| Not in v1 | 폰/구글 주소록 동기화, RAG, 멀티유저, 그래프 필수 화면 |

## Run

앱이 생기면 여기에 `npm install` / `npm run dev`를 적는다. 지금은 문서만 있다.
