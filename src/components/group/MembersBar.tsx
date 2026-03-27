"use client";
import Image from "next/image";
import { User, Crown } from "lucide-react";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string | null; image: string | null; email: string | null };
};

type Props = {
  members: Member[];
  currentUserId: string;
};

export function MembersBar({ members, currentUserId }: Props) {
  const admins  = members.filter((m) => m.role === "ADMIN");
  const regular = members.filter((m) => m.role !== "ADMIN");
  const sorted  = [...admins, ...regular];

  return (
    <div className="card px-5 py-4 mb-6 animate-fade-up animate-fade-up-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-body text-xs font-semibold uppercase tracking-widest text-stone-warm">
          Moradores
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {sorted.map((m) => (
            <div key={m.id}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-colors
                          ${m.user.id === currentUserId
                            ? "bg-forest-800 text-cream-50"
                            : "bg-cream-200 text-forest-800"}`}>
              {m.user.image ? (
                <Image src={m.user.image} alt="avatar" width={18} height={18}
                  className="rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0
                                 ${m.user.id === currentUserId ? "bg-forest-700" : "bg-cream-300"}`}>
                  <User size={10} className={m.user.id === currentUserId ? "text-cream-100" : "text-stone-warm"} />
                </div>
              )}
              <span className="font-body text-xs font-semibold truncate max-w-[80px]">
                {m.user.name?.split(" ")[0] ?? m.user.email?.split("@")[0] ?? "?"}
              </span>
              {m.role === "ADMIN" && (
                <Crown size={10} className={m.user.id === currentUserId ? "text-cream-300" : "text-terra-400"} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
