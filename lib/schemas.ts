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
});
export type ExtractResult = z.infer<typeof ExtractResult>;

export const AskResult = z.object({
  answer: z.string(),
  people: z.array(z.object({ id: z.string(), evidence: z.string() })),
});
export type AskResult = z.infer<typeof AskResult>;
