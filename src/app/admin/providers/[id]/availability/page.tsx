import { prisma } from "@/lib/db";
import Link from "next/link";

async function getData(providerId: string) {
  const [provider, slots] = await Promise.all([
    prisma.provider.findUnique({
      where: { id: providerId },
      select: { id: true, displayName: true },
    }),
    prisma.availability.findMany({
      where: { providerId },
      orderBy: { date: "asc" },
      take: 120,
      select: { id: true, date: true, status: true, note: true },
    }),
  ]);
  return { provider, slots };
}

export default async function AdminAvailabilityPage({
  params,
}: { params: { id: string } }) {
  const { provider, slots } = await getData(params.id);
  if (!provider) {
    return <main className="p-6">Провайдер не найден</main>;
  }

  return (
    <main className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            Доступность — {provider.displayName}
          </h1>
          <Link href="/admin/providers" className="text-sm text-blue-600">
            ← к списку провайдеров
          </Link>
        </div>
        <form action="/api/admin/availability" method="POST" className="flex gap-2">
          <input type="hidden" name="providerId" value={provider.id} />
          <input
            name="date"
            type="date"
            required
            className="rounded-lg border px-3 py-2"
          />
          <select name="status" className="rounded-lg border px-3 py-2">
            <option value="free">free</option>
            <option value="partial">partial</option>
            <option value="busy">busy</option>
          </select>
          <input
            name="note"
            placeholder="Примечание (необязательно)"
            className="rounded-lg border px-3 py-2 w-64"
          />
          <button className="rounded-lg bg-black text-white px-4 py-2">
            Добавить/обновить
          </button>
        </form>
      </header>

      <section className="grid gap-2">
        {slots.length === 0 && (
          <div className="text-gray-600">Пока нет записей.</div>
        )}
        {slots.map((s) => (
          <form
            key={s.id}
            action={`/api/admin/availability/${s.id}`}
            method="POST"
            className="flex items-center gap-3 border rounded-xl p-3"
          >
            <div className="w-40">{new Date(s.date).toLocaleDateString()}</div>
            <select
              name="status"
              defaultValue={s.status}
              className="rounded-lg border px-2 py-1"
            >
              <option value="free">free</option>
              <option value="partial">partial</option>
              <option value="busy">busy</option>
            </select>
            <input
              name="note"
              defaultValue={s.note ?? ""}
              placeholder="примечание"
              className="rounded-lg border px-3 py-1 flex-1"
            />
            <button className="rounded-lg bg-black text-white px-3 py-1">
              Сохранить
            </button>
            <button
              name="_method"
              value="DELETE"
              className="rounded-lg border px-3 py-1"
            >
              Удалить
            </button>
          </form>
        ))}
      </section>
    </main>
  );
}
