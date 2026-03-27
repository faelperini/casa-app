"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Home,
  Copy, Check, Pencil, Users
} from "lucide-react";
import { ShoppingCard } from "@/components/group/ShoppingCard";
import { DebtsCard } from "@/components/group/DebtsCard";
import { RecipesCard } from "@/components/group/RecipesCard";
import { MembersBar } from "@/components/group/MembersBar";
import { Modal } from "@/components/ui/Modal";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { UserMenu } from "@/components/ui/UserMenu";

type Member = {
  id: string; role: string;
  user: { id: string; name: string | null; image: string | null; email: string | null };
};
type ShoppingItem = { id: string; name: string; quantity: string | null; checked: boolean };
type Debt = { id: string; description: string; amount: number; fromUserId: string; toUserId: string; status: string };
type Recipe = { id: string; title: string; description: string | null; ingredients: string; steps: string; image: string | null; authorId: string };

type Group = {
  id: string; name: string; description: string | null; image: string | null; inviteCode: string;
  members: Member[]; shoppingItems: ShoppingItem[]; debts: Debt[]; recipes: Recipe[];
};

type Props = { group: Group; currentUserId: string; currentUserRole: string };

export function GroupClient({ group: initial, currentUserId, currentUserRole }: Props) {
  const router = useRouter();
  const [group, setGroup]               = useState(initial);
  const [showEdit, setShowEdit]         = useState(false);
  const [showShopping, setShowShopping] = useState(false);
  const [showDebts, setShowDebts]       = useState(false);
  const [showRecipes, setShowRecipes]   = useState(false);
  const [editName, setEditName]         = useState(initial.name);
  const [editDesc, setEditDesc]         = useState(initial.description ?? "");
  const [editImage, setEditImage]       = useState(initial.image ?? null);
  const [saving, setSaving]             = useState(false);
  const [copied, setCopied]             = useState(false);

  function handleExpandShopping() {
    if (window.innerWidth < 1024) {
      router.push(`/grupos/${group.id}/compras`);
    } else {
      setShowShopping(true);
    }
  }

  function handleExpandDebts() {
    if (window.innerWidth < 1024) {
      router.push(`/grupos/${group.id}/debitos`);
    } else {
      setShowDebts(true);
    }
  }

  function handleExpandRecipes() {
    if (window.innerWidth < 1024) {
      router.push(`/grupos/${group.id}/receitas`);
    } else {
      setShowRecipes(true);
    }
  }

  const isAdmin = currentUserRole === "ADMIN";

  async function saveGroupInfo() {
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDesc, image: editImage }),
      });
      if (res.ok) {
        const updated = await res.json();
        setGroup((g) => ({ ...g, name: updated.name, description: updated.description, image: updated.image }));
        setShowEdit(false);
      }
    } finally { setSaving(false); }
  }

  function copyCode() {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grain min-h-full bg-cream-100">
      <div
        className="pointer-events-none fixed inset-0 opacity-15"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 5% 95%, #c4714a22 0%, transparent 55%), radial-gradient(ellipse 50% 35% at 95% 5%, #2d4a3e18 0%, transparent 55%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"
              className="w-9 h-9 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-center
                         hover:border-cream-300 transition-colors">
              <ArrowLeft size={16} className="text-forest-800" />
            </Link>
            <div className="font-body text-xs text-stone-warm flex items-center gap-1.5">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-forest-800 font-semibold truncate max-w-[160px]">{group.name}</span>
            </div>
          </div>
          <UserMenu inline />
        </div>

        {/* Group header */}
        <div className="card p-6 mb-6 animate-fade-up animate-fade-up-1">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden relative">
              {group.image ? (
                <Image src={group.image} alt={group.name} fill
                  className="object-cover" />
              ) : (
                <div className="w-full h-full bg-forest-800 flex items-center justify-center">
                  <Home size={28} className="text-cream-100" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-forest-800 leading-tight">
                    {group.name}
                  </h1>
                  {group.description && (
                    <p className="font-body text-sm text-stone-warm mt-1">{group.description}</p>
                  )}
                </div>
                {isAdmin && (
                  <button onClick={() => setShowEdit(true)}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-cream-100 hover:bg-cream-200
                               flex items-center justify-center transition-colors cursor-pointer">
                    <Pencil size={15} className="text-stone-warm" />
                  </button>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="flex items-center gap-1.5 font-body text-xs text-stone-warm">
                  <Users size={13} />
                  {group.members.length} {group.members.length === 1 ? "morador" : "moradores"}
                </span>
                <button onClick={copyCode}
                  className="flex items-center gap-1.5 font-display text-xs font-bold tracking-widest
                             text-forest-700 bg-cream-200 rounded-lg px-2.5 py-1
                             hover:bg-cream-300 transition-colors cursor-pointer">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {group.inviteCode}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Members bar */}
        <MembersBar members={group.members} currentUserId={currentUserId} />

        {/* Cards grid — desktop: 3 cols, mobile: 1 col stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="animate-fade-up animate-fade-up-2">
            <ShoppingCard
              groupId={group.id}
              items={group.shoppingItems}
              onItemsChange={(items) => setGroup((g) => ({ ...g, shoppingItems: items }))}
              onExpand={handleExpandShopping}
            />
          </div>
          <div className="animate-fade-up animate-fade-up-3">
            <DebtsCard
              groupId={group.id}
              debts={group.debts}
              members={group.members}
              currentUserId={currentUserId}
              onDebtsChange={(debts) => setGroup((g) => ({ ...g, debts }))}
              onExpand={handleExpandDebts}
            />
          </div>
          <div className="animate-fade-up animate-fade-up-4">
            <RecipesCard
              groupId={group.id}
              recipes={group.recipes}
              currentUserId={currentUserId}
              onRecipesChange={(recipes) => setGroup((g) => ({ ...g, recipes }))}
              onExpand={handleExpandRecipes}
            />
          </div>
        </div>
      </div>

      <Modal open={showShopping} onClose={() => setShowShopping(false)} title="Lista de Compras"
        panelClassName="!max-w-lg">
        <ShoppingCard
          groupId={group.id}
          items={group.shoppingItems}
          onItemsChange={(items) => setGroup((g) => ({ ...g, shoppingItems: items }))}
          expanded
        />
      </Modal>

      <Modal open={showDebts} onClose={() => setShowDebts(false)} title="Débitos"
        panelClassName="!max-w-lg">
        <DebtsCard
          groupId={group.id}
          debts={group.debts}
          members={group.members}
          currentUserId={currentUserId}
          onDebtsChange={(debts) => setGroup((g) => ({ ...g, debts }))}
          expanded
        />
      </Modal>

      <Modal open={showRecipes} onClose={() => setShowRecipes(false)} title="Receitas"
        panelClassName="!max-w-lg">
        <RecipesCard
          groupId={group.id}
          recipes={group.recipes}
          currentUserId={currentUserId}
          onRecipesChange={(recipes) => setGroup((g) => ({ ...g, recipes }))}
          expandedView
        />
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Editar casa">
        <div className="space-y-4">
          {/* Group image upload */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-1">
              <ImageUpload
                current={editImage}
                fallback={<Home size={28} className="text-stone-warm" />}
                onUpload={(url) => setEditImage(url)}
                size={80}
                rounded="2xl"
              />
              <span className="text-xs text-stone-warm font-body">Foto da casa</span>
            </div>
          </div>
          <div>
            <label className="label">Nome</label>
            <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea className="input resize-none" rows={3} value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)} placeholder="Descreva a casa..." />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowEdit(false)} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={saveGroupInfo} disabled={saving || !editName.trim()} className="btn-primary flex-1">
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
