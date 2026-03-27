"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";

type Props = {
  current: string | null;
  fallback?: React.ReactNode;
  onUpload: (url: string) => void;
  size?: number; // px
  rounded?: "xl" | "2xl" | "full";
};

export function ImageUpload({ current, fallback, onUpload, size = 72, rounded = "2xl" }: Props) {
  const inputRef           = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]  = useState("");

  const roundedClass = {
    xl:   "rounded-xl",
    "2xl":"rounded-2xl",
    full: "rounded-full",
  }[rounded];

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro no upload");
      onUpload(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
      // reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`relative overflow-hidden cursor-pointer group disabled:cursor-not-allowed ${roundedClass}`}
        style={{ width: size, height: size }}
        aria-label="Alterar imagem"
      >
        {/* Image or fallback */}
        <div className={`w-full h-full ${roundedClass} overflow-hidden bg-cream-200`}>
          {current ? (
            <Image src={current} alt="imagem" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {fallback}
            </div>
          )}
        </div>

        {/* Overlay */}
        <div className={`absolute inset-0 ${roundedClass} bg-forest-900/50
                         opacity-0 group-hover:opacity-100 transition-opacity
                         flex items-center justify-center`}>
          {uploading
            ? <Loader2 size={20} className="text-cream-50 animate-spin" />
            : <Camera size={20} className="text-cream-50" />}
        </div>
      </button>

      {error && (
        <p className="text-xs text-terra-500 font-body text-center max-w-[160px]">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
