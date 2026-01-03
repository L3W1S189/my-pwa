export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white safe-top safe-bottom">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-black/70 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-md px-5 py-4">
          <p className="text-xs text-white/60">My App</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Lewis’ iPhone App
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-md px-5 py-6 space-y-6">
        {/* Card */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
          <p className="text-sm text-white/70">Status</p>
          <p className="mt-1 text-lg font-medium">Deployed ✅</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="h-12 rounded-2xl bg-white text-black font-semibold active:scale-[0.99]">
              Primary
            </button>
            <button className="h-12 rounded-2xl bg-white/10 text-white font-semibold border border-white/10 active:scale-[0.99]">
              Secondary
            </button>
          </div>
        </section>

        {/* List */}
        <section className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-sm font-semibold">Quick Actions</p>
          </div>

          {[
            { title: "Add something", subtitle: "We’ll wire this up next" },
            { title: "Open settings", subtitle: "Later: preferences + theme" },
            { title: "Share", subtitle: "Later: iOS share sheet" },
          ].map((item) => (
            <div
              key={item.title}
              className="px-5 py-4 border-b last:border-b-0 border-white/10"
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-white/60">{item.subtitle}</p>
            </div>
          ))}
        </section>

        <p className="text-xs text-white/40 text-center">
          Tip: On iPhone Safari → Share → Add to Home Screen
        </p>
      </div>
    </main>
  );
}