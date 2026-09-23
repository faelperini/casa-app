"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor,
  closestCenter, useSensor, useSensors,
  type Announcements, type DragEndEvent, type DragOverEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpDown, BookOpen, GripVertical, ShoppingCart, Wallet } from "lucide-react";
import { type CardKey } from "@/lib/cards";

/** Mesmos ícone/cores do cabeçalho de cada card, para a linha compacta parecer o card. */
const CARD_META: Record<CardKey, {
  title: string; Icon: typeof ShoppingCart; box: string; color: string;
}> = {
  shopping: { title: "Lista de Compras", Icon: ShoppingCart, box: "bg-terra-400/15",  color: "text-terra-500"  },
  debts:    { title: "Débitos",          Icon: Wallet,       box: "bg-forest-700/10", color: "text-forest-700" },
  recipes:  { title: "Receitas",         Icon: BookOpen,     box: "bg-terra-400/10",  color: "text-terra-500"  },
};

type Props = {
  initialOrder: CardKey[];
  cards: Record<CardKey, React.ReactNode>;
  onSave: (order: CardKey[]) => Promise<void>;
};

export function CardsGrid({ initialOrder, cards, onSave }: Props) {
  const [order, setOrder]     = useState<CardKey[]>(initialOrder);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState<CardKey[]>(initialOrder);
  const [dragging, setDragging] = useState<CardKey | null>(null);
  const [overlayPos, setOverlayPos] = useState(1);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Mouse e toque separados de propósito: no desktop arrasta ao mover 8px; no celular só depois de
  // segurar 200ms, senão o gesto continua sendo rolagem da página.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const title = (id: string) => CARD_META[id as CardKey]?.title ?? id;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${title(String(active.id))} selecionado. Use as setas para mover e Espaço para soltar.`,
    onDragOver:  ({ active, over }) =>
      over ? `${title(String(active.id))} na posição ${draft.indexOf(over.id as CardKey) + 1} de ${draft.length}.` : undefined,
    onDragEnd:   ({ active, over }) =>
      over ? `${title(String(active.id))} solto na posição ${draft.indexOf(over.id as CardKey) + 1}.` : "Movimento cancelado.",
    onDragCancel: ({ active }) => `Movimento de ${title(String(active.id))} cancelado.`,
  };

  function startEdit() {
    setDraft(order); setError(""); setEditing(true);
  }
  function cancelEdit() {
    if (saving) return;
    setDraft(order); setError(""); setEditing(false);
  }

  function handleDragStart(e: DragStartEvent) {
    setDragging(e.active.id as CardKey);
    setOverlayPos(draft.indexOf(e.active.id as CardKey) + 1);
  }
  // Mantém o número do card flutuante igual ao lugar onde ele vai cair
  function handleDragOver(e: DragOverEvent) {
    const over = e.over && draft.indexOf(e.over.id as CardKey);
    if (over !== null && over !== undefined && over >= 0) setOverlayPos(over + 1);
  }
  function handleDragEnd(e: DragEndEvent) {
    setDragging(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setDraft((prev) => {
      const from = prev.indexOf(active.id as CardKey);
      const to   = prev.indexOf(over.id as CardKey);
      return from < 0 || to < 0 ? prev : arrayMove(prev, from, to);
    });
  }

  const changed = draft.some((key, i) => key !== order[i]);

  async function save() {
    if (saving || !changed) return;
    setSaving(true); setError("");
    try {
      await onSave(draft);
      setOrder(draft);
      setEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar a ordem");
    } finally { setSaving(false); }
  }

  if (editing) {
    return (
      <div className="card p-5 sm:p-6 max-w-md mx-auto animate-fade-up">
        <h2 className="font-display text-lg font-bold text-forest-800">Reordenar cards</h2>
        <p className="font-body text-xs text-stone-warm mt-0.5 mb-4">
          Segure e arraste para mudar a ordem.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          accessibility={{ announcements }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDragging(null)}
        >
          <SortableContext items={draft} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {draft.map((key) => (
                <SortableRow key={key} cardKey={key} />
              ))}
            </ul>
          </SortableContext>

          {/* No portal do body de propósito: dentro do card, a animação de transform do card vira o
              bloco de referência do position:fixed e o overlay fica deslocado do cursor.
              Os modifiers vão no overlay, não no DndContext — é o overlay que segue o cursor. */}
          {mounted && createPortal(
            <DragOverlay modifiers={[restrictToVerticalAxis]} dropAnimation={null}>
              {dragging && <RowVisual cardKey={dragging} position={overlayPos} lifted />}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>

        {error && <p className="text-xs text-terra-500 font-body mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={cancelEdit} disabled={saving} className="btn-secondary flex-1 py-3">
            Cancelar
          </button>
          <button onClick={save} disabled={saving || !changed} className="btn-primary flex-1 py-3">
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-3 animate-fade-up animate-fade-up-2">
        <button onClick={startEdit}
          className="flex items-center gap-1.5 font-body text-xs text-stone-warm
                     hover:text-forest-800 transition-colors cursor-pointer py-1">
          <ArrowUpDown size={13} /> Reordenar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {order.map((key, i) => (
          <div key={key} className={`animate-fade-up animate-fade-up-${Math.min(i + 3, 5)}`}>
            {cards[key]}
          </div>
        ))}
      </div>
    </>
  );
}

function SortableRow({ cardKey }: { cardKey: CardKey }) {
  // newIndex acompanha o arraste, então o número bate com o lugar onde a linha está agora
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, newIndex } =
    useSortable({ id: cardKey });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        WebkitTouchCallout: "none", // sem menu de seleção do Safari ao segurar
      }}
      className="rounded-2xl outline-none cursor-grab active:cursor-grabbing select-none
                 touch-manipulation focus-visible:ring-2 focus-visible:ring-forest-700/30"
    >
      {isDragging ? (
        // Lugar vago: quem segue o cursor é o card do DragOverlay
        <div className="min-h-[56px] rounded-2xl border-2 border-dashed border-cream-300 bg-cream-100/50" />
      ) : (
        <RowVisual cardKey={cardKey} position={newIndex + 1} />
      )}
    </li>
  );
}

function RowVisual({ cardKey, position, lifted }: {
  cardKey: CardKey; position: number; lifted?: boolean;
}) {
  const { title, Icon, box, color } = CARD_META[cardKey];
  return (
    <div className={`flex items-center gap-3 min-h-[56px] bg-cream-50 rounded-2xl border px-4 py-3
                     ${lifted ? "border-cream-300 shadow-card-hover cursor-grabbing" : "border-cream-200 shadow-sm"}`}>
      <GripVertical size={18} className="text-cream-300 flex-shrink-0" />
      <div className={`w-8 h-8 rounded-xl ${box} flex items-center justify-center flex-shrink-0`}>
        <Icon size={15} className={color} />
      </div>
      <span className="font-display font-bold text-forest-800 truncate">{title}</span>
      <span className="ml-auto font-body text-xs text-stone-warm flex-shrink-0">{position}º</span>
    </div>
  );
}
