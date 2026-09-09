import { NextResponse } from "next/server";
import { generateJson, textPart } from "@/lib/gemini";
import { matchAttributeQuery } from "@/lib/ask-sql";
import {
  attributeMatch,
  contextEdges,
  contextPeople,
  getPerson,
  mutuals,
  peopleByIds,
} from "@/lib/queries";
import { AskResult, type AskResponse } from "@/lib/schemas";

export const maxDuration = 60;

// SQL 경로 답변 문구. 새 키를 매핑하면 여기 한 줄 추가.
const SQL_ANSWER: Record<string, (n: number) => string> = {
  likes_spicy: (n) => `매운 음식을 잘 먹는 사람 ${n}명이에요.`,
  plays_soccer: (n) => `축구·풋살 하는 사람 ${n}명이에요.`,
};

const SYSTEM = `당신은 사용자('나')의 인맥 비서다. 아래에 주어진 사람과 사실만 근거로 한국어로 답한다.
- answer: 질문에 대한 2~4문장 한국어 답변. 브리핑이면 그 사람의 핵심 사실과 공통 지인을 자연스럽게 요약한다.
- people: 답과 직접 관련된 사람의 id와 근거(evidence, 그 사람에 대한 사실 한 줄)를 넣는다. 브리핑이면 대상을 반드시 포함한다.
- 주어진 목록에 없는 사람이나 사실은 지어내지 않는다. 근거가 없으면 people는 빈 배열.`;

export async function POST(req: Request) {
  const t0 = Date.now();
  const body = (await req.json().catch(() => null)) as { q?: string; mode?: "search" | "ask" } | null;
  const q = body?.q?.trim();
  if (!q) return NextResponse.json({ error: "q가 필요합니다" }, { status: 400 });

  const sql = matchAttributeQuery(q);
  let result: AskResult;
  const names: AskResponse["names"] = {};

  if (sql) {
    const matches = await attributeMatch(sql.key, sql.value, sql.limit);
    result = { answer: (SQL_ANSWER[sql.key] ?? (() => `${matches.length}명 찾았어요.`))(matches.length), people: matches.map((m) => ({ id: m.id, evidence: m.evidence })) };
    for (const m of matches) names[m.id] = { name: m.name, photo_url: m.photo_url, one_liner: m.one_liner };
    console.log(`[ask] sql ${Date.now() - t0}ms`);
  } else {
    const input = [textPart(await buildLlmPrompt(q))];
    result = await generateJson(AskResult, input, SYSTEM);
    const rows = await peopleByIds(result.people.map((p) => p.id));
    for (const r of rows) names[r.id] = { name: r.name, photo_url: r.photo_url, one_liner: r.one_liner };
    // 이름을 못 찾은(환각) id는 버린다.
    result = { ...result, people: result.people.filter((p) => names[p.id]) };
    console.log(`[ask] llm ${Date.now() - t0}ms`);
  }

  return NextResponse.json({ ...result, names } satisfies AskResponse);
}

// 이름이 질의에 있으면(예: 브리핑) 그 사람+이웃으로 좁힌다. 아니면 맥락 있는 사람 전체.
async function buildLlmPrompt(q: string): Promise<string> {
  const ctx = await contextPeople();
  const named = ctx.find((p) => q.includes(p.name));

  if (named) {
    const [person, muts] = await Promise.all([getPerson(named.id), mutuals(named.id)]);
    const facts = (person?.attributes ?? []).map((a) => ` · ${a.key}: ${a.value}`).join("\n") || " · (없음)";
    const notes = (person?.notes ?? []).map((n) => ` · ${n.raw_text}`).join("\n") || " · (없음)";
    const meEdge = (person?.neighbors ?? []).filter((n) => n.id === "me").map((n) => n.label).join(", ") || "직접 연결 없음";
    const mutualsText = muts.map((m) => m.name).join(", ") || "없음";
    return `[질문]\n${q}\n\n[대상] ${named.id} ${named.name} (${named.tags.join(", ")}) — ${named.one_liner ?? ""}\n[사실]\n${facts}\n[노트(최신순)]\n${notes}\n[나와의 관계] ${meEdge}\n[공통 지인(나와 ${named.name} 둘 다 아는 사람)] ${mutualsText}`;
  }

  const edges = await contextEdges();
  const nameOf = new Map(ctx.map((p) => [p.id, p.name]));
  const peopleText = ctx
    .map((p) => `${p.id} ${p.name} (${p.tags.join(", ")}) — ${p.one_liner ?? ""}\n${p.attributes.map((a) => ` · ${a.key}: ${a.value}`).join("\n")}`)
    .join("\n\n");
  const edgesText = edges
    .filter((e) => (nameOf.has(e.from_id) || e.from_id === "me") && (nameOf.has(e.to_id) || e.to_id === "me"))
    .map((e) => ` · ${e.from_id === "me" ? "나" : nameOf.get(e.from_id)} → ${e.to_id === "me" ? "나" : nameOf.get(e.to_id)} (${e.label})`)
    .join("\n");
  return `[질문]\n${q}\n\n[인맥 사람들]\n${peopleText}\n\n[관계]\n${edgesText}`;
}
