// 무대용 시드. scripts/seed.ts가 이 파일을 DB에 넣는다 (npm run seed = 리셋).
// 노트 하나 = [메모 원문, 그 메모에서 뽑은 속성]. 속성 source는 그 노트 id를 가리킨다.
// 현재값 규칙(current_attributes 뷰)의 살아있는 검증: p06 강민준은 plays_soccer가
// 2번째 노트에서 'true', 3번째 노트에서 'false' → 뷰는 'false'를 보여야 한다.
// 시드 후 `select value from current_attributes where person_id='p06' and key='plays_soccer'` = false.

type Note = [text: string, attrs?: Record<string, string>];
export type SeedPerson = {
  id: string;
  name: string;
  tags: string[];
  one_liner: string;
  notes: Note[];
};
export type SeedEdge = [from: string, to: string, label: string];

export const me = { id: "me", name: "나" };

export const people: SeedPerson[] = [
  {
    id: "p01", name: "김재희", tags: ["연끌", "트레인톤"],
    one_liner: "핀테크 스타트업 다니는 연끌 후배, 풋살 잘함",
    notes: [
      ["민수 소개로 연끌 모임에서 처음 봄. 초기 핀테크 스타트업 다닌다고.", { works_at: "핀테크 스타트업", met_at: "연끌 모임" }],
      ["재희 매운거 엄청 좋아함. 불닭 소스 따로 들고 다님", { likes_spicy: "true" }],
      ["재희랑 풋살 뛰었는데 잘하더라. 주말마다 뛴다고", { plays_soccer: "true" }],
      ["다음 트레인톤 나온대. 결제 인프라 쪽 아이템", { interested_in: "결제 인프라" }],
    ],
  },
  {
    id: "p02", name: "박민수", tags: ["연끌"],
    one_liner: "연끌 동기, 재희 소개해준 사람. 풋살 팀 주장",
    notes: [
      ["연끌 1기 동기. 경영학과.", { university: "연세대", major: "경영학" }],
      ["민수도 축구 함. 동아리 풋살 팀 주장", { plays_soccer: "true" }],
      ["요즘 B2B SaaS 스타트업에서 세일즈 인턴 중", { works_at: "B2B SaaS 스타트업" }],
    ],
  },
  {
    id: "p03", name: "이서준", tags: ["매연"],
    one_liner: "매연 운영진. 신촌 살아서 모임 장소 담당",
    notes: [
      ["매연 운영진. 신촌 살아서 모임 장소 잡아줌", { lives_in: "신촌" }],
      ["축구 매주 일요일 뛴다", { plays_soccer: "true" }],
      ["매운 거 못 먹음. 신라면도 힘들어함", { likes_spicy: "false" }],
    ],
  },
  {
    id: "p04", name: "정하윤", tags: ["셰플러"],
    one_liner: "셰플러 인턴 동기, 독일 본사 파견 준비",
    notes: [
      ["셰플러 인턴 같은 팀. 기계공학", { works_at: "셰플러", major: "기계공학" }],
      ["내년 독일 본사 파견 지원했다고", { interested_in: "해외 파견" }],
      ["취미가 클라이밍", { hobby: "클라이밍" }],
    ],
  },
  {
    id: "p05", name: "최우진", tags: ["트레인톤", "연끌"],
    one_liner: "연끌 해커톤 같은 팀. 백엔드(Go)",
    notes: [
      ["연끌 해커톤에서 같은 팀. 백엔드(Go) 담당", { skill: "백엔드 개발", met_at: "연끌 해커톤" }],
      ["축구 안 함, 대신 러닝 함", { plays_soccer: "false", hobby: "러닝" }],
    ],
  },
  {
    id: "p06", name: "강민준", tags: ["매연", "트레인톤"],
    one_liner: "매연 후배. 무릎 부상으로 축구 쉬는 중",
    notes: [
      ["매연 신입. 컴공", { university: "연세대", major: "컴퓨터공학" }],
      ["축구 동아리에서 봄. 미드필더", { plays_soccer: "true" }],
      ["무릎 십자인대 다쳐서 올해 축구 못 뛴다고", { plays_soccer: "false" }],
    ],
  },
  {
    id: "p07", name: "윤지호", tags: ["연끌"],
    one_liner: "연끌 3기 선배. 초기 VC 심사역",
    notes: [
      ["연끌 3기 선배. 지금 초기 단계 VC 심사역", { works_at: "초기 단계 VC" }],
      ["커피챗 하자고 함. 컨슈머 앱 관심", { interested_in: "컨슈머 앱" }],
    ],
  },
  {
    id: "p08", name: "장예은", tags: ["셰플러"],
    one_liner: "셰플러 HR. 인턴 프로그램 총괄",
    notes: [
      ["셰플러 HR. 인턴 프로그램 총괄", { works_at: "셰플러", team: "HR" }],
      ["매운 거 좋아해서 점심마다 마라탕", { likes_spicy: "true" }],
    ],
  },
  {
    id: "p09", name: "한지민", tags: ["트레인톤"],
    one_liner: "트레인톤 운영진. 연세대 창업지원단",
    notes: [
      ["트레인톤 운영진. 창업지원단 소속", { works_at: "연세대 창업지원단" }],
      ["디자인 전공, 피그마 잘 다룸", { major: "디자인", skill: "피그마" }],
    ],
  },
  {
    id: "p10", name: "송현우", tags: ["매연"],
    one_liner: "매연 회장. 풋살 골키퍼",
    notes: [
      ["매연 회장. 성격 좋음", { role: "매연 회장" }],
      ["풋살 팀 골키퍼", { plays_soccer: "true" }],
      ["마포 살아서 상암 풋살장 자주 감", { lives_in: "마포" }],
    ],
  },
  {
    id: "p11", name: "오세훈", tags: ["연끌", "매연"],
    one_liner: "연끌+매연. 마케팅 프리랜서",
    notes: [
      ["마케팅 프리랜서. 인스타 광고 잘 돌림", { works_at: "프리랜서 마케터" }],
      ["축구 함. 주로 수비", { plays_soccer: "true" }],
      ["매운 거 좋아함. 엽떡 매운맛 기본", { likes_spicy: "true" }],
    ],
  },
  {
    id: "p12", name: "김도현", tags: ["트레인톤"],
    one_liner: "트레인톤 참가자. AI 대학원 준비",
    notes: [
      ["AI 대학원 준비 중. NLP", { interested_in: "NLP 연구" }],
      ["고려대 산업공학", { university: "고려대", major: "산업공학" }],
    ],
  },
  {
    id: "p13", name: "이수빈", tags: ["셰플러", "트레인톤"],
    one_liner: "셰플러 인턴 출신, 제조업 SaaS 창업 준비",
    notes: [
      ["셰플러 인턴 끝나고 창업 준비 중. 제조업 SaaS", { interested_in: "제조업 SaaS", met_at: "셰플러 인턴" }],
      ["재희랑 같은 고등학교 나왔다고"],
      ["축구 함. 대학 축구부 출신", { plays_soccer: "true" }],
    ],
  },
  {
    id: "p14", name: "박서연", tags: ["연끌"],
    one_liner: "연끌 동기, 브랜딩 디자이너",
    notes: [
      ["연끌 1기. 브랜딩 디자이너", { skill: "브랜딩 디자인" }],
      ["강남에서 자취", { lives_in: "강남" }],
    ],
  },
  {
    id: "p15", name: "조현준", tags: ["매연"],
    one_liner: "매연 총무. CPA 준비",
    notes: [
      ["매연 총무. CPA 준비 중", { interested_in: "CPA" }],
      ["축구 함", { plays_soccer: "true" }],
    ],
  },
  {
    id: "p16", name: "임지원", tags: ["트레인톤"],
    one_liner: "트레인톤 멘토. 시리즈A 커머스 CTO",
    notes: [
      ["트레인톤 멘토. 시리즈A 커머스 스타트업 CTO", { works_at: "커머스 스타트업" }],
      ["매운 거 잘 먹음. 청양고추 생으로", { likes_spicy: "true" }],
    ],
  },
  {
    id: "p17", name: "신동욱", tags: ["연끌", "트레인톤"],
    one_liner: "연끌 2기 후배. 프론트엔드",
    notes: [
      ["연끌 2기. 프론트엔드(React)", { skill: "프론트엔드 개발" }],
      ["축구 함. 재희랑 같은 풋살 모임", { plays_soccer: "true" }],
    ],
  },
  {
    id: "p18", name: "홍수아", tags: ["셰플러"],
    one_liner: "셰플러 구매팀 대리. 인턴 때 멘토",
    notes: [
      ["셰플러 구매팀 대리. 인턴 때 멘토", { works_at: "셰플러", team: "구매" }],
      ["골프 시작했다고", { hobby: "골프" }],
    ],
  },
  {
    id: "p19", name: "류태양", tags: ["매연"],
    one_liner: "매연 OB. 광고대행사 AE",
    notes: [
      ["매연 OB. 광고대행사 AE", { works_at: "광고대행사" }],
      ["축구 함. 매연 OB 팀", { plays_soccer: "true" }],
      ["매운 거 잘 먹음", { likes_spicy: "true" }],
    ],
  },
  {
    id: "p20", name: "문지훈", tags: ["트레인톤"],
    one_liner: "트레인톤 참가자. 임베디드·로봇",
    notes: [
      ["임베디드 개발. 로봇 관심", { interested_in: "로보틱스" }],
      ["카이스트 전기전자", { university: "카이스트", major: "전기전자공학" }],
    ],
  },
  {
    id: "p21", name: "배준서", tags: ["연끌"],
    one_liner: "연끌 동기. 로스쿨 준비, 공격수",
    notes: [
      ["연끌 1기. 로스쿨 준비 중", { interested_in: "로스쿨" }],
      ["축구 함. 공격수", { plays_soccer: "true" }],
    ],
  },
  {
    id: "p22", name: "안유나", tags: ["매연", "셰플러"],
    one_liner: "매연 OB, 셰플러 재무팀 현직",
    notes: [
      ["매연 OB인데 셰플러 재무팀 다님", { works_at: "셰플러", team: "재무" }],
      ["매운 거 못 먹음", { likes_spicy: "false" }],
    ],
  },
  {
    id: "p23", name: "전승민", tags: ["트레인톤"],
    one_liner: "트레인톤 심사위원. 엔젤투자자",
    notes: [
      ["엔젤 투자자. 트레인톤 심사위원", { works_at: "엔젤투자자" }],
      ["B2B 핀테크 관심", { interested_in: "B2B 핀테크" }],
    ],
  },
  {
    id: "p24", name: "노하은", tags: ["연끌"],
    one_liner: "연끌 2기 후배. PM 지망",
    notes: [
      ["연끌 2기. PM 인턴 경험", { interested_in: "PM" }],
      ["재희 소개로 알게 됨", { met_at: "재희 소개" }],
    ],
  },
  {
    id: "p25", name: "황민재", tags: ["매연"],
    one_liner: "매연 후배. 체육교육과, 축구 잘함",
    notes: [
      ["체육교육과. 축구 잘함", { major: "체육교육", plays_soccer: "true" }],
      ["판교 살음", { lives_in: "판교" }],
    ],
  },
  {
    id: "p26", name: "서동현", tags: ["셰플러"],
    one_liner: "셰플러 R&D. 독일 본사 3년",
    notes: [
      ["셰플러 R&D 엔지니어. 독일 본사 3년", { works_at: "셰플러", team: "R&D" }],
      ["축구 좋아함. 분데스리가 팬, 직접도 뜀", { plays_soccer: "true" }],
    ],
  },
  {
    id: "p27", name: "김나연", tags: ["트레인톤", "연끌"],
    one_liner: "트레인톤 팀원. 데이터 분석",
    notes: [
      ["데이터 분석. SQL 잘함", { skill: "데이터 분석" }],
      ["연끌 2기", { met_at: "연끌" }],
    ],
  },
  {
    id: "p28", name: "이준혁", tags: ["매연"],
    one_liner: "매연 동기. 화학과 대학원, 배터리",
    notes: [
      ["화학과 대학원. 배터리", { major: "화학", interested_in: "배터리" }],
      ["축구 안 함", { plays_soccer: "false" }],
    ],
  },
  {
    id: "p29", name: "정승현", tags: ["연끌"],
    one_liner: "연끌 OB. 에듀테크 스타트업 대표",
    notes: [
      ["연끌 OB. 에듀테크 스타트업 대표", { works_at: "에듀테크 스타트업" }],
      ["축구 함. 연끌 풋살 만든 사람", { plays_soccer: "true" }],
    ],
  },
  {
    id: "p30", name: "유하준", tags: ["트레인톤"],
    one_liner: "트레인톤 참가자. 퍼포먼스 마케팅",
    notes: [
      ["퍼포먼스 마케팅. 홍대 살음", { skill: "퍼포먼스 마케팅", lives_in: "홍대" }],
      ["매운 거 못 먹음", { likes_spicy: "false" }],
    ],
  },
];

// me↔재희 공통 지인: p02 민수, p05 우진, p13 수빈, p17 동욱
export const edges: SeedEdge[] = [
  ["p02", "me", "동기"],
  ["p02", "p01", "소개"],
  ["me", "p01", "소개"],
  ["me", "p05", "같은 팀"],
  ["me", "p13", "동아리"],
  ["me", "p17", "동아리"],
  ["me", "p03", "동아리"],
  ["me", "p04", "인턴 동기"],
  ["me", "p07", "멘토"],
  ["me", "p09", "트레인톤"],
  ["p01", "p05", "동아리"],
  ["p01", "p13", "동창"],
  ["p01", "p17", "풋살"],
  ["p01", "p24", "소개"],
  ["p01", "p29", "동아리"],
  ["p03", "p10", "같은 팀"],
  ["p10", "p19", "동아리"],
  ["p10", "p06", "동아리"],
  ["p04", "p18", "같은 팀"],
  ["p08", "p04", "같은 팀"],
  ["p16", "p27", "멘토"],
  ["p11", "p03", "동아리"],
  ["p29", "p02", "동아리"],
  ["p21", "p02", "룸메"],
];

// 테스트 픽스처 예약 이름. 시드 어디에도 쓰지 않는다.
const RESERVED = new Set([
  "서지우", "한도윤", "임하늘", "문채원", "배시온", "오유진",
  "강태현", "신예린", "조민재", "윤서아", "장하람", "권도현",
]);

const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "홍"];
const GIVEN = [
  "민준", "서준", "예준", "도윤", "시우", "주원", "하준", "지호", "지후", "준서",
  "서연", "서윤", "지우", "하윤", "민서", "지유", "윤서", "채원", "수아", "지아",
  "현우", "우진", "건우", "선우", "유준", "정우", "승현", "준혁", "도현", "지훈",
  "하은", "유나", "예린", "수빈", "지민", "다은", "은서", "소율", "예은", "나연",
  "태현", "승민", "재희", "민수", "하람", "시온", "유진", "하늘", "동현", "지원",
];

// 연락처 800개 연출용 더미. 이름만, 노트/속성 없음.
export function dummies(n = 800) {
  const seeded = new Set(people.map((p) => p.name));
  const out: { id: string; name: string }[] = [];
  for (let s = 0; out.length < n; s++) {
    const name = SURNAMES[s % SURNAMES.length] + GIVEN[Math.floor(s / SURNAMES.length) % GIVEN.length];
    if (RESERVED.has(name) || seeded.has(name)) continue;
    out.push({ id: `d${String(out.length + 1).padStart(3, "0")}`, name });
  }
  // 실제 연락처 느낌: 동명이인 접미사, 직함 메모
  const flavored = ["정승현3", "카카오 김대리", "헬스장 트레이너", "부동산 박사장", "택배 기사님"];
  flavored.forEach((name, i) => (out[i * 131].name = name));
  return out;
}
