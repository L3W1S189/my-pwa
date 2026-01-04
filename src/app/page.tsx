"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ListRow = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

type ItemRow = {
  id: string;
  list_id: string;
  text: string;
  completed: boolean;
  created_at: string;
};

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const [lists, setLists] = useState<ListRow[]>([]);
  const [activeListId, setActiveListId] = useState("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [newItem, setNewItem] = useState("");

  const activeList = useMemo(
    () => lists.find((l) => l.id === activeListId) ?? null,
    [lists, activeListId]
  );

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setAuthed(true);
        setUserEmail(data.user.email ?? null);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user);
      setUserEmail(session?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn() {
    setMsg(null);
    if (!email.trim()) return setMsg("Enter your email");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    if (error) setMsg(error.message);
    else setMsg("Check your email ✉️");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setAuthed(false);
    setLists([]);
    setItems([]);
    setActiveListId("");
  }

  /* ---------------- DATA ---------------- */

  async function loadLists() {
    const res = await supabase
      .from("lists")
      .select("*")
      .order("created_at", { ascending: false });

    if (res.error) return setMsg(res.error.message);
    setLists(res.data ?? []);
    if (!activeListId && res.data?.[0]) setActiveListId(res.data[0].id);
  }

  async function loadItems(listId: string) {
    if (!listId) return;
    const res = await supabase
      .from("list_items")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", { ascending: false });

    if (res.error) return setMsg(res.error.message);
    setItems(res.data ?? []);
  }

  useEffect(() => {
    if (authed) loadLists();
  }, [authed]);

  useEffect(() => {
    if (authed && activeListId) loadItems(activeListId);
  }, [activeListId, authed]);

  /* ---------------- ACTIONS ---------------- */

  async function createList() {
    const name = prompt("List name?");
    if (!name) return;

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;

    const res = await supabase
      .from("lists")
      .insert([{ name, owner_id: u.user.id }])
      .select()
      .single();

    if (res.error) return setMsg(res.error.message);

    await supabase.from("list_members").insert([
      { list_id: res.data.id, user_id: u.user.id, role: "owner" },
    ]);

    loadLists();
    setActiveListId(res.data.id);
  }

  async function addItem() {
    if (!newItem.trim() || !activeListId) return;
    await supabase
      .from("list_items")
      .insert([{ list_id: activeListId, text: newItem }]);
    setNewItem("");
    loadItems(activeListId);
  }

  async function toggleItem(item: ItemRow) {
    await supabase
      .from("list_items")
      .update({ completed: !item.completed })
      .eq("id", item.id);
    loadItems(item.list_id);
  }

  async function deleteItem(item: ItemRow) {
    await supabase.from("list_items").delete().eq("id", item.id);
    loadItems(item.list_id);
  }

  /* ---------------- SHARE (FIXED) ---------------- */

  async function shareList() {
    if (!activeListId) return;

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 864e5).toISOString();

    const res = await supabase.from("list_invites").insert([
      { list_id: activeListId, token, expires_at: expires },
    ]);

    if (res.error) return setMsg(res.error.message);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const inviteUrl = `${baseUrl}/join/${token}`;

    await navigator.clipboard.writeText(inviteUrl);
    setMsg("Invite link copied ✅ (paste/text it to your wife)");
  }

  /* ---------------- UI ---------------- */

  if (!authed) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-semibold">Shared Lists</h1>

        <input
          className="mt-4 w-full rounded-xl p-3 bg-black border border-white/20"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="mt-3 w-full rounded-xl bg-white text-black p-3"
          onClick={signIn}
        >
          Sign in
        </button>

        {msg && <p className="mt-3 text-white/70">{msg}</p>}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Lists</h1>
          <p className="text-xs text-white/60">{userEmail}</p>
        </div>
        <button onClick={signOut}>Sign out</button>
      </header>

      <div className="mt-4 space-y-3">
        <button onClick={createList} className="w-full bg-white text-black p-3 rounded-xl">
          New list
        </button>

        <button onClick={shareList} className="w-full bg-white/10 p-3 rounded-xl">
          Share
        </button>

        <select
          className="w-full bg-black border border-white/20 p-3 rounded-xl"
          value={activeListId}
          onChange={(e) => setActiveListId(e.target.value)}
        >
          <option value="">Select list</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <input
          className="w-full p-3 rounded-xl bg-black border border-white/20"
          placeholder="Add item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />

        {items.map((it) => (
          <div key={it.id} className="flex justify-between p-3 border border-white/10 rounded-xl">
            <span
              className={it.completed ? "line-through text-white/50" : ""}
              onClick={() => toggleItem(it)}
            >
              {it.text}
            </span>
            <button onClick={() => deleteItem(it)}>✕</button>
          </div>
        ))}

        {msg && <p className="text-white/70">{msg}</p>}
      </div>
    </main>
  );
}