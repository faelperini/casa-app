"use client";
import { useState } from "react";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { ShoppingCart, Plus, Trash2, Check, Maximize2 } from "lucide-react";

type Item = { id: string; name: string; quantity: string | null; checked: boolean };
type Props = {
  groupId: string;
  items: Item[];
  onItemsChange: (items: Item[]) => void;
  onExpand?: () => void;
  expanded?: boolean;
};

export function ShoppingCard({ groupId, items, onItemsChange, onExpand, expanded }: Props) {
  const isDesktop = useIsDesktop();
  const [newName, setNewName]         = useState("");
  const [newQty, setNewQty]           = useState("");
  const [adding, setAdding]           = useState(false);
  const [showForm, setShowForm]       = useState(false);

  const unchecked = items.filter((i) => !i.checked);
  const checked   = items.filter((i) => i.checked);

  async function addItem() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/shopping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), quantity: newQty.trim() || null }),
      });
      if (res.ok) {
        const item = await res.json();
        onItemsChange([...items, item]);
        setNewName(""); setNewQty(""); setShowForm(false);
      }
    } finally { setAdding(false); }
  }

  async function toggleItem(item: Item) {
    const res = await fetch(`/api/groups/${groupId}/shopping`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, checked: !item.checked }),
    });
    if (res.ok) {
      onItemsChange(items.map((i) => i.id === item.id ? { ...i, checked: !i.checked } : i));
    }
  }

  async function deleteItem(itemId: string) {
    const res = await fetch(`/api/groups/${groupId}/shopping`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (res.ok) onItemsChange(items.filter((i) => i.id !== itemId));
  }

  return (
    <div className="card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-terra-400/15 flex items-center justify-center">
            <ShoppingCart size={15} className="text-terra-500" />
          </div>
          <h2 className="font-display font-bold text-forest-800">Lista de Compras</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {onExpand && (
            <button onClick={onExpand}
              className="w-7 h-7 rounded-lg bg-cream-100 border border-cream-200 flex items-center justify-center
                         hover:bg-cream-200 transition-colors cursor-pointer">
              <Maximize2 size={13} className="text-forest-700" />
            </button>
          )}
          <button onClick={() => setShowForm((v) => !v)}
            className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center
                       hover:bg-forest-700 transition-colors cursor-pointer">
            <Plus size={14} className="text-cream-50" />
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="flex gap-2 mb-4 animate-fade-up">
          <input className="input flex-1 text-sm py-2" placeholder="Item..."
            value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()} autoFocus={isDesktop} />
          <input className="input w-20 text-sm py-2" placeholder="Qtd"
            value={newQty} onChange={(e) => setNewQty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()} />
          <button onClick={addItem} disabled={adding || !newName.trim()} className="btn-primary py-2 px-3 text-xs">
            {adding ? "…" : "Add"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <p className="font-body text-xs text-stone-warm text-center py-6">
          Nenhum item na lista. Adicione o primeiro!
        </p>
      )}

      {/* Unchecked items */}
      <div className={`flex-1 space-y-1.5 overflow-y-auto ${expanded ? "" : "max-h-64"}`}>
        {unchecked.map((item) => (
          <ItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
        ))}

        {/* Checked section */}
        {checked.length > 0 && (
          <>
            <div className="pt-2 pb-1">
              <span className="text-xs font-semibold text-stone-warm uppercase tracking-wider font-body">
                Comprados ({checked.length})
              </span>
            </div>
            {checked.map((item) => (
              <ItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
            ))}
          </>
        )}
      </div>

      {/* Footer counter */}
      <div className="pt-3 mt-3 border-t border-cream-200 flex items-center justify-between">
        <span className="font-body text-xs text-stone-warm">
          {unchecked.length} {unchecked.length === 1 ? "item" : "itens"} restante{unchecked.length !== 1 ? "s" : ""}
        </span>
        {checked.length > 0 && (
          <span className="font-body text-xs text-terra-400">
            {checked.length} comprado{checked.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, onToggle, onDelete }: {
  item: Item;
  onToggle: (item: Item) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`flex items-center gap-2.5 group rounded-xl px-2 py-1.5
                     hover:bg-cream-100 transition-colors
                     ${item.checked ? "opacity-50" : ""}`}>
      <button onClick={() => onToggle(item)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 cursor-pointer
                    transition-colors ${item.checked
                      ? "bg-forest-800 border-forest-800"
                      : "border-cream-300 hover:border-forest-700"}`}>
        {item.checked && <Check size={11} className="text-cream-50" />}
      </button>
      <span className={`font-body text-sm flex-1 min-w-0 truncate
                        ${item.checked ? "line-through text-stone-warm" : "text-forest-800"}`}>
        {item.name}
      </span>
      {item.quantity && (
        <span className="font-body text-xs text-stone-warm flex-shrink-0">{item.quantity}</span>
      )}
      <button onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-cream-200
                   flex items-center justify-center transition-all cursor-pointer flex-shrink-0">
        <Trash2 size={12} className="text-terra-400" />
      </button>
    </div>
  );
}
