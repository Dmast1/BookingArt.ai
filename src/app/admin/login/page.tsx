export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form method="POST" action="/api/admin/login" className="w-full max-w-sm grid gap-3 border rounded-xl p-4">
        <h1 className="text-xl font-semibold">Admin login</h1>
        <input
          name="token"
          type="password"
          placeholder="Admin token"
          className="rounded-lg border px-3 py-2"
          required
        />
        <button className="rounded-lg bg-black text-white px-4 py-2">Войти</button>
      </form>
    </main>
  );
}
