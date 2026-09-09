import { z } from "zod";

// Gemini response_format용: 평탄, union/record 없음, 없을 수 있는 값은 nullable.
export const ExtractResult = z.object({
  people: z.array(
    z.object({
      id: z.string().nullable(), // 기존 사람이면 people.id, 새 사람이면 null
      name: z.string(),
      tags: z.array(z.string()),
      one_liner: z.string().nullable(),
    }),
  ),
  attributes: z.array(
    z.object({
      person: z.string(), // id 또는 이름
      key: z.string(), // snake_case. 있는 키 재사용
      value: z.string(), // 예/아니오는 'true' / 'false'
      evidence: z.string(), // 원문에서 근거 한 줄
    }),
  ),
  edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string() })),
  raw_text: z.string(), // 노트/캡처의 평문 전사 → notes.raw_text
});
export type ExtractResult = z.infer<typeof ExtractResult>;

// /api/extract 응답 = ExtractResult + 카드 UI용 부가 정보 (2번째 왕복 방지)
export type ExtractResponse = ExtractResult & {
  candidates: { id: string; name: string }[]; // 사람 바꾸기 select용 (더미 제외)
  existing: Record<string, { key: string; value: string }[]>; // 기존 사람의 현재 속성 (before → after)
};

// 스와이프 카드 한 장 = 사람 하나 + 그 사람 속성/엣지. savePerson 입력.
export type Card = {
  person: ExtractResult["people"][number];
  attributes: Omit<ExtractResult["attributes"][number], "person">[];
  edges: ExtractResult["edges"];
};

export const AskResult = z.object({
  answer: z.string(),
  people: z.array(z.object({ id: z.string(), evidence: z.string() })),
});
export type AskResult = z.infer<typeof AskResult>;

// /api/ask 응답 = AskResult + 이름 조회(클라이언트가 2번째 왕복 없이 이름/한줄을 렌더).
export type AskResponse = AskResult & {
  names: Record<string, { name: string; photo_url: string | null; one_liner: string | null }>;
};
