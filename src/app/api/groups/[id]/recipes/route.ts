import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

async function assertMember(userId: string, groupId: string) {
  const m = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  return !!m;
}

// POST /api/groups/[id]/recipes
export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertMember(session.user.id, params.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, ingredients, steps, image } = await req.json();
  if (!title || !ingredients || !steps) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      ingredients,
      steps,
      image: image || null,
      authorId: session.user.id,
      groupId: params.id,
    },
  });
  return NextResponse.json(recipe, { status: 201 });
}

// DELETE /api/groups/[id]/recipes
export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertMember(session.user.id, params.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { recipeId } = await req.json();
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe || recipe.groupId !== params.id) {
    return NextResponse.json({ error: "Receita não encontrada" }, { status: 404 });
  }
  if (recipe.authorId !== session.user.id) {
    return NextResponse.json({ error: "Apenas o autor pode remover a receita" }, { status: 403 });
  }

  await prisma.recipe.delete({ where: { id: recipeId } });
  return NextResponse.json({ ok: true });
}
