"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [message, setMessage] = useState("Opening invite…");

  useEffect(() => {
    if (!token) return;

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setMessage("Please sign in first. Then open this invite link again.");
        return;
      }

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

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Join list</h1>
        <p className="mt-2 text-white/70">{message}</p>
      </div>
    </main>
  );
}
