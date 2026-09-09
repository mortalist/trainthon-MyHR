// 자연어 질의 → 속성 쿼리 매핑. 매핑되면 SQL로 즉답, 안 되면 null → LLM 폴백.
// ponytail: 하드코딩 2개. 천장: 새 와우 질의마다 한 줄 추가. 업그레이드: LLM에게 키 선택을 맡김.
export type AttributeQuery = { key: string; value: string; limit?: number };

export function matchAttributeQuery(q: string): AttributeQuery | null {
  const n = q.match(/(\d+)\s*명/)?.[1];
  const limit = n ? { limit: Number(n) } : {};
  if (/매운|매워|맵/.test(q)) return { key: "likes_spicy", value: "true", ...limit };
  if (/축구|풋살/.test(q)) return { key: "plays_soccer", value: "true", ...limit };
  return null;
}
