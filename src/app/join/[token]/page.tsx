"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function JoinTokenPage() {
  const router = useRouter();
  const params = useParams<{ token?: string | string[] }>();
  const token = useMemo(() => {
    const t = params?.token;
    return Array.isArray(t) ? t[0] : t;
  }, [params]);

  const [message, setMessage] = useState("Checking invite…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (!token) {
          setMessage("Missing invite token.");
          return;
        }

        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          setMessage(`Auth error: ${sessionErr.message}`);
          return;
        }

        if (!sessionData.session) {
          setMessage("Please sign in first, then open this invite link again.");
          return;
        }

        const { error } = await supabase.rpc("accept_invite", { p_token: token });

        if (cancelled) return;

        if (error) {
          setMessage(`Invite failed: ${error.message}`);
          return;
        }

        setMessage("Joined ✅ Redirecting…");
        setTimeout(() => {
          router.replace("/");
          router.refresh();
        }, 600);
      } catch (e: any) {
        setMessage(`Unexpected error: ${e?.message ?? String(e)}`);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Join list</h1>
        <p className="mt-2 text-white/70">{message}</p>

        {message.toLowerCase().includes("sign in first") && token ? (
          <button
            className="mt-4 w-full rounded-2xl bg-white text-black px-4 py-3 font-semibold"
            onClick={() => router.replace("/")}
          >
            Go to app to sign in
          </button>
        ) : null}
      </div>
    </main>
  );
}
