# MyHR pitch HTML — 폰트·리소스

기준 파일: [`public/pitch.html`](../public/pitch.html)  
Google 슬라이드에 옮길 때 이 문서의 이름·URL을 그대로 쓰면 됨.

---

## 폰트 (2종 + 폴백)

### 1. Pretendard Variable — 본문·UI

| | |
| --- | --- |
| **역할** | 기본 본문, 키커(eyebrow), 칩, 표 헤더, HUD, 대사 |
| **CSS** | `"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", sans-serif` |
| **CDN** | jsDelivr · orioncactus/pretendard **v1.3.9** (variable dynamic subset) |
| **URL** | https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css |
| **출처** | [orioncactus/pretendard](https://github.com/orioncactus/pretendard) (SIL OFL) |
| **Google 슬라이드** | 「Pretendard」가 없으면 **Noto Sans KR** 또는 **Apple SD Gothic Neo**로 대체. 한글 본문용. |

### 2. Instrument Serif — 디스플레이(헤드라인·브랜드)

| | |
| --- | --- |
| **역할** | `h1` / `h2` 헤드라인, `.brand`(제목 MyHR), 물음표(?) 장식 |
| **CSS** | `"Instrument Serif", "Pretendard Variable", serif` (브랜드는 Instrument만) |
| **로드** | Google Fonts · regular + italic |
| **URL** | https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap |
| **미리보기** | https://fonts.google.com/specimen/Instrument+Serif |
| **라이선스** | SIL OFL (Google Fonts) |
| **Google 슬라이드** | **Instrument Serif** 검색해 추가. 없으면 **Georgia** / **Noto Serif KR**보다 Instrument에 가까운 라틴 세리프를 헤드라인에만. |

### 3. 모노스페이스 — 코드·키·SQL

| | |
| --- | --- |
| **역할** | `keycap`, attributes 표 셀, 추출 카드 `code`, SQL 한 줄, 키 칩 |
| **CSS** | `ui-monospace, SFMono-Regular, Menlo, monospace` |
| **로드** | 시스템 폰트 (별도 CDN 없음) |
| **Google 슬라이드** | **Consolas** / **Courier New** / **Roboto Mono** |

---

## 슬라이드별 폰트 매핑

| 슬라이드 | 헤드라인 | 본문·칩·라벨 | 코드/표 |
| --- | --- | --- | --- |
| 0 제목 | Instrument Serif (`.brand`) | Pretendard | — |
| 1 문제 | Instrument Serif | Pretendard | — |
| 2 타겟 | Instrument Serif | Pretendard | — |
| 3 솔루션 | Instrument Serif | Pretendard (폰 목업 포함) | — |
| 4 입력 | Instrument Serif | Pretendard | 모노 (`붙여넣기 / 공유`) |
| 5 저장·스키마 | Instrument Serif | Pretendard | 모노 (표·키 칩) |
| 6 스키마 성장 | Instrument Serif | Pretendard | 모노 (타임라인 INSERT) |
| 7 질의 | Instrument Serif | Pretendard | 모노 (SQL) |
| 8 일상 | Instrument Serif | Pretendard | — |
| 9 사업화 | Instrument Serif | Pretendard | — |

키커(`.kicker`, 예: `핵심 · 저장`)는 전부 **Pretendard**, letter-spacing 넓게, accent 색.

---

## 외부 리소스 (로드 목록)

```
https://cdn.jsdelivr.net
https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css

https://fonts.googleapis.com
https://fonts.gstatic.com
https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap
```

이미지·아이콘 CDN은 **없음**. 폰 목업·카톡·카드·표는 전부 HTML/CSS.

---

## 컬러 (구글 슬라이드 테마용)

| 토큰 | Hex | 용도 |
| --- | --- | --- |
| `--ink` | `#12151a` | 본문 글자 |
| `--ink-soft` | `#3a4250` | 보조 문장 |
| `--mute` | `#6b7380` | 메타·힌트 |
| `--paper` | `#f3f1ec` | 슬라이드 패널 바탕 |
| `--paper-2` | `#e7e4dc` | 패널 보조 |
| `--line` | `#d4d0c6` | 보더 |
| `--accent` | `#0d6e6e` | 키커·강조·검색 근거 |
| `--accent-soft` | `#d7efef` | 칩·하이라이트 배경 |
| `--warn` | `#c45c26` | 「?」·첫 등장 태그 |
| `--ok` | `#1a7a4c` | 비교표 긍정 |
| `--phone` | `#1c1f26` | 폰 프레임 |
| 덱 배경 | `#0f1217` → `#1a1e26` | 바깥 어두운 그라데이션 |

진행 바 그라데이션: `#5fd0c8` → `#e8b86d`

---

## Google 슬라이드에 옮길 때 최소 세팅

1. **테마 글꼴:** 제목 = Instrument Serif, 본문 = Pretendard(또는 Noto Sans KR)
2. **배경:** 슬라이드 안쪽 영역 ≈ `#f3f1ec`, 바깥은 어두워도 됨
3. **강조색:** `#0d6e6e`
4. 코드/키 문자열만 모노스페이스
