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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const [lists, setLists] = useState<ListRow[]>([]);
  const [activeListId, setActiveListId] = useState<string>("");

  const [items, setItems] = useState<ItemRow[]>([]);
  const [newItem, setNewItem] = useState("");

  const [hideCompleted, setHideCompleted] = useState(false);

  const activeList = useMemo(
    () => lists.find((l) => l.id === activeListId) ?? null,
    [lists, activeListId]
  );

  // ---------- AUTH ----------
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setAuthed(true);
        setUserEmail(data.user.email ?? null);
      } else {
        setAuthed(false);
        setUserEmail(null);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setAuthed(!!u);
      setUserEmail(u?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInWithMagicLink() {
    setMsg(null);
    const trimmed = email.trim();
    if (!trimmed) return setMsg("Type your email first.");

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    if (error) setMsg(error.message);
    else setMsg("Check your email for the sign-in link ✉️");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setLists([]);
    setItems([]);
    setActiveListId("");
    setMsg(null);
  }

  // ---------- DATA LOAD ----------
  async function loadLists() {
    setMsg(null);
    const res = await supabase
      .from("lists")
      .select("*")
      .order("created_at", { ascending: false });

    if (res.error) return setMsg(`Lists error: ${res.error.message}`);

    const data = res.data ?? [];
    setLists(data);

    if (!activeListId && data[0]) setActiveListId(data[0].id);
    if (activeListId && !data.some((l) => l.id === activeListId)) {
      setActiveListId(data[0]?.id ?? "");
    }
  }

  async function loadItems(listId: string) {
    setMsg(null);
    if (!listId) return setItems([]);

    const res = await supabase
      .from("list_items")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", { ascending: false });

    if (res.error) return setMsg(`Items error: ${res.error.message}`);
    setItems(res.data ?? []);
  }

  useEffect(() => {
    if (!authed) return;
    loadLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    loadItems(activeListId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeListId, authed]);

  // ---------- ACTIONS ----------
  async function createList() {
    setMsg(null);

    const name = prompt("List name?", "Shared List");
    if (!name) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return setMsg("Not signed in.");

    const created = await supabase
      .from("lists")
      .insert([{ name, owner_id: user.id }])
      .select("*")
      .single();

    if (created.error) return setMsg(`Create list error: ${created.error.message}`);

    // ensure owner has a membership row
    const mem = await supabase.from("list_members").insert([
      { list_id: created.data.id, user_id: user.id, role: "owner" },
    ]);
    if (mem.error) return setMsg(`Member error: ${mem.error.message}`);

    await loadLists();
    setActiveListId(created.data.id);
  }

  async function addItem() {
    setMsg(null);

    const text = newItem.trim();
    if (!text) return;
    if (!activeListId) return setMsg("Create/select a list first.");

    setNewItem("");

    const res = await supabase
      .from("list_items")
      .insert([{ list_id: activeListId, text, completed: false }]);

    if (res.error) setMsg(`Add item error: ${res.error.message}`);
    else loadItems(activeListId);
  }

  async function toggleItem(item: ItemRow) {
    setMsg(null);

    const res = await supabase
      .from("list_items")
      .update({ completed: !item.completed })
      .eq("id", item.id);

    if (res.error) setMsg(`Toggle error: ${res.error.message}`);
    else loadItems(item.list_id);
  }

  async function deleteItem(item: ItemRow) {
    setMsg(null);

    const res = await supabase.from("list_items").delete().eq("id", item.id);
    if (res.error) setMsg(`Delete error: ${res.error.message}`);
    else loadItems(item.list_id);
  }

  async function makeInviteLink() {
    setMsg(null);
    if (!activeListId) return setMsg("Select a list first.");

    const token =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const res = await supabase.from("list_invites").insert([
      { list_id: activeListId, token, expires_at: expiresAt },
    ]);

    if (res.error) return setMsg(`Invite error: ${res.error.message}`);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const link = `${baseUrl}/join/${token}`;

    try {
      await navigator.clipboard.writeText(link);
      setMsg("Invite link copied ✅ (paste/text it to your wife)");
    } catch {
      setMsg(`Copy failed. Link: ${link}`);
    }
  }

  const visibleItems = hideCompleted ? items.filter((i) => !i.completed) : items;

  // ---------- UI ----------
  if (!authed) {
    return (
      <main className="min-h-screen bg-black text-white px-5 pt-safe-top pb-safe-bottom">
        <div className="mx-auto max-w-md pt-10">
          <h1 className="text-3xl font-semibold tracking-tight">Lewis’ iPhone App</h1>
          <p className="mt-2 text-white/70">Sign in to use shared lists.</p>

          <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 p-5 space-y-3">
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
            />

            <button
              onClick={signInWithMagicLink}
              className="w-full rounded-2xl bg-white text-black py-3 font-semibold active:scale-[0.99]"
            >
              Send sign-in link
            </button>

            {msg && <p className="text-sm text-white/70">{msg}</p>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-5 pt-safe-top pb-safe-bottom">
      <div className="mx-auto max-w-md pt-6 pb-10">
        <header className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-xs text-white/60">Signed in</p>
            <h1 className="text-2xl font-semibold tracking-tight">Shared Lists</h1>
            <p className="mt-1 text-xs text-white/50">{userEmail}</p>
          </div>

          <button
            onClick={signOut}
            className="rounded-2xl bg-white/10 border border-white/10 px-3 py-2 text-sm"
          >
            Sign out
          </button>
        </header>

        {/* List controls */}
        <section className="rounded-3xl bg-white/5 border border-white/10 p-5 mb-4">
          <div className="flex gap-2">
            <button
              onClick={createList}
              className="flex-1 rounded-2xl bg-white text-black py-3 font-semibold active:scale-[0.99]"
            >
              New list
            </button>

            <button
              onClick={makeInviteLink}
              className="flex-1 rounded-2xl bg-white/10 border border-white/10 py-3 font-semibold active:scale-[0.99]"
              disabled={!activeListId}
            >
              Share
            </button>
          </div>

          <div className="mt-4">
            <label className="text-xs text-white/60">Active list</label>
            <select
              className="mt-1 w-full rounded-2xl bg-black/40 border border-white/10 px-3 py-3"
              value={activeListId}
              onChange={(e) => setActiveListId(e.target.value)}
            >
              <option value="" disabled>
                Select a list…
              </option>
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>

            {activeList && (
              <p className="mt-2 text-xs text-white/50">
                {items.filter((i) => !i.completed).length} remaining • {items.length} total
              </p>
            )}
          </div>

          {/* Hide completed toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setHideCompleted((v) => !v)}
              className="text-sm text-white/70 underline underline-offset-4"
              disabled={!activeListId}
            >
              {hideCompleted ? "Show completed" : "Hide completed"}
            </button>

            <span className="text-xs text-white/40">
              {hideCompleted ? `${visibleItems.length} showing` : "Showing all"}
            </span>
          </div>

          {msg && <p className="mt-3 text-sm text-white/70">{msg}</p>}
        </section>

        {/* Add item */}
        <section className="rounded-3xl bg-white/5 border border-white/10 p-5 mb-4">
          <div className="flex gap-3">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem();
              }}
              placeholder="Add an item…"
              className="flex-1 rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none"
              disabled={!activeListId}
            />
            <button
              onClick={addItem}
              className="rounded-2xl bg-white text-black px-5 py-3 font-semibold active:scale-[0.99]"
              disabled={!activeListId}
            >
              Add
            </button>
          </div>
        </section>

        {/* Items */}
        <section className="rounded-3xl bg-white/5 border border-white/10 p-5">
          {visibleItems.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60">
              No items yet. Add one above.
            </div>
          ) : (
            <div className="space-y-2">
              {visibleItems.map((it) => (
                <div
                  key={it.id}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 flex items-center justify-between gap-3"
                >
                  <button onClick={() => toggleItem(it)} className="flex-1 text-left">
                    <span className={it.completed ? "line-through text-white/50" : ""}>
                      {it.text}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleItem(it)}
                      className="text-sm text-white/70"
                      aria-label="toggle complete"
                      title="Toggle complete"
                    >
                      {it.completed ? "✅" : "⬜️"}
                    </button>
                    <button
                      onClick={() => deleteItem(it)}
                      className="text-sm text-white/40 hover:text-white/80"
                      aria-label="delete item"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}