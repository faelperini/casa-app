"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RecipesCard } from "@/components/group/RecipesCard";
import { UserMenu } from "@/components/ui/UserMenu";

type Recipe = { id: string; title: string; description: string | null; ingredients: string; steps: string; image: string | null; authorId: string };
type Props = {
  group: { id: string; name: string; recipes: Recipe[] };
  currentUserId: string;
};

export function RecipesPageClient({ group: initial, currentUserId }: Props) {
  const router = useRouter();
  const [recipes, setRecipes] = useState(initial.recipes);

  return (
    <div className="grain min-h-full bg-cream-100">
      <div
        className="pointer-events-none fixed inset-0 opacity-15"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 5% 95%, #c4714a22 0%, transparent 55%), radial-gradient(ellipse 50% 35% at 95% 5%, #2d4a3e18 0%, transparent 55%)",
        }}
      />

      <div className="relative max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-center
                         hover:border-cream-300 transition-colors cursor-pointer">
              <ArrowLeft size={16} className="text-forest-800" />
            </button>
            <div className="font-body text-xs text-stone-warm flex items-center gap-1.5">
              <span className="truncate max-w-[180px] text-forest-800 font-semibold">{initial.name}</span>
              <span>/</span>
              <span>Receitas</span>
            </div>
          </div>
          <UserMenu inline />
        </div>

        <div className="animate-fade-up animate-fade-up-1">
          <RecipesCard
            groupId={initial.id}
            recipes={recipes}
            currentUserId={currentUserId}
            onRecipesChange={setRecipes}
            expandedView
          />
        </div>
      </div>
    </div>
  );
}
