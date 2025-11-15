"use client";

import { useState } from "react";

export default function PayTestButton() {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
      });

      if (!res.ok) {
        console.error("Checkout error", await res.text());
        alert("Eroare la pornirea plății");
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // редирект на Stripe
      } else {
        alert("Nu am primit URL de la Stripe");
      }
    } catch (e) {
      console.error(e);
      alert("Eroare neașteptată");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
    >
      {loading ? "Se redirecționează…" : "Plată de test (10€)"}
    </button>
  );
}