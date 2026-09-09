"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AddSheet } from "@/components/add-sheet";
import { AiSearchResults } from "@/components/ai-search-results";
import { AskSheet } from "@/components/ask-sheet";
import type { PersonRow } from "@/lib/queries";

const TAGS = ["연끌", "매연", "셰플러", "트레인톤"];

export function ContactList({ people }: { people: PersonRow[] }) {
  const [tag, setTag] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const shown = people.filter((p) => (!tag || p.tags.includes(tag)) && p.name.toLowerCase().includes(query));

  return (
    <div className="flex h-full flex-col">
      <header className="space-y-2 border-b p-3">
        <div className="flex gap-1.5 overflow-x-auto">
          {[null, ...TAGS].map((t) => (
            <button
              key={t ?? "all"}
              onClick={() => setTag(t)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs ${tag === t ? "bg-primary text-primary-foreground" : "bg-background"}`}
            >
              {t ?? "전체"}
            </button>
          ))}
        </div>
        <Input placeholder="이름 또는 「매운거 잘 먹음」" value={q} onChange={(e) => setQ(e.target.value)} />
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        <ul className="divide-y">
          {shown.map((p) => (
            <li key={p.id}>
              <Link href={`/person/${p.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted">
                <Avatar name={p.name} url={p.photo_url} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  {p.one_liner && <div className="truncate text-xs text-muted-foreground">{p.one_liner}</div>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {query && <AiSearchResults query={q.trim()} />}
      </div>

      <div className="absolute right-4 bottom-5 flex flex-col gap-2">
        <AskSheet />
        <AddSheet />
      </div>
    </div>
  );
}

export function Avatar({ name, url, size = "size-10" }: { name: string; url: string | null; size?: string }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium`}>{name[0]}</div>
  );
}
