"use client";
import { useState } from "react";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { BookOpen, Plus, Trash2, ChevronDown, ChevronUp, Maximize2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Recipe = { id: string; title: string; description: string | null; ingredients: string; steps: string; image: string | null; authorId: string };

type Props = {
  groupId: string;
  recipes: Recipe[];
  currentUserId: string;
  onRecipesChange: (recipes: Recipe[]) => void;
  onExpand?: () => void;
  expandedView?: boolean;
};

export function RecipesCard({ groupId, recipes, currentUserId, onRecipesChange, onExpand, expandedView }: Props) {
  const isDesktop = useIsDesktop();
  const [showAdd, setShowAdd]       = useState(false);
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);
  const [title, setTitle]           = useState("");
  const [desc, setDesc]             = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function addRecipe() {
    if (!title.trim() || !ingredients.trim() || !steps.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc, ingredients, steps }),
      });
      if (res.ok) {
        const recipe = await res.json();
        onRecipesChange([recipe, ...recipes]);
        setTitle(""); setDesc(""); setIngredients(""); setSteps(""); setShowAdd(false);
      }
    } finally { setLoading(false); }
  }

  async function deleteRecipe(recipeId: string) {
    const res = await fetch(`/api/groups/${groupId}/recipes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId }),
    });
    if (res.ok) onRecipesChange(recipes.filter((r) => r.id !== recipeId));
  }

  return (
    <div className="card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-terra-400/10 flex items-center justify-center">
            <BookOpen size={15} className="text-terra-500" />
          </div>
          <h2 className="font-display font-bold text-forest-800">Receitas</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {onExpand && (
            <button onClick={onExpand}
              className="w-7 h-7 rounded-lg bg-cream-100 border border-cream-200 flex items-center justify-center
                         hover:bg-cream-200 transition-colors cursor-pointer">
              <Maximize2 size={13} className="text-forest-700" />
            </button>
          )}
          <button onClick={() => setShowAdd(true)}
            className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center
                       hover:bg-forest-700 transition-colors cursor-pointer">
            <Plus size={14} className="text-cream-50" />
          </button>
        </div>
      </div>

      {/* Empty */}
      {recipes.length === 0 && (
        <p className="font-body text-xs text-stone-warm text-center py-6">
          Nenhuma receita ainda. Adicione a favorita da casa!
        </p>
      )}

      {/* List */}
      <div className={`flex-1 space-y-1.5 overflow-y-auto ${expandedView ? "" : "max-h-64"}`}>
        {recipes.map((recipe) => (
          <div key={recipe.id}
            className="bg-cream-100 rounded-xl overflow-hidden group">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <button onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
                className="flex-1 flex items-center gap-2 text-left cursor-pointer min-w-0">
                <span className="font-body text-sm font-semibold text-forest-800 truncate">{recipe.title}</span>
                {expandedId === recipe.id
                  ? <ChevronUp size={13} className="text-stone-warm flex-shrink-0" />
                  : <ChevronDown size={13} className="text-stone-warm flex-shrink-0" />}
              </button>
              <button onClick={() => setViewRecipe(recipe)}
                className="font-body text-xs text-terra-500 hover:text-terra-600 transition-colors cursor-pointer flex-shrink-0">
                Ver
              </button>
              {recipe.authorId === currentUserId && (
                <button onClick={() => deleteRecipe(recipe.id)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-cream-200
                             flex items-center justify-center transition-all cursor-pointer flex-shrink-0">
                  <Trash2 size={12} className="text-terra-400" />
                </button>
              )}
            </div>
            {expandedId === recipe.id && (
              <div className="px-3 pb-3 text-xs font-body text-stone-warm space-y-1 animate-fade-up">
                {recipe.description && <p className="italic">{recipe.description}</p>}
                <p className="font-semibold text-forest-700">Ingredientes:</p>
                <Md className="text-xs">{recipe.ingredients}</Md>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add recipe modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nova receita">
        <div className="space-y-3">
          <div>
            <label className="label">Título *</label>
            <input className="input" placeholder="Ex: Bolo de cenoura" value={title}
              onChange={(e) => setTitle(e.target.value)} autoFocus={isDesktop} />
          </div>
          <div>
            <label className="label">Descrição</label>
            <input className="input" placeholder="Uma frase sobre a receita..."
              value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div>
            <label className="label">Ingredientes *</label>
            <textarea className="input resize-none" rows={4}
              placeholder={"2 xícaras de farinha\n3 ovos\n..."}
              value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
          </div>
          <div>
            <label className="label">Modo de preparo *</label>
            <textarea className="input resize-none" rows={4}
              placeholder={"1. Pré-aqueça o forno\n2. Misture os ingredientes\n..."}
              value={steps} onChange={(e) => setSteps(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={addRecipe} disabled={loading || !title || !ingredients || !steps}
              className="btn-primary flex-1">{loading ? "Salvando…" : "Salvar receita"}</button>
          </div>
        </div>
      </Modal>

      {/* View recipe modal */}
      {viewRecipe && (
        <Modal open={!!viewRecipe} onClose={() => setViewRecipe(null)} title={viewRecipe.title}>
          <div className="space-y-4 max-h-[60vh] md:max-h-[75vh] overflow-y-auto pr-1">
            {viewRecipe.description && (
              <p className="font-body text-sm text-stone-warm italic">{viewRecipe.description}</p>
            )}
            <div>
              <p className="label">Ingredientes</p>
              <Md>{viewRecipe.ingredients}</Md>
            </div>
            <div>
              <p className="label">Modo de preparo</p>
              <Md>{viewRecipe.steps}</Md>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Md({ children, className = "text-sm" }: { children: string; className?: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p:      ({ children }) => <p className={`font-body ${className} text-forest-800 mb-1 last:mb-0`}>{children}</p>,
        ul:     ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-1">{children}</ul>,
        ol:     ({ children }) => <ol className="list-decimal list-inside space-y-0.5 mb-1">{children}</ol>,
        li:     ({ children }) => <li className={`font-body ${className} text-forest-800`}>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-forest-800">{children}</strong>,
        em:     ({ children }) => <em className="italic text-stone-warm">{children}</em>,
        h1:     ({ children }) => <p className="font-display font-bold text-forest-800 text-base mb-1">{children}</p>,
        h2:     ({ children }) => <p className="font-display font-bold text-forest-800 text-sm mb-1">{children}</p>,
        h3:     ({ children }) => <p className="font-semibold text-forest-800 text-sm mb-1">{children}</p>,
        hr:     () => <hr className="border-cream-200 my-2" />,
        code:   ({ children }) => <code className="bg-cream-200 rounded px-1 text-xs font-mono">{children}</code>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
