import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { generateJson, imagePart, textPart } from "@/lib/gemini";
import { attributeKeys, currentAttributes, listPeople } from "@/lib/queries";
import { ExtractResult, type ExtractResponse } from "@/lib/schemas";

export const maxDuration = 60;

const SYSTEM = `당신은 개인 인맥 노트의 정보 추출기다. 카톡 대화 캡처·메모·명함·프로필 텍스트를 읽고 사람 단위 사실을 뽑는다.

[사람 people]
- 「나」는 사용자 본인이다. 카톡 캡처에서 오른쪽 노란 말풍선, 텍스트에서 [나]는 모두 본인이다. 본인(id 'me')은 people에 넣지 않고 attributes도 만들지 않는다.
- 대화의 실제 참가자(말풍선을 남긴 사람), 메모의 주인공, 명함/프로필의 인물만 people에 넣는다.
- 대화 속에서 언급만 된 제3자(예: 「민수가 소개해줬어」의 민수)는 people에 넣지 않는다. edges의 끝점으로만 쓴다.
- 이름이 [기존 사람 목록]의 이름과 같으면 새 사람을 만들지 말고 그 id를 쓴다(entity resolution). 목록에 없으면 id는 null.
- one_liner: 목록에 보일 짧은 한국어 한 문장 (예: 「핀테크 스타트업 백엔드, 매운 거 좋아함」).
- tags: 방 제목·문맥으로 커뮤니티가 분명할 때만 연끌 / 매연 / 셰플러 / 트레인톤 중에서. 아니면 빈 배열. 방 제목에 「트레인톤」「연끌」「셰플러」「매연」이 있으면 참가자 전원 tags에 넣고, 각 사람에게 met_at도 같은 값으로 만든다.

[속성 attributes] 한 줄 = 사실 하나. person에는 그 사람의 id(기존) 또는 이름(신규)을 쓴다.
- key는 반드시 [속성 키 목록]에 있는 키를 재사용한다. 목록의 어떤 키로도 표현할 수 없는 진짜 새로운 개념일 때만 새 키를 만든다 (영어 snake_case).
- 금지 동의어(절대 새 키로 쓰지 말 것): role/title/position → job_title, company/org → works_at, skill → skills, hometown/city → lives_in, recent_news → status.
- 필수 매핑: 축구/풋살/football/futsal → plays_soccer, 매운 음식 → likes_spicy, 직장/회사/소속 → works_at, 직책/직무/직함 → job_title, 거주지/사는 곳/출신 지역 → lives_in, 학교 → university, 전공 → major, 관심사/취미 → interested_in, 만난 곳/계기 → met_at, 근황/최근 소식 → status, 이메일 → email, 웹사이트 → website, SNS/인스타 → instagram.
- 명함·프로필에 이메일이 보이면 반드시 email 키로 뽑는다. 전화번호는 명함에 없으면 만들지 않는다.
- LinkedIn/프로필 헤드라인(직함·회사)은 빠뜨리지 말고 works_at + job_title을 둘 다 만든다.
- 「강릉 카페 오픈」처럼 거주+근황이 같이 나오면 lives_in(강릉)과 status(카페 오픈)를 둘 다 만든다.
- 예/아니오는 문자열 'true' / 'false'. (「매운 거 못 먹음」 → likes_spicy 'false', 「부상으로 못 뛴다」 → plays_soccer 'false')
- value는 짧은 한국어 문구. 여러 항목이면 쉼표로 이어 한 줄.
- evidence는 원문에서 그 사실을 뒷받침하는 문구를 그대로 인용한다.
- 약속·일정은 사실이 아니면 속성으로 만들지 않는다. 사람에 대한 지속적 사실(직장, 사는 곳, 취향, 근황)만.

[관계 edges] 사람과 사람 사이. 「A가 B를 소개해줬어」 → {from: A, to: B, label: '소개'}. from/to에는 기존 id 또는 이름을 쓴다. 본인과의 관계(같은 방에 있음, 만남 등)는 만들지 않는다.

[raw_text] 입력 전체를 평문으로 전사한다. 이미지면 방 제목·날짜·「이름: 말」 순서로 대화를 그대로 옮긴다. 텍스트면 원문 그대로.`;

const KEY_ALIASES: Record<string, string> = {
  role: "job_title",
  title: "job_title",
  position: "job_title",
  company: "works_at",
  org: "works_at",
  skill: "skills",
  hobby: "interested_in",
  recent_news: "status",
  hometown: "lives_in",
  city: "lives_in",
};

const COMMUNITY_TAGS = ["연끌", "매연", "셰플러", "트레인톤"] as const;

export async function POST(req: Request) {
  const t0 = Date.now();
  const body = (await req.json().catch(() => null)) as { text?: string; image?: string; source?: string } | null;
  if (!body || (!body.text?.trim() && !body.image)) return NextResponse.json({ error: "text 또는 image가 필요합니다" }, { status: 400 });

  const [people, keys] = await Promise.all([listPeople(), attributeKeys()]);
  // 더미(이름만 있는 800명)와 본인('me', one_liner/tags 없음)은 엔티티 해소 후보에서 제외.
  const candidates = people.filter((p) => p.id !== "me" && (p.one_liner || p.tags.length)).map(({ id, name }) => ({ id, name }));
  const keyList = [...new Set([...keys, "likes_spicy", "plays_soccer"])].sort();

  const input = [
    textPart(`[기존 사람 목록]\n${candidates.map((p) => `${p.id}: ${p.name}`).join("\n")}\n\n[속성 키 목록]\n${keyList.join(", ")}`),
    ...(body.image ? [imagePart(body.image)] : []),
    ...(body.text?.trim() ? [textPart(`[입력]\n${body.text}`)] : []),
  ];

  let result: ExtractResult;
  try {
    result = await generateJson(ExtractResult, input, SYSTEM);
  } catch (e) {
    const message = e instanceof ZodError ? e.message : String(e);
    console.error("[extract] fail", Date.now() - t0, "ms", message);
    return NextResponse.json({ error: message }, { status: e instanceof ZodError || e instanceof SyntaxError ? 422 : 500 });
  }

  // 모델이 준 id가 실제 후보가 아니면 신규로, id 없이 이름만 일치하면 기존으로 (해소 안전망)
  const byId = new Map(candidates.map((p) => [p.id, p]));
  const byName = new Map(candidates.map((p) => [p.name, p.id]));
  const isMe = (x: string) => x === "me" || x === "나";
  result.people = result.people
    .filter((p) => !isMe(p.id ?? "") && !isMe(p.name))
    .map((p) => ({ ...p, id: p.id && byId.has(p.id) ? p.id : (byName.get(p.name) ?? null) }));
  result.attributes = result.attributes
    .filter((a) => !isMe(a.person))
    .map((a) => ({ ...a, key: KEY_ALIASES[a.key] ?? a.key }));
  // 방 제목/태그 → met_at·tags 안전망
  const community =
    result.people.flatMap((p) => p.tags).find((t) => (COMMUNITY_TAGS as readonly string[]).includes(t)) ??
    COMMUNITY_TAGS.find((c) => result.raw_text.includes(c)) ??
    null;
  if (community) {
    for (const p of result.people) {
      if (!p.tags.includes(community)) p.tags = [...p.tags, community];
      const has = result.attributes.some((a) => a.key === "met_at" && (a.person === p.id || a.person === p.name));
      if (!has) {
        result.attributes.push({
          person: p.id ?? p.name,
          key: "met_at",
          value: community,
          evidence: `커뮤니티: ${community}`,
        });
      }
    }
  }
  // 단일 인물 소스(명함/링크드인)에서 job_title 누락 시 raw_text에서 복구
  if (result.people.length === 1) {
    const p = result.people[0];
    const hasTitle = result.attributes.some((a) => a.key === "job_title" && (a.person === p.id || a.person === p.name));
    if (!hasTitle) {
      const m = result.raw_text.match(
        /Backend Engineer|Investment Associate|Brand Director|공정\s*엔지니어|백엔드\s*개발자?|심사역|브랜드\s*디렉터|프로덕트\s*매니저|\bPM\b/i,
      );
      if (m) {
        result.attributes.push({ person: p.id ?? p.name, key: "job_title", value: m[0], evidence: m[0] });
      }
    }
  }
  // 본인과의 관계는 만들지 않는다 (프롬프트와 동일 안전망)
  result.edges = result.edges.filter((e) => !isMe(e.from) && !isMe(e.to));

  const existingIds = result.people.flatMap((p) => (p.id ? [p.id] : []));
  const existing: ExtractResponse["existing"] = {};
  if (existingIds.length) {
    for (const a of await currentAttributes(existingIds)) (existing[a.person_id] ??= []).push({ key: a.key, value: a.value });
  }

  console.log("[extract]", Date.now() - t0, "ms", body.image ? "image" : "text", result.people.length, "people");
  return NextResponse.json({ ...result, candidates, existing } satisfies ExtractResponse);
}
