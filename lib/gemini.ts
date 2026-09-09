import "server-only";
import { GoogleGenAI, type Interactions } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 3.8은 기본 thinking 때문에 TTFT가 길다. 느리면 'gemini-3.5-flash-lite'로 한 줄 교체.
export const MODEL = "gemini-3.7-flash";

export type InteractionInput = Interactions.Content;

export const textPart = (text: string): InteractionInput => ({ type: "text", text });

// data URL(예: 붙여넣은 이미지의 FileReader 결과) → 이미지 입력 파트
export function imagePart(dataUrl: string): InteractionInput {
  const [meta, data] = dataUrl.split(",", 2);
  return { type: "image", data, mime_type: meta.slice("data:".length, meta.indexOf(";")) };
}

// JSON 스키마 강제 생성 → Zod로 검증해 반환. /extract, /ask가 쓴다.
export async function generateJson<T extends z.ZodTypeAny>(
  schema: T,
  input: InteractionInput[],
  systemInstruction?: string,
): Promise<z.infer<T>> {
  const r = await ai.interactions.create({
    model: MODEL,
    input,
    system_instruction: systemInstruction,
    response_format: { type: "text", mime_type: "application/json", schema: z.toJSONSchema(schema) },
    generation_config: { thinking_level: "minimal" },
  });
  return schema.parse(JSON.parse(r.output_text ?? ""));
}
