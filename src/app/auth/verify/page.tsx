"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type State = "loading" | "ok" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("error");
      setMessage("Token lipsă sau link invalid.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(
          token
        )}`);
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          setState("error");
          setMessage(data?.error ?? "Token invalid sau expirat.");
          return;
        }
        setState("ok");
        setMessage("Emailul tău a fost confirmat cu succes.");
      } catch (err) {
        console.error(err);
        setState("error");
        setMessage("Eroare de rețea. Încearcă din nou.");
      }
    })();
  }, [searchParams]);

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-3xl border border-line bg-surface/80 px-5 py-6 text-sm text-zinc-100">
        {state === "loading" && (
          <div>
            <div className="text-lg font-semibold">Verificăm link-ul...</div>
            <p className="mt-2 text-zinc-400">
              Te rugăm să aștepți câteva secunde.
            </p>
          </div>
        )}

        {state === "ok" && (
          <div>
            <div className="text-lg font-semibold text-emerald-300">
              Email confirmat ✅
            </div>
            <p className="mt-2 text-zinc-300">{message}</p>
            <button
              onClick={() =>
                router.push("/auth?mode=login&verified=1")
              }
              className="mt-4 w-full rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
            >
              Mergi la login
            </button>
          </div>
        )}

        {state === "error" && (
          <div>
            <div className="text-lg font-semibold text-red-300">
              Link invalid
            </div>
            <p className="mt-2 text-zinc-300">{message}</p>
            <button
              onClick={() => router.push("/auth?mode=signup")}
              className="mt-4 w-full rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/10"
            >
              Înapoi la autentificare
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
