"use client";
import { useState } from "react";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import Image from "next/image";
import { Wallet, Plus, Check, User, CheckSquare, Square, Maximize2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

type Member = {
  id: string; role: string;
  user: { id: string; name: string | null; image: string | null; email: string | null };
};
type Debt = { id: string; description: string; amount: number; fromUserId: string; toUserId: string; status: string };

type Props = {
  groupId: string;
  debts: Debt[];
  members: Member[];
  currentUserId: string;
  onDebtsChange: (debts: Debt[]) => void;
  onExpand?: () => void;
  expanded?: boolean;
};

export function DebtsCard({ groupId, debts, members, currentUserId, onDebtsChange, onExpand, expanded }: Props) {
  const isDesktop = useIsDesktop();
  const [showAdd, setShowAdd]         = useState(false);
  const [desc, setDesc]               = useState("");
  const [amount, setAmount]           = useState("");
  const [selfIncluded, setSelfIncluded] = useState(true);
  const [selectedDebtors, setSelectedDebtors] = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);

  const others = members.filter((m) => m.user.id !== currentUserId);
  const currentMember = members.find((m) => m.user.id === currentUserId);

  const parsedAmount   = parseFloat(amount) || 0;
  const totalPeople    = selectedDebtors.length + (selfIncluded ? 1 : 0);
  const sharePerPerson = totalPeople > 1 ? parsedAmount / totalPeople : parsedAmount;

  function toggleDebtor(id: string) {
    setSelectedDebtors((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function handleClose() {
    setShowAdd(false);
    setDesc(""); setAmount(""); setSelfIncluded(true); setSelectedDebtors([]);
  }

  async function addDebt() {
    if (!desc.trim() || !amount || selectedDebtors.length === 0) return;
    setLoading(true);
    try {
      const newDebts: Debt[] = [];
      for (const debtorId of selectedDebtors) {
        const res = await fetch(`/api/groups/${groupId}/debts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: desc, amount: sharePerPerson, toUserId: debtorId }),
        });
        if (res.ok) newDebts.push(await res.json());
      }
      if (newDebts.length > 0) {
        onDebtsChange([...newDebts, ...debts]);
        handleClose();
      }
    } finally { setLoading(false); }
  }

  function memberName(id: string) {
    return members.find((m) => m.user.id === id)?.user.name ?? "Alguém";
  }
  function memberImage(id: string) {
    return members.find((m) => m.user.id === id)?.user.image ?? null;
  }

  async function settleDebt(debtId: string) {
    const res = await fetch(`/api/groups/${groupId}/debts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ debtId }),
    });
    if (res.ok) onDebtsChange(debts.filter((d) => d.id !== debtId));
  }

  const canSubmit = !loading && !!desc.trim() && !!amount && parsedAmount > 0 && selectedDebtors.length > 0;

  return (
    <div className="card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-forest-700/10 flex items-center justify-center">
            <Wallet size={15} className="text-forest-700" />
          </div>
          <h2 className="font-display font-bold text-forest-800">Débitos</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {onExpand && (
            <button onClick={onExpand}
              className="w-7 h-7 rounded-lg bg-cream-100 border border-cream-200 flex items-center justify-center
                         hover:bg-cream-200 transition-colors cursor-pointer">
              <Maximize2 size={13} className="text-forest-700" />
            </button>
          )}
          <button onClick={() => setShowAdd(true)}
            className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center
                       hover:bg-forest-700 transition-colors cursor-pointer">
            <Plus size={14} className="text-cream-50" />
          </button>
        </div>
      </div>

      {/* Empty */}
      {debts.filter((d) => d.fromUserId === currentUserId || d.toUserId === currentUserId).length === 0 && (
        <p className="font-body text-xs text-stone-warm text-center py-6">
          Tudo certo! Nenhum débito pendente.
        </p>
      )}

      {/* List */}
      <div className={`flex-1 space-y-2 overflow-y-auto ${expanded ? "" : "max-h-64"}`}>
        {debts.filter((d) => d.fromUserId === currentUserId || d.toUserId === currentUserId).map((debt) => {
          const iOwe   = debt.toUserId === currentUserId;
          const theyOweMe = debt.fromUserId === currentUserId;
          const avatarImg = iOwe
            ? memberImage(debt.fromUserId)
            : memberImage(debt.toUserId);
          const label = iOwe
            ? <>Você deve <span className="font-semibold text-forest-800">R${debt.amount.toFixed(2)}</span> a <span className="font-semibold text-forest-800">{memberName(debt.fromUserId)}</span></>
            : theyOweMe
            ? <><span className="font-semibold text-forest-800">{memberName(debt.toUserId)}</span> deve <span className="font-semibold text-forest-800">R${debt.amount.toFixed(2)}</span> a você</>
            : <><span className="font-semibold text-forest-800">{memberName(debt.fromUserId)}</span> deve <span className="font-semibold text-forest-800">R${debt.amount.toFixed(2)}</span> a <span className="font-semibold text-forest-800">{memberName(debt.toUserId)}</span></>;

          return (
          <div key={debt.id}
            className="flex items-center gap-3 bg-cream-100 rounded-xl px-3 py-2.5 group">
            <MiniAvatar img={avatarImg} />
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs font-semibold text-forest-800 truncate">{debt.description}</p>
              <p className="font-body text-xs text-stone-warm leading-snug">{label}</p>
            </div>
            {(debt.fromUserId === currentUserId || debt.toUserId === currentUserId) && (
              <button onClick={() => settleDebt(debt.id)}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-forest-800 flex-shrink-0
                           flex items-center justify-center transition-all cursor-pointer">
                <Check size={11} className="text-cream-50" />
              </button>
            )}
          </div>
          );
        })}
      </div>

      {/* Add debt modal */}
      <Modal open={showAdd} onClose={handleClose} title="Novo débito">
        <div className="space-y-4">
          <div>
            <label className="label">Descrição *</label>
            <input className="input" placeholder="Ex: Conta de luz" value={desc}
              onChange={(e) => setDesc(e.target.value)} autoFocus={isDesktop} />
          </div>

          <div>
            <label className="label">Valor total (R$) *</label>
            <input
              className="input [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
              placeholder="0,00" type="number" min="0" step="0.01"
              value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div>
            <label className="label">Participantes *</label>
            <div className="space-y-1.5">
              {/* Self */}
              <button onClick={() => setSelfIncluded((v) => !v)}
                className="w-full flex items-center gap-3 bg-cream-100 hover:bg-cream-200 rounded-xl px-3 py-2.5 transition-colors cursor-pointer">
                <MiniAvatar img={currentMember?.user.image ?? null} />
                <span className="flex-1 text-left font-body text-sm font-semibold text-forest-800">
                  {currentMember?.user.name ?? "Você"}
                  <span className="ml-1.5 text-xs font-normal text-stone-warm">(você)</span>
                </span>
                {selfIncluded
                  ? <CheckSquare size={16} className="text-forest-800 flex-shrink-0" />
                  : <Square size={16} className="text-stone-warm flex-shrink-0" />}
              </button>

              {/* Others */}
              {others.map((m) => {
                const selected = selectedDebtors.includes(m.user.id);
                return (
                  <button key={m.user.id} onClick={() => toggleDebtor(m.user.id)}
                    className="w-full flex items-center gap-3 bg-cream-100 hover:bg-cream-200 rounded-xl px-3 py-2.5 transition-colors cursor-pointer">
                    <MiniAvatar img={m.user.image} />
                    <span className="flex-1 text-left font-body text-sm font-semibold text-forest-800">
                      {m.user.name ?? m.user.email}
                    </span>
                    {selected
                      ? <CheckSquare size={16} className="text-forest-800 flex-shrink-0" />
                      : <Square size={16} className="text-stone-warm flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split preview */}
          {parsedAmount > 0 && totalPeople > 1 && (
            <div className="bg-cream-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="font-body text-xs text-stone-warm">
                Divisão entre {totalPeople} pessoas
              </span>
              <span className="font-display text-sm font-bold text-forest-800">
                R${sharePerPerson.toFixed(2)} cada
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={handleClose} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={addDebt} disabled={!canSubmit} className="btn-primary flex-1">
              {loading ? "Registrando…" : "Registrar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MiniAvatar({ img }: { img: string | null }) {
  return img ? (
    <Image src={img} alt="avatar" width={28} height={28} className="rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="w-7 h-7 rounded-full bg-cream-300 flex items-center justify-center flex-shrink-0">
      <User size={13} className="text-stone-warm" />
    </div>
  );
}
