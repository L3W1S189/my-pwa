export default function Home() {
  // iOS haptic feedback (works when opened from Home Screen)
  const haptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <main className="min-h-screen bg-black text-white safe-top safe-bottom">
      {/* Header */}
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
        {/* Status Card */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
          <p className="text-sm text-white/60 mb-3">Status</p>
          <p className="text-lg font-semibold mb-4">
            Deployed <span className="ml-1">✅</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={haptic}
              className="h-12 rounded-2xl bg-white text-black font-semibold active:scale-[0.97] transition-transform"
            >
              Primary
            </button>

            <button
              onClick={haptic}
              className="h-12 rounded-2xl bg-white/10 border border-white/10 font-semibold active:scale-[0.97] transition-transform"
            >
              Secondary
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-3xl bg-white/5 border border-white/10 divide-y divide-white/10">
          <div
            onClick={haptic}
            className="px-5 py-4 active:bg-white/10 transition"
          >
            <p className="font-medium">Add something</p>
            <p className="text-sm text-white/60">
              We’ll wire this up next
            </p>
          </div>

          <div
            onClick={haptic}
            className="px-5 py-4 active:bg-white/10 transition"
          >
            <p className="font-medium">Open settings</p>
            <p className="text-sm text-white/60">
              Later: preferences + theme
            </p>
          </div>

          <div
            onClick={haptic}
            className="px-5 py-4 active:bg-white/10 transition"
          >
            <p className="font-medium">Share</p>
            <p className="text-sm text-white/60">
              Later: iOS share sheet
            </p>
          </div>
        </div>

        <p className="text-xs text-white/40 text-center">
          Tip: On iPhone Safari → Share → Add to Home Screen
        </p>
      </div>
    </main>
  );
}