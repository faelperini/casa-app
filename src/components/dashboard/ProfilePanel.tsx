"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Cake } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";

type Props = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    bio?: string | null;
    birthDate?: Date | string | null;
  };
  initialMode: "view" | "edit";
  onClose: () => void;
};

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);

function parseDateParts(value: Date | string | null | undefined) {
  if (!value) return { day: "", month: "", year: "" };
  const d = new Date(value);
  if (isNaN(d.getTime())) return { day: "", month: "", year: "" };
  return {
    day:   String(d.getUTCDate()),
    month: String(d.getUTCMonth() + 1),
    year:  String(d.getUTCFullYear()),
  };
}

function partsToIso(day: string, month: string, year: string): string {
  if (!day || !month || !year) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function displayDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

export function ProfilePanel({ user, initialMode, onClose }: Props) {
  const router = useRouter();
  const [mode, setMode]   = useState(initialMode);
  const [name, setName]   = useState(user.name ?? "");
  const [bio, setBio]     = useState(user.bio ?? "");
  const [avatar, setAvatar] = useState(user.image ?? null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const initial = parseDateParts(user.birthDate);
  const [day,   setDay]   = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year,  setYear]  = useState(initial.year);

  const birthDateIso = partsToIso(day, month, year);

  useEffect(() => { setMode(initialMode); }, [initialMode]);

  async function handleSave() {
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, birthDate: birthDateIso || null }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSuccess(true);
      router.refresh();
      setTimeout(() => { setSuccess(false); setMode("view"); }, 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally { setLoading(false); }
  }

  const selectClass =
    "flex-1 bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 font-body text-sm " +
    "text-forest-800 focus:outline-none focus:border-forest-700 appearance-none cursor-pointer";

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-2">
        {mode === "edit" ? (
          <>
            <ImageUpload
              current={avatar}
              fallback={<User size={28} className="text-stone-warm" />}
              onUpload={(url) => setAvatar(url)}
              size={80}
              rounded="2xl"
            />
            <span className="text-xs text-stone-warm font-body">Clique para trocar a foto</span>
          </>
        ) : (
          avatar ? (
            <Image src={avatar} alt="avatar" width={72} height={72}
              className="rounded-2xl object-cover" />
          ) : (
            <div className="w-[72px] h-[72px] rounded-2xl bg-terra-400 flex items-center justify-center">
              <User size={28} className="text-cream-50" />
            </div>
          )
        )}
        <div className="text-center">
          <p className="font-display font-bold text-forest-800">{user.name}</p>
          <p className="font-body text-xs text-stone-warm">{user.email}</p>
        </div>
      </div>

      {mode === "view" ? (
        <div className="space-y-3">
          {(bio || user.bio) && (
            <p className="font-body text-sm text-forest-800 text-center leading-relaxed">
              {bio || user.bio}
            </p>
          )}
          {(birthDateIso || user.birthDate) && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-stone-warm font-body">
              <Cake size={13} />
              <span>{displayDate(birthDateIso || user.birthDate)}</span>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setMode("edit")} className="btn-secondary flex-1">Editar perfil</button>
            <button onClick={onClose} className="btn-primary flex-1">Fechar</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="label">Nome</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input resize-none" rows={2} value={bio}
              onChange={(e) => setBio(e.target.value)} placeholder="Uma frase sobre você..." />
          </div>
          <div>
            <label className="label">Data de nascimento</label>
            <div className="flex gap-2">
              <select value={day} onChange={(e) => setDay(e.target.value)} className={selectClass}>
                <option value="">Dia</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d)}>{d}</option>
                ))}
              </select>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className={`${selectClass} flex-[2]`}>
                <option value="">Mês</option>
                {MONTHS.map((m, i) => (
                  <option key={i} value={String(i + 1)}>{m}</option>
                ))}
              </select>
              <select value={year} onChange={(e) => setYear(e.target.value)} className={selectClass}>
                <option value="">Ano</option>
                {YEARS.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          {error   && <p className="text-xs text-terra-500">{error}</p>}
          {success && <p className="text-xs text-forest-700 font-semibold">✓ Salvo com sucesso!</p>}
          <div className="flex gap-2">
            <button onClick={() => setMode("view")} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
              {loading ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
