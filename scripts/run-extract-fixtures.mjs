// Phase 2 fixture runner — POST each fixture to /api/extract and score vs fixtures/README.md
import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] || process.cwd();
const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";

const fixtures = [
  { id: "kakao/01-trainthon", kind: "image", file: "fixtures/kakao/01-trainthon.png", expectPeople: 3, names: ["서지우", "한도윤", "임하늘"], forbidden: ["민수", "나"], keys: { 서지우: [["works_at", "핀테크"], ["job_title", "백엔드"], ["likes_spicy", "true"], ["met_at", "트레인톤"]], 한도윤: [["plays_soccer", "true"], ["lives_in", "강릉"], ["met_at", "트레인톤"]], 임하늘: [["met_at", "트레인톤"]] } },
  { id: "kakao/01-trainthon#2", kind: "image", file: "fixtures/kakao/01-trainthon.png", expectPeople: 3, names: ["서지우", "한도윤", "임하늘"], forbidden: ["민수", "나"], keys: { 서지우: [["works_at", "핀테크"], ["job_title", "백엔드"], ["likes_spicy", "true"]], 한도윤: [["plays_soccer", "true"], ["lives_in", "강릉"]], 임하늘: [["met_at", "트레인톤"]] } },
  { id: "kakao/02-yeonkkeul", kind: "image", file: "fixtures/kakao/02-yeonkkeul.png", expectPeople: 3, names: ["문채원", "배시온", "오유진"], forbidden: ["민수", "나"], keys: { 문채원: [["works_at", "카카오"]], 배시온: [["likes_spicy", "false"], ["lives_in", "판교"]], 오유진: [["interested_in", "클래식"]] } },
  { id: "kakao/03-scheffler", kind: "image", file: "fixtures/kakao/03-scheffler.png", expectPeople: 3, names: ["강태현", "신예린", "조민재"], forbidden: ["민수", "나"], keys: { 강태현: [["plays_soccer", "true"], ["university", "연세"], ["major", "체육"]], 신예린: [["plays_soccer", "true"], ["university", "고려"], ["major", "경영"]], 조민재: [["plays_soccer", "false"], ["university", "연세"], ["major", "컴퓨터"]] } },
  { id: "kakao/04-maeyeon", kind: "image", file: "fixtures/kakao/04-maeyeon.png", expectPeople: 3, names: ["윤서아", "장하람", "권도현"], forbidden: ["민수", "나"], keys: { 윤서아: [["works_at", "네이버"], ["job_title", "PM"], ["interested_in", "러닝"], ["met_at", "농구동아리"]], 장하람: [["works_at", "하람"], ["job_title", "대표"], ["met_at", "농구동아리"]], 권도현: [["works_at", "노스스타"], ["job_title", "심사"], ["met_at", "농구동아리"]] } },
  { id: "text/01-memo", kind: "text", file: "fixtures/text/01-memo.txt", expectPeople: 1, names: ["서지우"], forbidden: ["민수", "나"], keys: { 서지우: [["works_at", "핀테크"], ["job_title", "백엔드"], ["likes_spicy", "true"], ["met_at", "트레인톤"]] } },
  { id: "text/02-memo", kind: "text", file: "fixtures/text/02-memo.txt", expectPeople: 1, names: ["한도윤"], forbidden: ["민수", "나"], keys: { 한도윤: [["plays_soccer", "true"], ["lives_in", "강릉"]] } },
  { id: "text/03-namecard", kind: "text", file: "fixtures/text/03-namecard.txt", expectPeople: 1, names: ["권도현"], forbidden: ["민수", "나"], keys: { 권도현: [["works_at", "노스스타"], ["job_title", "심사"], ["email", "dohyun.kwon"]] } },
  { id: "linkedin/01-kim-jaehee", kind: "image", file: "fixtures/linkedin/01-kim-jaehee.png", expectPeople: 1, names: ["김재희"], forbidden: ["민수", "나"], requireId: true, keys: { 김재희: [["works_at", "페이루프"], ["job_title", "Backend"], ["university", "연세"], ["major", "컴퓨터"], ["lives_in", "마포"], ["likes_spicy", "true"], ["plays_soccer", "true"]] } },
  { id: "linkedin/02-ryu-haeun", kind: "image", file: "fixtures/linkedin/02-ryu-haeun.png", expectPeople: 1, names: ["류하은"], forbidden: ["민수", "나"], keys: { 류하은: [["works_at", "삼성"], ["job_title", "공정"], ["university", "KAIST"], ["major", "신소재"], ["lives_in", "대전"], ["plays_soccer", "true"]] } },
  { id: "namecard/01-kwon-dohyun", kind: "image", file: "fixtures/namecard/01-kwon-dohyun.png", expectPeople: 1, names: ["권도현"], forbidden: ["민수", "나"], keys: { 권도현: [["works_at", "노스스타"], ["job_title", "심사"], ["email", "dohyun.kwon"]] } },
  { id: "namecard/02-new", kind: "image", file: "fixtures/namecard/02-new.png", expectPeople: 1, names: ["백승민"], forbidden: ["민수", "나", "장하람"], keys: { 백승민: [["works_at", "카나"], ["job_title", "디렉터"], ["email", "seungmin@studiokana"]] } },
];

function mimeOf(p) {
  if (p.endsWith(".png")) return "image/png";
  if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function attrFor(result, name, personId) {
  return result.attributes.filter((a) => a.person === name || (personId && a.person === personId));
}

function hasKeyValue(attrs, key, contains) {
  const hit = attrs.find((a) => a.key === key && String(a.value).toLowerCase().includes(String(contains).toLowerCase()));
  return !!hit;
}

function hasAltKey(attrs, keys, contains) {
  return keys.some((k) => hasKeyValue(attrs, k, contains));
}

async function runOne(fx) {
  const abs = path.join(ROOT, fx.file);
  const body = { source: fx.kind === "image" ? "kakao_screenshot" : "text" };
  if (fx.kind === "image") {
    const b64 = fs.readFileSync(abs).toString("base64");
    body.image = `data:${mimeOf(abs)};base64,${b64}`;
  } else {
    body.text = fs.readFileSync(abs, "utf8");
  }
  const t0 = Date.now();
  const res = await fetch(`${BASE}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const ms = Date.now() - t0;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { id: fx.id, ms, pass: false, names: [], keys: [], detail: `HTTP ${res.status}: ${json.error || JSON.stringify(json).slice(0, 200)}` };
  }

  const names = (json.people || []).map((p) => p.name);
  const fails = [];
  if (json.people.length !== fx.expectPeople) fails.push(`people=${json.people.length} want ${fx.expectPeople}`);
  for (const n of fx.names) if (!names.includes(n)) fails.push(`missing ${n}`);
  for (const n of fx.forbidden) if (names.includes(n)) fails.push(`forbidden person ${n}`);
  if (fx.requireId) {
    const p = json.people.find((x) => x.name === fx.names[0]);
    if (!p?.id) fails.push("expected existing id");
  }

  const keyNotes = [];
  for (const [personName, asserts] of Object.entries(fx.keys || {})) {
    const person = (json.people || []).find((p) => p.name === personName);
    const attrs = attrFor(json, personName, person?.id);
    for (const [keySpec, contains] of asserts) {
      const keys = keySpec.split("|").map((s) => s.trim());
      const ok = keys.length > 1 ? hasAltKey(attrs, keys, contains) : hasKeyValue(attrs, keys[0], contains);
      keyNotes.push(`${personName}.${keys[0]}=${ok ? "Y" : "N"}`);
      if (!ok) fails.push(`${personName} missing ${keys.join("|")}~${contains} (got: ${attrs.map((a) => a.key + "=" + a.value).join("; ") || "none"})`);
    }
  }

  // reserved keys presence when asserted
  const reservedHit = ["likes_spicy", "plays_soccer"].filter((k) => (json.attributes || []).some((a) => a.key === k));

  return {
    id: fx.id,
    ms,
    pass: fails.length === 0,
    names,
    keys: keyNotes,
    reserved: reservedHit,
    detail: fails.join(" | ") || "ok",
    peopleCount: json.people?.length,
  };
}

const rows = [];
for (const fx of fixtures) {
  process.stdout.write(`→ ${fx.id}...\n`);
  try {
    rows.push(await runOne(fx));
  } catch (e) {
    rows.push({ id: fx.id, ms: 0, pass: false, names: [], keys: [], detail: String(e) });
  }
}

console.log("\n=== FIXTURE RESULTS ===");
for (const r of rows) {
  console.log(
    `${r.pass ? "PASS" : "FAIL"}\t${r.ms}ms\t${r.id}\tpeople=[${(r.names || []).join(",")}] \t${r.detail}`,
  );
}
const pass = rows.filter((r) => r.pass).length;
console.log(`\n${pass}/${rows.length} passed`);
process.exit(pass === rows.length ? 0 : 1);
