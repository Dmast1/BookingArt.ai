// app/api/onboarding/provider/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/** Тип анкеты */
type PersonaType = "PF" | "COMPANY";

/** Утилита выбора полей из объекта */
function pick<T extends Record<string, any>>(obj: T, keys: (keyof T)[]) {
  const out: Record<string, any> = {};
  for (const k of keys) out[k as string] = obj[k];
  return out;
}

/** Простая slugify (латиница, цифры, дефисы). Если пусто — вернём null */
function slugify(input: string): string | null {
  if (!input) return null;
  const s = input
    .toLowerCase()
    // диакритики → базовые символы
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // небезопасные символы → дефисы
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return s || null;
}

/** Нормализация страны (ярлык → ISO) */
function normalizeCountry(label?: string | null): string {
  const map: Record<string, string> = {
    "România": "RO",
    "Romania": "RO",
    "Franța": "FR",
    "Franta": "FR",
    "Moldova": "MD",
    "Bulgaria": "BG",
    "UAE": "AE",
    "Emiratele Arabe Unite": "AE",
  };
  if (!label) return "RO";
  return map[label] || "RO";
}

/** Нормализация категорий к ключам (без диакритик). */
function toCategoryKey(label: string): string {
  const raw = String(label || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // соответствия «лейбл → ключ»
  const table: Record<string, string> = {
    "dj": "dj",
    "foto": "foto",
    "fotograf": "foto",
    "video": "video",
    "videograf": "video",
    "live": "live",
    "mc": "mc",
    "mc/moderator": "mc",
    "moderator": "mc",
    "decor": "decor",
    "lumini": "lumini",
    "lumini/sunet": "lumini",
    "sali": "sali",
    "sala": "sali",
    "sală": "sali",
    "activitati": "activitati",
    "activitati/entertainment": "activitati",
    "activitatĭ": "activitati", // на всякий случай
    "activitatĭi": "activitati",
    "activitatĭle": "activitati",
    "activitati-le": "activitati",
    "activitatile": "activitati",
    "activitati̦": "activitati",
    "activitati̦i": "activitati",
    "activitati̦le": "activitati",
    "activitati (entertainment)": "activitati",
    "activitati (activities)": "activitati",
  };

  // прямой хит
  if (table[raw]) return table[raw];

  // fallback: уберём пробелы/слеши/точки
  const compact = raw.replace(/[.\s/]+/g, "");
  if (table[compact]) return table[compact];

  // если пользователь ввёл что-то «своё» — вернём нормализованную строку
  return compact || raw || "other";
}

/** Собрать уникальный массив категорий из FormData */
function collectCategoriesFromForm(form: FormData): string[] {
  const arr: string[] = [];
  // новый вариант: categories[]
  form.getAll("categories[]").forEach((v) => {
    if (typeof v === "string") arr.push(v);
  });
  // обратная совместимость: category
  const single = form.get("category");
  if (single && typeof single === "string") arr.push(single);

  // нормализуем, уникализируем и сортируем по алфавиту (чтобы стабильно писать в БД)
  const normalized = Array.from(
    new Set(arr.map((x) => toCategoryKey(x)).filter(Boolean))
  );
  return normalized.sort();
}

/** Собрать категории из JSON (если кто-то ещё стучится старым клиентом) */
function collectCategoriesFromJson(json: any): string[] {
  const out: string[] = [];
  if (Array.isArray(json?.categories)) {
    out.push(...json.categories);
  } else if (typeof json?.category === "string") {
    out.push(json.category);
  }
  const normalized = Array.from(
    new Set(out.map((x) => toCategoryKey(x)).filter(Boolean))
  );
  return normalized.sort();
}

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json(
        { ok: false, error: "Neautentificat" },
        { status: 401 }
      );
    }

    const ct = req.headers.get("content-type") || "";

    // ========= A) multipart/form-data =========
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();

      const type = String(form.get("type") || "PF") as PersonaType;

      // собираем категории (в т.ч. „Activități”)
      const categories = collectCategoriesFromForm(form);

      // --- payload из формы (PF / COMPANY) ---
      let payload: any = {};
      let files: { idDoc?: { name: string; bytes: Buffer } } = {};

      if (type === "PF") {
        payload = {
          type,
          pfFirstName: String(form.get("pfFirstName") || ""),
          pfLastName: String(form.get("pfLastName") || ""),
          pfStageName: String(form.get("pfStageName") || ""),
          city: String(form.get("pfCity") || ""),
          countryLabel: String(form.get("pfCountry") || "România"),
          email: String(form.get("pfEmail") || ""),
          displayName: String(form.get("pfStageName") || ""),
        };

        const doc = form.get("pfIdDoc") as File | null;
        if (doc) {
          const ab = await doc.arrayBuffer();
          files.idDoc = { name: doc.name, bytes: Buffer.from(ab) };
        }
      } else {
        payload = {
          type,
          coName: String(form.get("coName") || ""),
          coCUI: String(form.get("coCUI") || ""),
          coRegNo: String(form.get("coRegNo") || ""),
          city: String(form.get("coCity") || ""),
          countryLabel: String(form.get("coCountry") || "România"),
          email: String(form.get("coEmail") || ""),
          coContact: String(form.get("coContact") || ""),
          coPhone: String(form.get("coPhone") || ""),
          displayName: String(form.get("coName") || ""),
        };

        const doc = form.get("coDoc") as File | null;
        if (doc) {
          const ab = await doc.arrayBuffer();
          files.idDoc = { name: doc.name, bytes: Buffer.from(ab) };
        }
      }

      const country = normalizeCountry(payload.countryLabel);

      if (!payload.displayName) {
        return NextResponse.json(
          { ok: false, error: "Numele afișat este obligatoriu." },
          { status: 400 }
        );
      }

      // TODO: загрузка файла в S3/R2 (сейчас не сохраняем, только имя)
      const idDocUrl = null;

      // генерируем slug только при создании (если у провайдера его ещё нет)
      const desiredSlug = slugify(payload.displayName);

      await prisma.$transaction(async (tx) => {
        // 1) апдейт пользователя
        await tx.user.update({
          where: { id: me.id },
          data: {
            role: "PROVIDER",
            name: payload.displayName,
            city: payload.city?.trim() || me.city,
            email: payload.email || me.email || undefined,
          },
        });

        // 2) upsert провайдера
        const upserted = await tx.provider.upsert({
          where: { userId: me.id },
          create: {
            userId: me.id,
            displayName: payload.displayName,
            city: payload.city?.trim() || null,
            country,
            categories,
            verified: false,
            meta: {
              type: payload.type,
              ...pick(payload, [
                "pfFirstName",
                "pfLastName",
                "pfStageName",
                "coName",
                "coCUI",
                "coRegNo",
                "coContact",
                "coPhone",
                "email",
                "countryLabel",
              ]),
              idDocUrl,
              idDocName: files.idDoc?.name ?? null,
            },
          },
          update: {
            displayName: payload.displayName,
            city: payload.city?.trim() || null,
            country,
            categories,
            meta: {
              type: payload.type,
              ...pick(payload, [
                "pfFirstName",
                "pfLastName",
                "pfStageName",
                "coName",
                "coCUI",
                "coRegNo",
                "coContact",
                "coPhone",
                "email",
                "countryLabel",
              ]),
              idDocUrl,
              idDocName: files.idDoc?.name ?? null,
            },
          },
          select: { id: true, slug: true },
        });

        // 3) если slug пустой — зададим уникальный
        if (!upserted.slug) {
          let finalSlug =
            desiredSlug ||
            `provider-${me.id.slice(0, 8)}`; // абсолютно fallback, если имя пустое

          // проверим уникальность, при необходимости добавим суффикс
          if (finalSlug) {
            let base = finalSlug;
            let i = 1;
            // eslint-disable-next-line no-constant-condition
            while (
              await tx.provider.findUnique({
                where: { slug: finalSlug },
                select: { id: true },
              })
            ) {
              i += 1;
              finalSlug = `${base}-${i}`;
            }
          }

          if (finalSlug) {
            await tx.provider.update({
              where: { id: upserted.id },
              data: { slug: finalSlug },
            });
          }
        }
      });

      return NextResponse.json({ ok: true });
    }

    // ========= B) JSON (старый формат клиентов) =========
    const json = await req.json().catch(() => ({}));

    const displayName: string | undefined = json?.displayName;
    const city: string | undefined = json?.city;
    const categories = collectCategoriesFromJson(json); // поддерживает category и categories[]

    if (!displayName) {
      return NextResponse.json(
        { ok: false, error: "Numele afișat este obligatoriu." },
        { status: 400 }
      );
    }

    const desiredSlug = slugify(displayName);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: me.id },
        data: {
          role: "PROVIDER",
          name: displayName,
          city: city?.trim() || me.city,
        },
      });

      const upserted = await tx.provider.upsert({
        where: { userId: me.id },
        create: {
          userId: me.id,
          displayName,
          city: city?.trim() || null,
          country: "RO",
          categories,
          verified: false,
          meta: { type: "PF" }, // дефолт
        },
        update: {
          displayName,
          city: city?.trim() || null,
          categories,
        },
        select: { id: true, slug: true },
      });

      if (!upserted.slug) {
        let finalSlug = desiredSlug || `provider-${me.id.slice(0, 8)}`;
        if (finalSlug) {
          let base = finalSlug;
          let i = 1;
          // eslint-disable-next-line no-constant-condition
          while (
            await tx.provider.findUnique({
              where: { slug: finalSlug },
              select: { id: true },
            })
          ) {
            i += 1;
            finalSlug = `${base}-${i}`;
          }
        }
        if (finalSlug) {
          await tx.provider.update({
            where: { id: upserted.id },
            data: { slug: finalSlug },
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[onboarding/provider]", e);
    return NextResponse.json(
      { ok: false, error: "Eroare de server" },
      { status: 500 }
    );
  }
}
