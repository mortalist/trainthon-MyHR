"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AskResponse } from "@/lib/schemas";

// query: 검색창의 trim된 비어있지 않은 문자열. 이름 로컬 매칭 아래에 /api/ask mode=search 결과 + 근거를 렌더.
export function AiSearchResults({ query }: { query: string }) {
  const [data, setData] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      setData(null);
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: query, mode: "search" }),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error();
        setData((await res.json()) as AskResponse);
      } catch {
        if (!ctrl.signal.aborted) setData(null);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 600); // debounce
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  return (
    <section className="border-t p-3">
      <h2 className="mb-2 text-xs font-semibold text-muted-foreground">AI 검색 결과</h2>
      {loading && <p className="text-xs text-muted-foreground">검색 중…</p>}
      {!loading && data && data.people.length === 0 && <p className="text-xs text-muted-foreground">결과 없음</p>}
      <ul className="space-y-1">
        {data?.people.map((p) => {
          const person = data.names[p.id];
          if (!person) return null;
          return (
            <li key={p.id}>
              <Link href={`/person/${p.id}`} className="block rounded-md px-2 py-1.5 hover:bg-muted">
                <div className="text-sm font-medium">{person.name}</div>
                <div className="text-xs text-muted-foreground">{p.evidence}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
