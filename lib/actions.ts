"use server";

import { db } from "./db";
import type { Card } from "./schemas";

const ok = <T>(r: { data: T | null; error: { message: string } | null }): T => {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
};

// 오른쪽 스와이프 = 이 사람만 저장. people upsert → notes → attributes(source=note) → relationships.
// 왼쪽 스와이프는 이 함수를 부르지 않는다(DB 무변화).
export async function savePerson(card: Card, rawText: string, source: "text" | "kakao_screenshot") {
  const id = card.person.id ?? crypto.randomUUID();

  const prev = card.person.id
    ? ok<{ tags: string[] } | null>(await db.from("people").select("tags").eq("id", id).maybeSingle())
    : null;
  ok(
    await db.from("people").upsert({
      id,
      name: card.person.name,
      tags: [...new Set([...(prev?.tags ?? []), ...card.person.tags])],
      ...(card.person.one_liner && { one_liner: card.person.one_liner }),
      updated_at: new Date().toISOString(),
    }),
  );

  const note = ok<{ id: number }>(
    await db.from("notes").insert({ person_id: id, raw_text: rawText, source }).select("id").single(),
  );

  if (card.attributes.length) {
    ok(
      await db
        .from("attributes")
        .insert(card.attributes.map((a) => ({ person_id: id, key: a.key, value: a.value, source: note.id }))),
    );
  }

  if (card.edges.length) {
    // 끝점 = 기존 id 또는 이름. 이 카드의 사람은 방금 만든 id로. people에 없는 이름은 그 엣지를 버린다.
    // ponytail: 이름 매칭은 people 전체(더미 800 포함) 대상. 동명이인이면 첫 행. 업그레이드: 후보(맥락 있는 사람)만.
    const ends = [...new Set(card.edges.flatMap((e) => [e.from, e.to]))];
    const rows = ok<{ id: string; name: string }[]>(
      await db.from("people").select("id,name").or(`id.in.(${ends.map(quote)}),name.in.(${ends.map(quote)})`),
    );
    const resolve = (x: string) =>
      x === card.person.name || x === card.person.id ? id : (rows.find((r) => r.id === x) ?? rows.find((r) => r.name === x))?.id;
    const edges = card.edges.flatMap((e) => {
      const from = resolve(e.from), to = resolve(e.to);
      return from && to ? [{ from_id: from, to_id: to, label: e.label, source: String(note.id) }] : [];
    });
    if (edges.length) ok(await db.from("relationships").insert(edges));
  }

  return { id };
}

const quote = (s: string) => `"${s.replace(/"/g, "")}"`;
