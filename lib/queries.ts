import { db } from "./db";

export type PersonRow = {
  id: string;
  name: string;
  photo_url: string | null;
  tags: string[];
  one_liner: string | null;
};
export type AttributeRow = { id: number; person_id: string; key: string; value: string; source: number | null };
export type NoteRow = { id: number; person_id: string; raw_text: string; source: string; created_at: string };
export type Neighbor = { id: string; name: string; label: string };

const ok = <T>(r: { data: T | null; error: { message: string } | null }): T => {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
};

const PERSON_COLS = "id,name,photo_url,tags,one_liner";

// ponytail: Supabase 기본 max-rows 1000. 시드 831명이라 한 번에 다 온다. 넘으면 페이지네이션.
export async function listPeople(): Promise<PersonRow[]> {
  return ok(await db.from("people").select(PERSON_COLS).order("name"));
}

// (person_id, key)별 최신 값. schema.sql의 current_attributes 뷰.
export async function currentAttributes(personIds?: string[]): Promise<AttributeRow[]> {
  let q = db.from("current_attributes").select("*");
  if (personIds) q = q.in("person_id", personIds);
  return ok(await q);
}

export async function attributeKeys(): Promise<string[]> {
  const rows = ok<{ key: string }[]>(await db.from("current_attributes").select("key"));
  return [...new Set(rows.map((r) => r.key))].sort();
}

export async function getPerson(id: string) {
  const person = ok<PersonRow | null>(await db.from("people").select(PERSON_COLS).eq("id", id).maybeSingle());
  if (!person) return null;
  const [attributes, notes, rels] = await Promise.all([
    currentAttributes([id]),
    ok<NoteRow[]>(await db.from("notes").select("*").eq("person_id", id).order("created_at", { ascending: false })),
    ok<{ from_id: string; to_id: string; label: string }[]>(
      await db.from("relationships").select("from_id,to_id,label").or(`from_id.eq.${id},to_id.eq.${id}`),
    ),
  ]);
  const otherIds = rels.map((r) => (r.from_id === id ? r.to_id : r.from_id));
  const names = otherIds.length
    ? ok<{ id: string; name: string }[]>(await db.from("people").select("id,name").in("id", otherIds))
    : [];
  const nameOf = new Map(names.map((n) => [n.id, n.name]));
  const neighbors: Neighbor[] = rels.map((r) => {
    const nid = r.from_id === id ? r.to_id : r.from_id;
    return { id: nid, name: nameOf.get(nid) ?? nid, label: r.label };
  });
  return { ...person, attributes, notes, neighbors };
}

// 속성이 하나 이상 있는 사람(= 더미 제외) + 현재 속성. LLM 프롬프트용.
export async function contextPeople(): Promise<(PersonRow & { attributes: { key: string; value: string }[] })[]> {
  const attrs = await currentAttributes();
  const byPerson = new Map<string, { key: string; value: string }[]>();
  for (const a of attrs) byPerson.set(a.person_id, [...(byPerson.get(a.person_id) ?? []), { key: a.key, value: a.value }]);
  const people = ok<PersonRow[]>(await db.from("people").select(PERSON_COLS).in("id", [...byPerson.keys()]).order("name"));
  return people.map((p) => ({ ...p, attributes: byPerson.get(p.id) ?? [] }));
}
