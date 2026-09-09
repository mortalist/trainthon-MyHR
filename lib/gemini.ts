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

// Zod JSON Schema → Gemini Interactions schema (nullable 플래그, $schema 제거)
function toGeminiSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (!node || typeof node !== "object") return node;
    const o = { ...(node as Record<string, unknown>) };
    delete o.$schema;
    delete o.additionalProperties;
    if (Array.isArray(o.type) && o.type.includes("null")) {
      o.type = (o.type as string[]).find((t) => t !== "null") ?? "string";
      o.nullable = true;
    }
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === "object" && v !== null) o[k] = walk(v);
    }
    return o;
  };
  return walk(z.toJSONSchema(schema)) as Record<string, unknown>;
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
    response_format: { type: "text", mime_type: "application/json", schema: toGeminiSchema(schema) },
    // gemini-3.7-flash: minimal 미지원 → low가 최소
    generation_config: { thinking_level: "low" },
  });
  return schema.parse(JSON.parse(r.output_text ?? ""));
}
