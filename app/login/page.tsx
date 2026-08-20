export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-[length:var(--text-heading)] font-semibold">
        Enter passphrase
      </h1>
      <form action="/api/session" method="post" className="flex flex-col gap-3 w-full max-w-xs">
        <input
          type="password"
          name="passphrase"
          autoComplete="current-password"
          className="h-[44px] rounded-md border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface-raised)] px-3 text-[length:var(--text-body)]"
          placeholder="App passphrase"
          required
        />
        <button
          type="submit"
          className="h-[44px] rounded-md bg-[color:var(--color-signal)] text-[length:var(--text-body)] font-medium"
        >
          Unlock
        </button>
      </form>
    </main>
  );
}
