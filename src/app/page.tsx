"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const token = useMemo(() => String(params?.token ?? ""), [params]);

  const [message, setMessage] = useState("Checking invite…");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  // 1) If NOT signed in, show email box and let her sign in.
  // 2) If signed in, accept invite automatically.
  useEffect(() => {
    if (!token) return;

    (async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setMessage("Sign in to join this shared list.");
        return;
      }

      setMessage("Joining…");

      const { error } = await supabase.rpc("accept_invite", { p_token: token });
      if (error) {
        setMessage(`Invite failed: ${error.message}`);
        return;
      }

      setMessage("Joined ✅ Redirecting…");
      router.replace("/");
      router.refresh();
    })();
  }, [token, router]);

  async function sendMagicLink() {
    const trimmed = email.trim();
    if (!trimmed) {
      setMessage("Type your email first.");
      return;
    }

    try {
      setSending(true);
      setMessage("Sending sign-in email…");

      const origin = window.location.origin;
      const redirectTo = `${origin}/join/${token}`; // IMPORTANT: comes back to this invite link

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) {
        setMessage(`Sign-in error: ${error.message}`);
        return;
      }

      setMessage("Check your email and tap the sign-in link ✉️");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Join list</h1>
        <p className="mt-2 text-white/70">{message}</p>

        {/* Only show sign-in form when not logged in */}
        {message.includes("Sign in") || message.includes("Type your email") || message.includes("Check your email") ? (
          <div className="mt-5 space-y-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <button
              onClick={sendMagicLink}
              disabled={sending}
              className="w-full rounded-2xl bg-white text-black py-3 font-semibold disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send sign-in link"}
            </button>

            <p className="text-xs text-white/40">
              After she taps the email link, it will return here and auto-join.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}