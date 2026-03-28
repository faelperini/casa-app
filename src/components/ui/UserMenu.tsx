"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { User, Settings, LogOut, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ProfilePanel } from "@/components/dashboard/ProfilePanel";

type FullUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string | null;
  birthDate?: Date | string | null;
};

const HIDDEN_PATHS = ["/login", "/dashboard"];

export function UserMenu({ inline = false }: { inline?: boolean }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileMode, setProfileMode] = useState<"view" | "edit">("view");
  const [fullUser, setFullUser]   = useState<FullUser | null>(null);

  if (status !== "authenticated") return null;
  if (!inline && (HIDDEN_PATHS.includes(pathname) || pathname.startsWith("/grupos"))) return null;

  async function openProfile(mode: "view" | "edit") {
    setMenuOpen(false);
    setProfileMode(mode);
    if (!fullUser) {
      const res = await fetch("/api/user");
      if (res.ok) setFullUser(await res.json());
    }
    setShowProfile(true);
  }

  const user = fullUser ?? session.user;

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}

      <div className={inline ? "relative z-50" : "fixed top-8 right-4 sm:right-6 z-50"}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2.5 bg-cream-50/90 backdrop-blur-sm border border-cream-200
                     rounded-2xl px-3 py-2 hover:border-cream-300 transition-colors shadow-sm cursor-pointer">
          {session.user.image ? (
            <Image src={session.user.image} alt="avatar" width={28} height={28}
                   className="rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-terra-400 flex items-center justify-center">
              <User size={14} className="text-cream-50" />
            </div>
          )}
          <span className="font-body text-sm font-semibold text-forest-800 hidden sm:block max-w-[120px] truncate">
            {session.user.name?.split(" ")[0] ?? "Usuário"}
          </span>
          <ChevronRight size={14} className="text-stone-warm hidden sm:block" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48
                          bg-cream-50 rounded-3xl shadow-card border border-cream-200 overflow-hidden">
            <button onClick={() => openProfile("view")}
              className="w-full flex items-center gap-2.5 px-4 pt-3.5 pb-2.5 text-sm font-body
                         text-forest-800 hover:bg-cream-200 transition-colors cursor-pointer">
              <User size={15} /> Ver perfil
            </button>
            <button onClick={() => openProfile("edit")}
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

      {showProfile && (
        <Modal open={showProfile} onClose={() => { setShowProfile(false); setFullUser(null); }} title="Perfil">
          <ProfilePanel
            user={user as FullUser}
            initialMode={profileMode}
            onClose={() => { setShowProfile(false); setFullUser(null); }}
          />
        </Modal>
      )}
    </>
  );
}
