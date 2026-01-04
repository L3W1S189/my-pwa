"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Item = {
  id: string;
  text: string;
  completed: boolean;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);

  // Load items
  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const { data, error } = await supabase
      .from("list_items")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setItems(data);
    }
  }

  async function addItem() {
    if (!newItem.trim()) return;

    const { error } = await supabase.from("list_items").insert({
      text: newItem,
      completed: false,
    });

    if (!error) {
      setNewItem("");
      loadItems();
    }
  }

  async function toggleItem(item: Item) {
    const { error } = await supabase
      .from("list_items")
      .update({ completed: !item.completed })
      .eq("id", item.id);

    if (!error) loadItems();
  }

  async function clearCompleted() {
    await supabase.from("list_items").delete().eq("completed", true);
    loadItems();
  }

  const visibleItems = hideCompleted
    ? items.filter((i) => !i.completed)
    : items;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Lewis’ iPhone App</h1>

      {/* Add item */}
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 rounded-xl bg-white/10 px-4 py-3 outline-none"
          placeholder="Add an item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <button
          onClick={addItem}
          className="rounded-xl bg-white text-black px-6 font-semibold"
        >
          Add
        </button>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-4 text-sm text-white/70">
        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          className="underline"
        >
          {hideCompleted ? "Show completed" : "Hide completed"}
        </button>

        <button onClick={clearCompleted} className="underline">
          Clear completed
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {visibleItems.length === 0 && (
          <p className="text-white/40">Nothing here yet.</p>
        )}

        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3"
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItem(item)}
              className="h-5 w-5"
            />

            <span
              className={`flex-1 ${
                item.completed
                  ? "line-through text-white/40"
                  : "text-white"
              }`}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}