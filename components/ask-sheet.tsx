"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { AskResponse } from "@/lib/schemas";

// PRODUCT.md §8 프리셋 (무대에서 타이핑 안 함).
const PRESETS = [
  "이번 주말 축구 할 사람 11명 뽑아줘",
  "매운거 잘 먹는 사람",
  "다음 주에 김재희 만나는데 브리핑해줘",
];

export function AskSheet() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = async (text: string) => {
    const query = text.trim();
    if (!query) return;
    setQ(query);
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, mode: "ask" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `질문 실패 (${res.status})`);
      setData(body as AskResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      onOpenChange={(v) => {
        if (!v) {
          setQ("");
          setData(null);
          setError(null);
          setLoading(false);
        }
      }}
    >
      <SheetTrigger render={<Button className="h-11 rounded-full px-5 shadow-lg" />}>질문</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90%] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>인맥에게 묻기</SheetTitle>
        </SheetHeader>

        <div className="space-y-3 px-4 pb-6">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => void ask(p)}
                className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(q);
            }}
            className="flex gap-2"
          >
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="궁금한 걸 물어보세요" />
            <Button type="submit" disabled={loading}>
              {loading ? "…" : "질문"}
            </Button>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {data && (
            <div className="space-y-3">
              <p className="text-sm whitespace-pre-wrap">{data.answer}</p>
              {data.people.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.people.map((p) => {
                    const person = data.names[p.id];
                    if (!person) return null;
                    return (
                      <Link
                        key={p.id}
                        href={`/person/${p.id}`}
                        title={p.evidence}
                        className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
                      >
                        {person.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
