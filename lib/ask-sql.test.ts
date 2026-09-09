import { test } from "node:test";
import assert from "node:assert/strict";
import { matchAttributeQuery } from "./ask-sql.ts";

test("매운거 → likes_spicy true", () => {
  assert.deepEqual(matchAttributeQuery("매운거 잘 먹는 사람"), { key: "likes_spicy", value: "true" });
});

test("축구 11명 → plays_soccer true, limit 11", () => {
  assert.deepEqual(matchAttributeQuery("이번 주말 축구 할 사람 11명 뽑아줘"), { key: "plays_soccer", value: "true", limit: 11 });
});

test("김재희 브리핑 → null (LLM 폴백)", () => {
  assert.equal(matchAttributeQuery("다음 주에 김재희 만나는데 브리핑해줘"), null);
});
