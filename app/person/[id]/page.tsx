import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/contact-list";
import { getPerson, mutuals } from "@/lib/queries";

const SOURCE_LABEL: Record<string, string> = { seed: "시드", kakao_screenshot: "카톡 캡처", text: "메모", voice: "음성" };

export default async function PersonPage({ params }: PageProps<"/person/[id]">) {
  const { id } = await params;
  const p = await getPerson(id);
  if (!p) notFound();

  const common = await mutuals(id);
  const meEdges = p.neighbors.filter((n) => n.id === "me");

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="flex items-center gap-2 border-b p-3">
        <Link href="/" className="rounded-md px-2 py-1 text-sm hover:bg-muted">
          ← 목록
        </Link>
      </header>

      <section className="flex items-center gap-3 p-4">
        <Avatar name={p.name} url={p.photo_url} size="size-14" />
        <div className="min-w-0 space-y-1">
          <h1 className="text-lg font-semibold">{p.name}</h1>
          <div className="flex flex-wrap gap-1">
            {p.tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
          {p.one_liner && <p className="text-sm text-muted-foreground">{p.one_liner}</p>}
        </div>
      </section>

      <Section title="속성">
        {p.attributes.length === 0 && <Empty />}
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          {p.attributes.map((a) => (
            <div key={a.id} className="contents">
              <dt className="font-mono text-xs text-muted-foreground">{a.key}</dt>
              <dd>{a.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {p.id !== "me" && (
        <Section title="어떻게 아는 사이">
          {meEdges.length === 0 ? <Empty /> : <p className="text-sm">{meEdges.map((e) => e.label).join(", ")}</p>}
        </Section>
      )}

      {/* relationships 양방향 교집합(me ∩ 이 사람) */}
      <Section title="공통 지인">
        {common.length === 0 && <Empty />}
        <div className="flex flex-wrap gap-1.5">
          {common.map((m) => (
            <Link key={m.id} href={`/person/${m.id}`} className="rounded-full border px-3 py-1 text-xs hover:bg-muted">
              {m.name}
            </Link>
          ))}
        </div>
      </Section>

      <Section title="노트">
        {p.notes.length === 0 && <Empty />}
        <ul className="space-y-3">
          {p.notes.map((n) => (
            <li key={n.id} className="text-sm">
              <div className="text-xs text-muted-foreground">
                {SOURCE_LABEL[n.source] ?? n.source} · {new Date(n.created_at).toLocaleDateString("ko-KR")}
              </div>
              <p>{n.raw_text}</p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t px-4 py-3">
      <h2 className="mb-2 text-xs font-semibold text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

const Empty = () => <p className="text-sm text-muted-foreground">없음</p>;
