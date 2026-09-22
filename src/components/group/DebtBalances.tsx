"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { MiniAvatar } from "@/components/group/MiniAvatar";
import type { Balance } from "@/lib/debts";

export type BalanceRow = Balance & { name: string; image: string | null };

type Props = {
  balances: BalanceRow[];
  onSettle: (debtIds: string[]) => Promise<void>;
  expanded?: boolean;
};

const money = (cents: number) => `R$${(Math.abs(cents) / 100).toFixed(2)}`;

export function DebtBalances({ balances, onSettle, expanded }: Props) {
  const [confirming, setConfirming] = useState<BalanceRow | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const receivable = balances.reduce((sum, b) => sum + Math.max(b.cents, 0), 0);
  const payable    = balances.reduce((sum, b) => sum + Math.max(-b.cents, 0), 0);

  function openConfirm(balance: BalanceRow) {
    setError("");
    setConfirming(balance);
  }

  function closeConfirm() {
    if (loading) return;
    setConfirming(null);
    setError("");
  }

  async function confirmSettle() {
    if (!confirming || loading) return;
    setLoading(true); setError("");
    try {
      await onSettle(confirming.debtIds);
      setConfirming(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao quitar");
    } finally { setLoading(false); }
  }

  if (balances.length === 0) {
    return (
      <p className="font-body text-xs text-stone-warm text-center py-6">
        Tudo certo! Nenhum débito pendente.
      </p>
    );
  }

  return (
    <>
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-cream-100 rounded-xl px-3 py-2">
          <p className="label mb-0.5">A receber</p>
          <p className="font-display text-sm font-bold text-forest-700">{money(receivable)}</p>
        </div>
        <div className="bg-cream-100 rounded-xl px-3 py-2">
          <p className="label mb-0.5">A pagar</p>
          <p className="font-display text-sm font-bold text-terra-500">{money(payable)}</p>
        </div>
      </div>

      {/* Uma linha por pessoa */}
      <ul className={`flex-1 space-y-2 overflow-y-auto pr-2 -mr-2 ${expanded ? "" : "max-h-64"}`}>
        {balances.map((b) => {
          const count = b.debtIds.length;
          const amountClass = b.cents > 0 ? "text-forest-700" : "text-terra-500";
          return (
            <li key={b.userId} className="flex items-center gap-3 bg-cream-100 rounded-xl px-3 py-2.5">
              <MiniAvatar img={b.image} />
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs font-semibold text-forest-800 truncate">{b.name}</p>
                <p className="font-body text-xs text-stone-warm leading-snug truncate">
                  {b.cents === 0 ? (
                    "quites"
                  ) : (
                    <>
                      {b.cents > 0 ? "te deve" : "você deve"}{" "}
                      <span className={`font-semibold ${amountClass}`}>{money(b.cents)}</span>
                    </>
                  )}
                  {" · "}{count} {count === 1 ? "débito" : "débitos"}
                </p>
              </div>
              <button onClick={() => openConfirm(b)}
                className="btn-secondary h-10 px-3 py-0 flex-shrink-0">
                Quitar
              </button>
            </li>
          );
        })}
      </ul>

      {/* Confirmação */}
      <Modal open={!!confirming} onClose={closeConfirm}
        title={confirming ? `Quitar tudo com ${confirming.name}?` : ""}>
        {confirming && (
          <div className="space-y-4">
            <p className="font-body text-sm text-forest-800">
              {confirming.debtIds.length === 1
                ? "1 débito entre vocês será marcado como quitado."
                : `${confirming.debtIds.length} débitos entre vocês serão marcados como quitados.`}
            </p>

            <div className="bg-cream-100 rounded-xl px-4 py-3">
              <p className="label mb-0.5">Saldo atual</p>
              <p className="font-body text-sm font-semibold text-forest-800">
                {confirming.cents > 0
                  ? `${confirming.name} te deve ${money(confirming.cents)}`
                  : confirming.cents < 0
                  ? `Você deve ${money(confirming.cents)} a ${confirming.name}`
                  : "Vocês já estão quites"}
              </p>
            </div>

            <p className="font-body text-xs text-stone-warm">
              Use quando o acerto já foi feito por fora (Pix, dinheiro…). Não dá para desfazer.
            </p>

            {error && <p className="text-xs text-terra-500 font-body">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button onClick={closeConfirm} disabled={loading} className="btn-secondary flex-1 py-3">
                Cancelar
              </button>
              <button onClick={confirmSettle} disabled={loading} className="btn-terra flex-1 py-3">
                {loading ? "Quitando…" : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
