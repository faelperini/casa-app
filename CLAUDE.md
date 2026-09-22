# Casa — contexto para o Claude Code

App web para moradores de uma mesma casa organizarem **lista de compras**, **débitos** e **receitas**.
Login só com Google. Um "grupo" no código é uma **"casa"** na interface; "membros" são **"moradores"**.

> **Regra de manutenção (importante):** ao concluir qualquer mudança relevante (schema, rota de API, feature,
> decisão de arquitetura, bug corrigido), atualize [docs/ER.md](docs/ER.md): o modelo de dados se o schema mudou
> e uma nova entrada datada em "Registro de atualizações". Decisões novas vão em "Decisões". Este arquivo só muda
> quando stack, convenções ou estrutura mudam.

Leia [docs/ER.md](docs/ER.md) antes de mexer no schema Prisma, nas rotas de API ou em permissões — ele tem o
diagrama ER, o dicionário de dados, a matriz de permissões, as decisões e os problemas conhecidos.

## Stack

Next.js 14 (App Router) · TypeScript strict · Tailwind CSS 3 · Prisma 5 + PostgreSQL (Neon) · NextAuth v4
(Google, sessão JWT + PrismaAdapter) · Cloudinary (upload de imagens) · Vercel · lucide-react ·
react-markdown + remark-gfm (receitas) · @dnd-kit core/sortable/utilities/modifiers (reordenar os cards da casa).
Sem biblioteca de testes.

## Comandos

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # next build (na Vercel: npx prisma generate && next build)
npm run lint         # next lint
npm run db:generate  # prisma generate
npm run db:push      # prisma db push  ← é assim que o schema é aplicado hoje
npm run db:migrate   # prisma migrate dev (prisma/migrations/ está no .gitignore)
npm run db:studio    # prisma studio
```

Ambiente de desenvolvimento: Windows (PowerShell/Git Bash). Branch principal: `main`.

## Variáveis de ambiente (só nomes — `.env` é ignorado pelo git; nunca ler/commitar valores)

`DATABASE_URL` (runtime) · `DIRECT_URL` (`directUrl` do Prisma, para `db push`/migrate) · `GOOGLE_CLIENT_ID` ·
`GOOGLE_CLIENT_SECRET` · `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_UPLOAD_PRESET` (unsigned) ·
`NEXTAUTH_URL` e `NEXTAUTH_SECRET` (exigidos pelo NextAuth em produção; não aparecem no código).

## Estrutura

```
prisma/schema.prisma            modelo de dados (fonte da verdade — ver docs/ER.md)
src/middleware.ts               protege /dashboard/* e /grupos/* (next-auth/middleware)
src/lib/auth.ts                 authOptions do NextAuth (Google, JWT, session.user.id = token.sub)
src/lib/prisma.ts               singleton do PrismaClient
src/lib/debts.ts                tipo Debt + computeBalances (saldo líquido por pessoa, em centavos inteiros)
src/lib/cards.ts                CARD_KEYS + resolveCardOrder (ordem dos cards; tolera chave nova/removida)
src/types/next-auth.d.ts        adiciona user.id à Session
src/hooks/useIsDesktop.ts       true só com ponteiro preciso (evita autoFocus que abre teclado no mobile)
src/app/
  page.tsx                      redireciona para /dashboard ou /login
  login/                        botão "Continuar com o Google"
  dashboard/                    server component → DashboardClient (lista de casas, criar/entrar, perfil)
  grupos/[id]/                  página da casa (GroupClient) + subpáginas mobile: compras/, debitos/, receitas/
  api/                          rotas REST (tabela abaixo)
src/components/
  dashboard/                    DashboardClient, ProfilePanel
  group/                        GroupClient, CardsGrid (ordem + modo reordenar), MembersBar,
                                {Shopping,Debts,Recipes}Card e ...PageClient, DebtBalances, MiniAvatar
  ui/                           Modal (portal), ImageUpload, UserMenu, Footer
```

**Padrão página → cliente:** cada `page.tsx` é um server component que valida sessão + associação ao grupo
(`redirect("/login")` / `notFound()`), busca dados com Prisma e entrega a um `*Client` (`"use client"`) que guarda o
estado local e chama a API com `fetch`. Não há tempo real: mudanças de outros moradores só aparecem ao recarregar.

**Padrão responsivo:** em `< 1024px` o botão "expandir" de um card navega para a subpágina
(`/grupos/[id]/compras|debitos|receitas`); em `≥ 1024px` abre um `Modal` com o mesmo card em modo expandido.

## API

Todas exigem sessão (`getServerSession(authOptions)` → 401). "membro" = existe `GroupMember(userId, groupId)` (→ 403).

| Método | Rota | Quem | O que faz |
|---|---|---|---|
| GET / POST | `/api/groups` | login | lista as casas do usuário / cria casa (criador = ADMIN, gera `#NNNN`, hash scrypt se privada) |
| POST | `/api/groups/join` | login | entra por código, em 2 fases: sem senha → `{requiresPassword, groupName}`; com senha → entra |
| GET / PATCH / DELETE | `/api/groups/[id]` | membro / ADMIN / ADMIN | casa completa / edita nome, descrição, imagem / exclui (cascade) |
| DELETE | `/api/groups/[id]/members` | membro | body `{userId?}`: ADMIN remove alguém, membro sai; ADMIN só sai se for o último (apaga a casa) |
| POST / PATCH / DELETE | `/api/groups/[id]/shopping` | membro | adiciona `{name, quantity}` / alterna `{itemId, checked}` / remove `{itemId}` |
| POST / PATCH | `/api/groups/[id]/debts` | membro | cria `{description, amount, toUserId}` / quita `{debtId}` ou em lote `{debtIds}` (só PENDING da casa em que o usuário é parte; responde `{count}`) |
| POST / DELETE | `/api/groups/[id]/recipes` | membro | cria / remove `{recipeId}` (só o autor) |
| PATCH | `/api/groups/[id]/cards` | membro | salva `{order}` (ordem dos cards **deste** morador nesta casa; `updateMany` na própria associação autoriza e grava) |
| GET / PATCH | `/api/user` | login | perfil / atualiza `{name, bio, birthDate}` |
| POST | `/api/upload` | login | multipart `file` → Cloudinary (unsigned, imagem ≤ 5 MB) → `{url}` |
| GET / POST | `/api/auth/[...nextauth]` | — | NextAuth |

Rotas com sub-recurso usam o método HTTP + **body JSON** para identificar o item (não há `/shopping/[itemId]`).

## Convenções

- **Idiomas:** interface, mensagens de erro da API e comentários em **português (pt-BR)**; identificadores em inglês;
  URLs de páginas em português (`/grupos`, `/compras`, `/debitos`, `/receitas`), URLs de API em inglês (`/api/groups`).
- **Commits:** inglês, estilo conventional commits (`feat:`, `fix:`).
- **Alias:** `@/*` → `src/*`. TypeScript `strict`. ESLint só com `next/core-web-vitals` — **não** adicionar regras de
  `@typescript-eslint` (quebrou o build da Vercel; ver commit `58f6797`).
- **Rotas de API:** repetir o padrão existente — checar sessão, checar `GroupMember` via chave composta
  `userId_groupId`, validar body, responder `NextResponse.json(..., { status })`. O helper `assertMember` está
  duplicado em shopping/debts/recipes.
- **Card novo na página da casa:** acrescentar a chave em `CARD_KEYS` (`src/lib/cards.ts`), o nó em `cards={{…}}` no
  `GroupClient` e o título/ícone em `CARD_META` (`CardsGrid.tsx`). `resolveCardOrder` põe o card no fim para quem já
  salvou uma ordem — nada de migração de dados.
- **Tipos:** declarados localmente em cada componente (não há arquivo de tipos compartilhado).
- **Ícones:** `lucide-react`. **Imagens:** `next/image` só com hosts liberados em `next.config.js`
  (`*.googleusercontent.com`, `res.cloudinary.com`).

## Design system (Tailwind, tema "quente e orgânico")

- Cores: `cream` (50–300, fundos), `forest` (700–900, texto/botão primário), `terra` (400–600, destaque/ação
  destrutiva), `stone-warm` (texto secundário). Definidas em `tailwind.config.js` **e** como CSS vars em `globals.css`.
- Fontes: `font-display` = Fraunces (títulos), `font-body` = Plus Jakarta Sans.
- Classes utilitárias (em `globals.css`): `.card`, `.btn-primary`, `.btn-secondary`, `.btn-terra`, `.input`, `.label`,
  `.grain` (textura), `.animate-fade-up` + `-1…-5` (atraso escalonado). Use `min-h-dvh`, não `min-h-screen`.
- Listas roláveis dentro de `.card` (`overflow-y-auto max-h-64`) levam `pr-2 -mr-2`: a barra de rolagem (6px, custom em
  `globals.css`) fica no padding do card em vez de encostar nos itens. Já aplicado em Compras, Débitos e Receitas —
  manter em qualquer lista rolável nova.
- Inputs têm 16px em ponteiro `coarse` (evita zoom do iOS) — não sobrescrever.

## Armadilhas (leia antes de codar)

1. **Direção do `Debt` é contraintuitiva:** `fromUserId` = **credor** (quem criou / a quem devem) e `toUserId` =
   **devedor**. A UI ("Você deve R$ X a …") depende disso. Detalhes em docs/ER.md.
2. **Nunca devolva `Group` inteiro para o cliente sem omitir `password`** (hash scrypt). Hoje vários pontos vazam —
   ver "Problemas conhecidos" em docs/ER.md; ao mexer neles, use `select`/omit.
3. **Todo item filho deve ser verificado contra o grupo da URL** (`item.groupId === params.id`). Hoje só `recipes` e o
   quitar em lote (`PATCH debts {debtIds}`) fazem isso; shopping e o `PATCH debts {debtId}` não.
4. `Debt.fromUserId`, `Debt.toUserId` e `Recipe.authorId` **não têm FK** para `User` (são strings soltas).
5. O schema é aplicado com `db push` e `prisma/migrations/` é ignorado pelo git — não há histórico de migrações.
