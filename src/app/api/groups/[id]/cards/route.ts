import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveCardOrder } from "@/lib/cards";

type Params = { params: { id: string } };

// PATCH /api/groups/[id]/cards — ordem dos cards do morador logado nesta casa
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { order } = await req.json();
  if (!Array.isArray(order) || !order.every((k) => typeof k === "string")) {
    return NextResponse.json({ error: "Ordem inválida" }, { status: 400 });
  }

  // Grava só na associação do próprio usuário nesta casa: autoriza e atualiza numa query só
  const { count } = await prisma.groupMember.updateMany({
    where: { userId: session.user.id, groupId: params.id },
    data: { cardOrder: resolveCardOrder(order) },
  });
  if (count === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ ok: true });
}
