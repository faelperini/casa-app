"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home, Plus, Hash, LogOut, User, ChevronRight,
  Users, BookOpen, ShoppingCart, Wallet, Settings, Lock
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ProfilePanel } from "@/components/dashboard/ProfilePanel";
import { ImageUpload } from "@/components/ui/ImageUpload";

type Group = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  inviteCode: string;
  isPrivate: boolean;
  _count: { members: number };
  role: string;
};

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string | null;
  birthDate?: Date | string | null;
};

type Props = { user: User; groups: Group[] };

export function DashboardClient({ user, groups }: Props) {
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin]     = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileMode, setProfileMode] = useState<"view" | "edit">("view");

  const [menuOpen, setMenuOpen] = useState(false);

  const [createName, setCreateName]     = useState("");
  const [createDesc, setCreateDesc]     = useState("");
  const [createImage, setCreateImage]   = useState<string | null>(null);
  const [isPrivate, setIsPrivate]       = useState(false);
  const [createPassword, setCreatePassword] = useState("");

  const [joinCode, setJoinCode]         = useState("");
  const [joinStep, setJoinStep]         = useState<"code" | "password">("code");
  const [joinGroupName, setJoinGroupName] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  function resetCreate() {
    setCreateName(""); setCreateDesc(""); setCreateImage(null);
    setIsPrivate(false); setCreatePassword("");
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    if (isPrivate && createPassword.length < 6) { setError("Senha deve ter no mínimo 6 caracteres"); return; }
    if (isPrivate && !/\d/.test(createPassword)) { setError("Senha deve conter pelo menos 1 número"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName, description: createDesc,
          image: createImage, isPrivate, password: isPrivate ? createPassword : undefined,
        }),
      });
      const data = await res.json().catch(() => ({})) as Record<string, string>;
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar grupo");
      setShowCreate(false); resetCreate();
      router.push(`/grupos/${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao criar grupo");
    } finally { setLoading(false); }
  }

  function resetJoin() {
    setJoinCode(""); setJoinStep("code"); setJoinGroupName(""); setJoinPassword("");
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setLoading(true); setError("");
    try {
      const body = joinStep === "code"
        ? { inviteCode: joinCode }
        : { inviteCode: joinCode, password: joinPassword };

      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({})) as Record<string, string>;

      if (res.ok && data.requiresPassword) {
        setJoinStep("password");
        setJoinGroupName(data.groupName);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Erro ao entrar no grupo");
      setShowJoin(false); resetJoin();
      router.push(`/grupos/${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao entrar no grupo");
    } finally { setLoading(false); }
  }

  function openProfile(mode: "view" | "edit") {
    setProfileMode(mode);
    setShowProfile(true);
  }

  return (
    <div className="grain min-h-full bg-cream-100">
      {/* Background decoration */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 10% 90%, #c4714a28 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 10%, #2d4a3e1a 0%, transparent 55%)",
        }}
      />

      {/* Overlay para fechar menu ao clicar fora */}
      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <header className="relative z-40 flex items-center justify-between mb-10 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-800 flex items-center justify-center flex-shrink-0">
              <Home size={16} className="text-cream-50" />
            </div>
            <h1 className="font-display text-2xl font-black text-forest-800">Casa</h1>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 bg-cream-50 border border-cream-200 rounded-2xl
                         px-3 py-2 hover:border-cream-300 transition-colors duration-150 cursor-pointer">
              {user.image ? (
                <Image src={user.image} alt="avatar" width={28} height={28}
                       className="rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-terra-400 flex items-center justify-center">
                  <User size={14} className="text-cream-50" />
                </div>
              )}
              <span className="font-body text-sm font-semibold text-forest-800 hidden sm:block max-w-[120px] truncate">
                {user.name?.split(" ")[0] ?? "Usuário"}
              </span>
              <ChevronRight size={14} className="text-stone-warm hidden sm:block" />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 z-50
                              bg-cream-50 rounded-3xl shadow-card border border-cream-200 overflow-hidden">
                <button onClick={() => { setMenuOpen(false); openProfile("view"); }}
                  className="w-full flex items-center gap-2.5 px-4 pt-3.5 pb-2.5 text-sm font-body
                             text-forest-800 hover:bg-cream-200 transition-colors cursor-pointer">
                  <User size={15} /> Ver perfil
                </button>
                <button onClick={() => { setMenuOpen(false); openProfile("edit"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-body
                             text-forest-800 hover:bg-cream-200 transition-colors cursor-pointer">
                  <Settings size={15} /> Editar perfil
                </button>
                <div className="border-t border-cream-200" />
                <button onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-4 pt-2.5 pb-3.5 text-sm font-body
                             text-terra-500 hover:bg-cream-200 transition-colors cursor-pointer">
                  <LogOut size={15} /> Sair
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Welcome */}
        <div className="mb-8 animate-fade-up animate-fade-up-1">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-forest-800 leading-tight">
            Olá, {user.name?.split(" ")[0] ?? "por aí"} 👋
          </h2>
          <p className="font-body text-sm text-stone-warm mt-1">
            {groups.length > 0
              ? `Você faz parte de ${groups.length} ${groups.length === 1 ? "casa" : "casas"}`
              : "Crie ou entre em uma casa para começar"}
          </p>
        </div>

        {/* Actions row */}
        <div className="flex gap-3 mb-8 animate-fade-up animate-fade-up-2">
          <button onClick={() => { setShowCreate(true); setError(""); }}
            className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nova casa
          </button>
          <button onClick={() => { setShowJoin(true); setError(""); }}
            className="btn-secondary flex items-center gap-2">
            <Hash size={16} /> Entrar por código
          </button>
        </div>

        {/* Groups grid / empty state */}
        {groups.length === 0 ? (
          <div className="card p-12 text-center animate-fade-up animate-fade-up-3">
            <div className="w-16 h-16 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto mb-4">
              <Home size={28} className="text-stone-warm" />
            </div>
            <h3 className="font-display text-xl font-bold text-forest-800 mb-2">
              Nenhuma casa ainda
            </h3>
            <p className="font-body text-sm text-stone-warm max-w-xs mx-auto">
              Crie uma nova casa ou peça o código para alguém te convidar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group, i) => (
              <GroupCard
                key={group.id}
                group={group}
                delay={i + 3}
                onClick={() => router.push(`/grupos/${group.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal: criar grupo */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); resetCreate(); setError(""); }} title="Criar nova casa">
        <div className="space-y-4">
          {/* Foto */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-1">
              <ImageUpload
                current={createImage}
                fallback={<Home size={24} className="text-stone-warm" />}
                onUpload={(url) => setCreateImage(url)}
                size={72}
                rounded="2xl"
              />
              <span className="text-xs text-stone-warm font-body">Foto da casa</span>
            </div>
          </div>

          <div>
            <label className="label">Nome da casa *</label>
            <input className="input" placeholder="Ex: República dos Amigos"
              value={createName} onChange={(e) => setCreateName(e.target.value)} autoFocus={isDesktop} />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea className="input resize-none" rows={3}
              placeholder="Uma descrição sobre a casa..."
              value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} />
          </div>

          {/* Toggle privacidade */}
          <div className="flex items-center justify-between bg-cream-100 rounded-xl px-4 py-3">
            <div>
              <p className="font-body text-sm font-semibold text-forest-800">Casa privada</p>
              <p className="font-body text-xs text-stone-warm">Exige senha para novos moradores</p>
            </div>
            <button
              type="button"
              onClick={() => { setIsPrivate((v) => !v); setCreatePassword(""); setError(""); }}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0
                          ${isPrivate ? "bg-forest-800" : "bg-cream-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
                                transition-transform duration-200 ${isPrivate ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Senha (condicional) */}
          {isPrivate && (
            <div className="animate-fade-up">
              <label className="label">Senha de acesso *</label>
              <input className="input" type="password" placeholder="Mín. 6 caracteres e 1 número"
                value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} />
            </div>
          )}

          {error && <p className="text-xs text-terra-500 font-body">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={() => { setShowCreate(false); resetCreate(); setError(""); }} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={handleCreate}
              disabled={!createName.trim() || loading || (isPrivate && createPassword.length < 6)}
              className="btn-primary flex-1">{loading ? "Criando…" : "Criar casa"}</button>
          </div>
        </div>
      </Modal>

      {/* Modal: entrar por código */}
      <Modal open={showJoin} onClose={() => { setShowJoin(false); resetJoin(); setError(""); }}
        title={joinStep === "password" ? `Entrar em "${joinGroupName}"` : "Entrar por código"}>
        <div className="space-y-4">
          {joinStep === "code" ? (
            <div>
              <label className="label">Código de convite</label>
              <input className="input font-display text-lg tracking-widest"
                placeholder="#1234" maxLength={5}
                value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()} autoFocus={isDesktop} />
              <p className="text-xs text-stone-warm mt-1.5 font-body">
                Peça o código para quem já faz parte da casa
              </p>
            </div>
          ) : (
            <div className="animate-fade-up">
              <div className="flex items-center gap-2 mb-3 text-stone-warm">
                <Lock size={14} />
                <p className="font-body text-sm">Esta casa é privada. Insira a senha para entrar.</p>
              </div>
              <label className="label">Senha</label>
              <input className="input" type="password" placeholder="••••••"
                value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()} autoFocus={isDesktop} />
            </div>
          )}

          {error && <p className="text-xs text-terra-500 font-body">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={() => { setShowJoin(false); resetJoin(); setError(""); }} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={handleJoin}
              disabled={loading || (joinStep === "code" ? !joinCode.trim() : !joinPassword.trim())}
              className="btn-primary flex-1">{loading ? "Verificando…" : joinStep === "code" ? "Continuar" : "Entrar"}</button>
          </div>
        </div>
      </Modal>

      {/* Profile panel */}
      <Modal open={showProfile} onClose={() => setShowProfile(false)}
        title={profileMode === "edit" ? "Editar perfil" : "Meu perfil"}>
        <ProfilePanel key={profileMode} user={user} initialMode={profileMode} onClose={() => setShowProfile(false)} />
      </Modal>
    </div>
  );
}

function GroupCard({ group, delay, onClick }: {
  group: Group; delay: number; onClick: () => void;
}) {
  const icons = [
    <ShoppingCart key="s" size={14} className="text-stone-warm" />,
    <Wallet key="w" size={14} className="text-stone-warm" />,
    <BookOpen key="b" size={14} className="text-stone-warm" />,
  ];

  return (
    <button
      onClick={onClick}
      className={`card p-5 text-left w-full cursor-pointer animate-fade-up animate-fade-up-${Math.min(delay, 5)}`}
    >
      <div className="flex items-start gap-3 mb-3">
        {group.image ? (
          <Image src={group.image} alt={group.name} width={44} height={44}
            className="rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-forest-800 flex items-center justify-center flex-shrink-0">
            <Home size={20} className="text-cream-100" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-bold text-forest-800 truncate">{group.name}</h3>
            {group.isPrivate && <Lock size={11} className="text-stone-warm flex-shrink-0" />}
          </div>
          <p className="font-body text-xs text-stone-warm flex items-center gap-1 mt-0.5">
            <Users size={11} /> {group._count.members} {group._count.members === 1 ? "morador" : "moradores"}
          </p>
        </div>
        <ChevronRight size={16} className="text-cream-300 flex-shrink-0 mt-1" />
      </div>

      {group.description && (
        <p className="font-body text-xs text-stone-warm line-clamp-2 mb-3">{group.description}</p>
      )}

      <div className="flex items-center gap-3 pt-3 border-t border-cream-200">
        {icons.map((icon, i) => (
          <span key={i} className="flex items-center gap-1">{icon}</span>
        ))}
        <span className="ml-auto font-display text-xs font-bold text-cream-300 tracking-widest">
          {group.inviteCode}
        </span>
      </div>
    </button>
  );
}
