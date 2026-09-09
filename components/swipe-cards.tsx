"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, type PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePerson } from "@/lib/actions";
import type { Card, ExtractResponse } from "@/lib/schemas";

const THRESHOLD = 120;

export function toCards(data: ExtractResponse): Card[] {
  return data.people.map((person) => ({
    person,
    attributes: data.attributes
      .filter((a) => a.person === person.id || a.person === person.name)
      .map(({ key, value, evidence }) => ({ key, value, evidence })),
    edges: data.edges.filter(
      (e) => e.from === person.id || e.from === person.name || e.to === person.id || e.to === person.name,
    ),
  }));
}

type Props = {
  data: ExtractResponse;
  source: "text" | "kakao_screenshot";
  onDone: () => void;
};

export function SwipeCards({ data, source, onDone }: Props) {
  const router = useRouter();
  const [queue, setQueue] = useState(() => toCards(data));
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const card = queue[0];

  useEffect(() => {
    if (queue.length === 0) {
      router.refresh();
      onDone();
    }
  }, [queue.length, onDone, router]);

  if (!card) return <p className="px-4 pb-8 text-sm text-muted-foreground">완료</p>;

  const before = card.person.id ? (data.existing[card.person.id] ?? []) : [];
  const beforeOf = (key: string) => before.find((a) => a.key === key)?.value;

  const advance = () => {
    setEditing(false);
    setQueue((q) => q.slice(1));
  };

  const onSwipe = async (dir: "left" | "right") => {
    if (busy) return;
    if (dir === "left") {
      advance();
      return;
    }
    setBusy(true);
    try {
      await savePerson(card, data.raw_text, source);
      advance();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setBusy(false);
    }
  };

  const patchPerson = (id: string | null, name: string) => {
    const cand = data.candidates.find((c) => c.id === id);
    setQueue((q) => {
      const [head, ...rest] = q;
      return [{ ...head, person: { ...head.person, id, name: cand?.name ?? name } }, ...rest];
    });
  };

  const patchAttr = (i: number, field: "key" | "value", v: string) => {
    setQueue((q) => {
      const [head, ...rest] = q;
      const attributes = head.attributes.map((a, j) => (j === i ? { ...a, [field]: v } : a));
      return [{ ...head, attributes }, ...rest];
    });
  };

  return (
    <div className="flex flex-col gap-3 px-4 pb-6">
      <div className="text-xs text-muted-foreground">
        {queue.length}장 남음 · 오른쪽 저장 · 왼쪽 버림 · 탭 수정
      </div>

      {editing ? (
        <div className="space-y-3 rounded-xl border p-3">
          <label className="block space-y-1 text-xs">
            <span className="text-muted-foreground">사람</span>
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
              value={card.person.id ?? ""}
              onChange={(e) => {
                const id = e.target.value || null;
                patchPerson(id, id ? (data.candidates.find((c) => c.id === id)?.name ?? card.person.name) : card.person.name);
              }}
            >
              <option value="">새 사람 · {card.person.name}</option>
              {data.candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {!card.person.id && (
            <Input value={card.person.name} onChange={(e) => patchPerson(null, e.target.value)} placeholder="이름" />
          )}
          <ul className="space-y-2">
            {card.attributes.map((a, i) => (
              <li key={i} className="grid grid-cols-[1fr_1fr] gap-1">
                <Input value={a.key} onChange={(e) => patchAttr(i, "key", e.target.value)} />
                <Input value={a.value} onChange={(e) => patchAttr(i, "value", e.target.value)} />
              </li>
            ))}
          </ul>
          <Button type="button" variant="outline" className="w-full" onClick={() => setEditing(false)}>
            확인
          </Button>
        </div>
      ) : (
        <SwipeCard
          key={`${card.person.id ?? card.person.name}-${queue.length}`}
          disabled={busy}
          onTap={() => setEditing(true)}
          onSwipe={onSwipe}
        >
          <h3 className="text-lg font-medium">{card.person.name}</h3>
          {card.person.one_liner && <p className="mt-0.5 text-sm text-muted-foreground">{card.person.one_liner}</p>}
          {card.person.tags.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">{card.person.tags.join(" · ")}</p>
          )}
          <ul className="mt-3 space-y-1.5">
            {card.attributes.map((a, i) => {
              const prev = beforeOf(a.key);
              return (
                <li key={i} className="text-sm">
                  <span className="font-medium">{a.key}</span>
                  <span className="text-muted-foreground"> · </span>
                  {prev != null && prev !== a.value ? (
                    <span>
                      <span className="text-muted-foreground line-through">{prev}</span>
                      <span> → {a.value}</span>
                    </span>
                  ) : (
                    <span>{a.value}</span>
                  )}
                </li>
              );
            })}
          </ul>
          {card.edges.length > 0 && (
            <ul className="mt-3 space-y-1 border-t pt-2 text-xs text-muted-foreground">
              {card.edges.map((e, i) => (
                <li key={i}>
                  {e.from} → {e.to} ({e.label})
                </li>
              ))}
            </ul>
          )}
        </SwipeCard>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" disabled={busy} onClick={() => onSwipe("left")}>
          버림
        </Button>
        <Button type="button" className="flex-1" disabled={busy} onClick={() => onSwipe("right")}>
          저장
        </Button>
      </div>
    </div>
  );
}

function SwipeCard({
  children,
  disabled,
  onTap,
  onSwipe,
}: {
  children: ReactNode;
  disabled?: boolean;
  onTap: () => void;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const saveOpacity = useTransform(x, [40, THRESHOLD], [0, 1]);
  const tossOpacity = useTransform(x, [-THRESHOLD, -40], [1, 0]);

  const end = (_: unknown, info: PanInfo) => {
    if (disabled) return;
    if (info.offset.x > THRESHOLD) onSwipe("right");
    else if (info.offset.x < -THRESHOLD) onSwipe("left");
  };

  return (
    <motion.div
      style={{ x, rotate }}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={end}
      onTap={() => !disabled && onTap()}
      className="relative touch-pan-y rounded-xl border bg-background p-4 shadow-sm select-none"
    >
      <motion.span
        style={{ opacity: saveOpacity }}
        className="pointer-events-none absolute top-3 right-3 rounded border border-green-600 px-2 py-0.5 text-xs font-medium text-green-700"
      >
        저장
      </motion.span>
      <motion.span
        style={{ opacity: tossOpacity }}
        className="pointer-events-none absolute top-3 left-3 rounded border border-red-500 px-2 py-0.5 text-xs font-medium text-red-600"
      >
        버림
      </motion.span>
      {children}
    </motion.div>
  );
}
