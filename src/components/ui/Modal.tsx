"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  panelClassName?: string;
};

export function Modal({ open, onClose, title, children, panelClassName }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={`relative w-full max-w-md card animate-fade-up flex flex-col max-h-[calc(100dvh-2rem)] ${panelClassName ?? ""}`}>
        <div className="flex items-center justify-between p-6 pb-5 flex-shrink-0">
          <h3 className="font-display text-lg font-bold text-forest-800">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-cream-100 hover:bg-cream-200 flex items-center justify-center
                       transition-colors cursor-pointer">
            <X size={15} className="text-stone-warm" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
