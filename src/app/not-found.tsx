import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-cream-100 flex items-center justify-center p-6">
      <div className="text-center animate-fade-up">
        <p className="font-display text-8xl font-black text-cream-300 mb-2 leading-none">404</p>
        <h1 className="font-display text-2xl font-bold text-forest-800 mb-2">
          Página não encontrada
        </h1>
        <p className="font-body text-sm text-stone-warm mb-8">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <Link href="/dashboard"
          className="btn-primary inline-flex items-center gap-2">
          <Home size={16} /> Voltar para o início
        </Link>
      </div>
    </main>
  );
}
