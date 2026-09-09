# Extraction fixtures

Dummy inputs for testing `POST /api/extract` (see `docs/PRODUCT.md` §4.1, §6). Every KakaoTalk fixture is a 4-person group room (3 others + 「나」) and must yield **exactly 3 new people**. 「나」 (right-side yellow bubbles) is never a person. Third-party mentions (민수) are not new people either — they only appear as edge endpoints.

Files:

- `kakao/0N-<slug>.html` — self-contained mockup of the KakaoTalk mobile UI (390×844).
- `kakao/0N-<slug>.png` — screenshot of the HTML at device scale 2 (780×1688).
- `text/*.txt` — paste samples (memo, 1:1 chat snippet, business-card OCR).
- `linkedin/0N-<slug>.html/.png` — Korean-UI LinkedIn mobile profile (390×844 → 780×1688). Single dense person per image.
- `namecard/0N-<slug>.html/.png` — business card photo mockups (900×540 @1x).

Regenerate PNGs (headless Chrome, nothing to install). Chrome must not be blocked from `file://`, so serve the folder:

```powershell
# in repo root, background: python -m http.server 8765 --bind 127.0.0.1 --directory fixtures
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
# phone-sized (kakao/, linkedin/): 390x844 @2x
& $chrome --headless=new --hide-scrollbars --window-size=390,844 --force-device-scale-factor=2 --screenshot="fixtures\kakao\01-trainthon.png"      http://127.0.0.1:8765/kakao/01-trainthon.html
& $chrome --headless=new --hide-scrollbars --window-size=390,844 --force-device-scale-factor=2 --screenshot="fixtures\linkedin\01-kim-jaehee.png"  http://127.0.0.1:8765/linkedin/01-kim-jaehee.html
# business cards (namecard/): 900x540 @1x
& $chrome --headless=new --hide-scrollbars --window-size=900,540 --force-device-scale-factor=1 --screenshot="fixtures\namecard\01-kwon-dohyun.png" http://127.0.0.1:8765/namecard/01-kwon-dohyun.html
```

Value conventions: booleans are the strings `'true'` / `'false'`; other values are free Korean text (assertions should do substring/contains matching, not equality). Keys are snake_case; synonyms (`futsal`, `축구`, `풋살`) must map to `plays_soccer`.

---

## kakao/01-trainthon — room title 「트레인톤 2조」 (4)

Date pill: 2026년 9월 9일 수요일. Third-party mention: 민수 (형).

| Person | Expected keys | Expected value (contains) |
| --- | --- | --- |
| 서지우 | `works_at` | 핀테크 스타트업 |
| 서지우 | `job_title` | 백엔드 개발 |
| 서지우 | `likes_spicy` | `true` (마라탕 3단계, 「지우 또 매운 거」) |
| 서지우 | `met_at` | 트레인톤 |
| 한도윤 | `plays_soccer` | `true` (주말마다 풋살) |
| 한도윤 | `lives_in` | 강릉 |
| 한도윤 | `met_at` | 트레인톤 |
| 임하늘 | `met_at` | 트레인톤 |
| 임하늘 | `likes_spicy` | optional; `false`-ish/mild (「난 1단계」) — do not assert |

Edges:

| From | To | Label |
| --- | --- | --- |
| 민수 | 서지우 | 소개 (「지우는 민수 형이 소개해줬어」) |
| 민수 | 한도윤 | 아는 사이 / 풋살 (optional — 「나도 민수 형 알아」) |

근황/약속: 내일(9/10) 오후 7시 신촌 마라탕 (서지우, 임하늘, 나).

---

## kakao/02-yeonkkeul — room title 「주식동아리 12기 스터디」 (4)

Date pill: 2026년 9월 7일 월요일.

| Person | Expected keys | Expected value (contains) |
| --- | --- | --- |
| 문채원 | `works_at` | 카카오 (다음 달 이직 — 근황) |
| 문채원 | `status` / `recent_news` | 이직 (10월, 카카오) |
| 배시온 | `likes_spicy` | `false` (「매운 거 진짜 못 먹음」) |
| 배시온 | `lives_in` | 판교 |
| 오유진 | `interested_in` | 클래식 (예술의전당, 조성진 리사이틀) |

Edges: none expected (no third-party introductions).

근황/약속: 이번 주 금요일 오후 7시 판교 이직 축하 회식; 다음 주 토요일 예술의전당 클래식 공연 (오유진 + 나).

---

## kakao/03-scheffler — room title 「셰플러 FC」 (4)

Date pill: 2026년 9월 3일 목요일.

| Person | Expected keys | Expected value (contains) |
| --- | --- | --- |
| 강태현 | `plays_soccer` | `true` (organizer, 「토요일 축구 뛸 사람?」) |
| 강태현 | `university` | 연세대 / 연대 |
| 강태현 | `major` | 체육교육 / 체교 |
| 신예린 | `plays_soccer` | `true` (「나 감!」) |
| 신예린 | `university` | 고려대 |
| 신예린 | `major` | 경영 |
| 조민재 | `plays_soccer` | `false` (「무릎 부상 … 못 뛸 듯」) |
| 조민재 | `injury` / `health` | 무릎 부상, 재활 중 (optional) |
| 조민재 | `university` | 연세대 / 연대 |
| 조민재 | `major` | 컴퓨터공학 / 컴공 |

Edges: none expected.

근황/약속: 토요일 오전 10시 신촌 운동장 축구 (강태현, 신예린, 나) → 끝나고 순두부.

---

## kakao/04-maeyeon — room title 「농구동아리 9월 네트워킹」 (4)

Date pill: 2026년 9월 8일 화요일. 명함 교환 context.

| Person | Expected keys | Expected value (contains) |
| --- | --- | --- |
| 윤서아 | `works_at` | 네이버 |
| 윤서아 | `job_title` | PM / 프로덕트 매니저 |
| 윤서아 | `interested_in` | 러닝 |
| 윤서아 | `met_at` | 농구동아리 (9월 네트워킹) |
| 장하람 | `works_at` | 스튜디오 하람 |
| 장하람 | `job_title` | 대표 |
| 장하람 | `interested_in` / `industry` | 브랜딩 |
| 장하람 | `office_in` / `works_in` | 성수동 (optional) |
| 장하람 | `met_at` | 농구동아리 |
| 권도현 | `works_at` | 노스스타벤처스 |
| 권도현 | `job_title` | 심사역 |
| 권도현 | `met_at` | 농구동아리 |

Edges: none expected.

근황/약속: 다음 주 화요일 오후 3시 강남 커피 (권도현 + 나).

---

## text/01-memo.txt — 15-second post-meeting memo

| Person | Expected keys | Expected value (contains) |
| --- | --- | --- |
| 서지우 | `works_at` | 핀테크 스타트업 |
| 서지우 | `job_title` | 백엔드 |
| 서지우 | `likes_spicy` | `true` |
| 서지우 | `met_at` | 트레인톤 |

Edges: 민수 → 서지우, 소개. Exactly 1 person (민수 is edge-only). 약속: 내일 7시 신촌 마라탕.

---

## text/02-memo.txt — pasted 1:1 KakaoTalk conversation (한도윤)

| Person | Expected keys | Expected value (contains) |
| --- | --- | --- |
| 한도윤 | `plays_soccer` | `true` (주말마다 풋살) |
| 한도윤 | `lives_in` | 강릉 |
| 한도윤 | `status` / `recent_news` | 다음 달 강릉 카페 오픈 |

Edges: 민수 → 한도윤, 소개 (「민수 형 나 풋살 데려온 사람」). Exactly 1 person.

---

## text/03-namecard.txt — business card OCR (권도현)

| Person | Expected keys | Expected value (contains) |
| --- | --- | --- |
| 권도현 | `works_at` | 노스스타벤처스 |
| 권도현 | `job_title` | 심사역 |
| 권도현 | `email` | dohyun.kwon@northstar.vc |
| 권도현 | `office_in` / `works_in` | 강남 / 테헤란로 (optional) |

Edges: none. Exactly 1 person. No phone number on the card (by design).

---

## linkedin/01-kim-jaehee — 김재희 (EXISTING seed person → update card, before→after)

Path exercised: **existing person**. 김재희 is already in the seed as 「핀테크 스타트업 백엔드 개발자, 연세대」. `/api/extract` must resolve the name to the seed `id` (not create a new row), and the swipe card should show before→after diffs for overlapping keys plus brand-new keys.

| Person | Expected keys | Expected value (contains) | vs. seed |
| --- | --- | --- | --- |
| 김재희 | `works_at` | 페이루프 / PayLoop (핀테크 스타트업) | refines 「핀테크 스타트업」 → named company |
| 김재희 | `job_title` | Backend Engineer / 백엔드 엔지니어 | same as seed |
| 김재희 | `university` | 연세대학교 | same as seed |
| 김재희 | `major` | 컴퓨터과학 | new |
| 김재희 | `lives_in` | 서울 마포구 | new |
| 김재희 | `previous_company` / `worked_at` | 토스 (Viva Republica), 인턴, 2024 | new |
| 김재희 | `skills` (or one row per skill) | Go, Kotlin, PostgreSQL | new |
| 김재희 | `likes_spicy` | `true` (소개: 「매운 음식 … 좋아합니다」) | matches seed wow-B key |
| 김재희 | `plays_soccer` | `true` (소개: 「주말 풋살」) | matches seed wow-C key |

Edges: none. Exactly 1 person; 「1촌 500+」 and 「1촌」 badge are not attributes.

---

## linkedin/02-ryu-haeun — 류하은 (NEW person from a dense single-person source)

Path exercised: **new person**. Name is not in the seed; expect one new `people` row with a `one_liner` like 「삼성전자 DS 반도체 식각 공정 엔지니어, KAIST 신소재」.

| Person | Expected keys | Expected value (contains) |
| --- | --- | --- |
| 류하은 | `works_at` | 삼성전자 (DS부문 / 반도체) |
| 류하은 | `job_title` | 공정 엔지니어 (Etch / 식각) |
| 류하은 | `university` | KAIST / 카이스트 |
| 류하은 | `major` | 신소재공학 (석사) |
| 류하은 | `lives_in` | 대전 (유성구) |
| 류하은 | `works_in` / `office_in` | 경기 화성 (optional) |
| 류하은 | `previous_company` / `worked_at` | LG디스플레이 인턴 2022 (optional) |
| 류하은 | `skills` (or one row per skill) | Plasma Etch, Python, SPC |
| 류하은 | `plays_soccer` | `true` (소개: 「주말엔 풋살을 뜁니다」) |
| 류하은 | `interested_in` | 데이터 분석 / 수율 개선 (optional) |

Edges: none (「함께 아는 1촌 3명」 is not an edge). Exactly 1 person.

---

## namecard/01-kwon-dohyun.png — 권도현 business card (EXISTING after kakao/04 or text/03 → upsert)

Path exercised: **existing person** if kakao/04 or text/03 was ingested first (same name + same company → resolve to that `id`); otherwise a new person. Use it right after kakao/04 to assert no duplicate 권도현 row is created and that `email` is added as a new key.

| Person | Expected keys | Expected value (contains) |
| --- | --- | --- |
| 권도현 | `works_at` | 노스스타벤처스 / NorthStar Ventures |
| 권도현 | `job_title` | 심사역 / Investment Associate |
| 권도현 | `email` | dohyun.kwon@northstar.vc |
| 권도현 | `office_in` / `works_in` | 서울 강남구 테헤란로 (optional) |
| 권도현 | `website` | northstar.vc (optional) |

Edges: none. Exactly 1 person. No phone number on the card (by design).

---

## namecard/02-new.png — 백승민 business card (NEW person)

Path exercised: **new person**. Not in the seed and not in any other fixture. Card has decorative shapes and a fake QR block that must not be read as text.

| Person | Expected keys | Expected value (contains) |
| --- | --- | --- |
| 백승민 | `works_at` | 스튜디오 카나 / Studio Kana |
| 백승민 | `job_title` | 브랜드 디렉터 / Brand Director |
| 백승민 | `industry` / `interested_in` | 브랜드 디자인 / 브랜딩 |
| 백승민 | `email` | seungmin@studiokana.kr |
| 백승민 | `office_in` / `works_in` | 성수동 / 서울 성동구 성수이로 |
| 백승민 | `instagram` / `sns` | @studio.kana (optional) |

Edges: none. Exactly 1 person. Note 장하람 (kakao/04) is also a 브랜딩 대표 in 성수동 — 백승민 must **not** be merged with 장하람 (different name, different company).

---

## Cross-fixture assertions

- Names are unique across rooms: 서지우 한도윤 임하늘 | 문채원 배시온 오유진 | 강태현 신예린 조민재 | 윤서아 장하람 권도현. Running all four should produce 12 distinct people.
- `likes_spicy`: 서지우 `true`, 배시온 `false`.
- `plays_soccer`: 한도윤 `true`, 강태현 `true`, 신예린 `true`, 조민재 `false`.
- 민수 appears only as an edge source (fixtures 01, text/01, text/02); never as a `people` row.
- text/01 + text/03 overlap with kakao/01 + kakao/04 on purpose — use them to test entity resolution (existing-person upsert instead of a new row).
- Existing-person path: linkedin/01 (김재희, seed) and namecard/01 (권도현, after kakao/04 or text/03). New-person path: linkedin/02 (류하은), namecard/02 (백승민).
- After all fixtures, `plays_soccer = 'true'` also includes 김재희 and 류하은; `likes_spicy = 'true'` includes 김재희.
