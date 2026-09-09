// npm run seed — schema.sql 재실행(드롭/생성) 후 시드 삽입. 무대 직전 리셋 절차.
import { readFileSync } from "node:fs";
import pg from "pg";
import { me, people, edges, dummies } from "../data/seed.ts";

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

await db.query(readFileSync("supabase/schema.sql", "utf8"));

await db.query("insert into people (id, name) values ($1, $2)", [me.id, me.name]);
for (const p of people) {
  await db.query("insert into people (id, name, tags, one_liner) values ($1, $2, $3, $4)", [p.id, p.name, p.tags, p.one_liner]);
  for (const [text, attrs] of p.notes) {
    const { rows } = await db.query<{ id: number }>(
      "insert into notes (person_id, raw_text, source) values ($1, $2, 'seed') returning id",
      [p.id, text],
    );
    for (const [key, value] of Object.entries(attrs ?? {})) {
      await db.query("insert into attributes (person_id, key, value, source) values ($1, $2, $3, $4)", [p.id, key, value, rows[0].id]);
    }
  }
}
for (const [from, to, label] of edges) {
  await db.query("insert into relationships (from_id, to_id, label, source) values ($1, $2, $3, 'seed')", [from, to, label]);
}
const d = dummies();
await db.query("insert into people (id, name) select * from unnest($1::text[], $2::text[])", [d.map((x) => x.id), d.map((x) => x.name)]);

const count = async (sql: string) => (await db.query(sql)).rows[0].n;
console.log({
  people: await count("select count(*)::int n from people"),
  attributes: await count("select count(*)::int n from attributes"),
  relationships: await count("select count(*)::int n from relationships"),
  soccer: await count("select count(*)::int n from current_attributes where key='plays_soccer' and value='true'"),
});
// current_attributes 뷰 검증: p06은 true 뒤에 false가 왔으니 현재값은 false여야 한다 (data/seed.ts 주석 참고)
const p06 = (await db.query("select value from current_attributes where person_id='p06' and key='plays_soccer'")).rows[0]?.value;
if (p06 !== "false") throw new Error(`current_attributes view broken: p06 plays_soccer = ${p06}`);
await db.end();
