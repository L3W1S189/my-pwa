export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-5 pt-safe-top pb-safe-bottom">
      {/* Header */}
      <header className="mb-6">
        <p className="text-xs text-white/60">My App</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Lewis’ iPhone App
        </h1>
      </header>

      {/* Status card */}
      <section className="rounded-3xl bg-white/5 border border-white/10 p-5 mb-6">
        <p className="text-sm text-white/60 mb-2">Status</p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg font-medium">Deployed ✅</span>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 rounded-full bg-white text-black py-3 font-medium">
            Primary
          </button>
          <button className="flex-1 rounded-full bg-white/10 text-white py-3">
            Secondary
          </button>
        </div>
      </section>

      {/* Actions */}
      <section className="rounded-3xl bg-white/5 border border-white/10 divide-y divide-white/10">
        <div className="p-5">
          <p className="font-medium">Add something</p>
          <p className="text-sm text-white/60">
            We’ll wire this up next
          </p>
        </div>

        <div className="p-5">
          <p className="font-medium">Open settings</p>
          <p className="text-sm text-white/60">
            Later: preferences + theme
          </p>
        </div>

        <div className="p-5">
          <p className="font-medium">Share</p>
          <p className="text-sm text-white/60">
            Later: iOS share sheet
          </p>
        </div>
      </section>

      <p className="text-xs text-white/40 mt-6 text-center">
        Tip: iPhone Safari → Share → Add to Home Screen
      </p>
    </main>
  );
}