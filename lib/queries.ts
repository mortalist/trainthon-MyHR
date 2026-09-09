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

// 맥락 있는 사람들 사이의 엣지. LLM 프롬프트에 관계 정보로 넣는다.
export async function contextEdges(): Promise<{ from_id: string; to_id: string; label: string }[]> {
  return ok(await db.from("relationships").select("from_id,to_id,label"));
}

export type AskMatch = { id: string; name: string; photo_url: string | null; one_liner: string | null; evidence: string };

// SQL 와우: key=value 현재값을 가진 사람 + 근거(그 사실을 만든 노트 원문). limit은 상위 N.
export async function attributeMatch(key: string, value: string, limit?: number): Promise<AskMatch[]> {
  const attrs = ok<{ person_id: string; source: number | null }[]>(
    await db.from("current_attributes").select("person_id,source").eq("key", key).eq("value", value),
  );
  if (!attrs.length) return [];
  const sourceOf = new Map(attrs.map((a) => [a.person_id, a.source]));
  const noteIds = attrs.flatMap((a) => (a.source ? [a.source] : []));
  const people = ok<PersonRow[]>(
    await db.from("people").select(PERSON_COLS).in("id", [...sourceOf.keys()]).order("name"),
  );
  const notes = noteIds.length
    ? ok<{ id: number; raw_text: string }[]>(await db.from("notes").select("id,raw_text").in("id", noteIds))
    : [];
  const noteOf = new Map(notes.map((n) => [n.id, n.raw_text]));
  const out = people.map((p) => ({
    id: p.id,
    name: p.name,
    photo_url: p.photo_url,
    one_liner: p.one_liner,
    evidence: noteOf.get(sourceOf.get(p.id) ?? -1) ?? p.one_liner ?? `${key}=${value}`,
  }));
  return limit ? out.slice(0, limit) : out;
}

export async function peopleByIds(ids: string[]): Promise<PersonRow[]> {
  if (!ids.length) return [];
  return ok(await db.from("people").select(PERSON_COLS).in("id", ids));
}

// 나(me)와 이 사람 둘 다와 연결된 사람(공통 지인). relationships 양방향 교집합.
export async function mutuals(id: string): Promise<{ id: string; name: string }[]> {
  const neighborsOf = async (pid: string) => {
    const rels = ok<{ from_id: string; to_id: string }[]>(
      await db.from("relationships").select("from_id,to_id").or(`from_id.eq.${pid},to_id.eq.${pid}`),
    );
    return new Set(rels.map((r) => (r.from_id === pid ? r.to_id : r.from_id)));
  };
  const [mine, theirs] = await Promise.all([neighborsOf("me"), neighborsOf(id)]);
  const common = [...mine].filter((x) => theirs.has(x) && x !== "me" && x !== id);
  if (!common.length) return [];
  return ok(await db.from("people").select("id,name").in("id", common));
}
