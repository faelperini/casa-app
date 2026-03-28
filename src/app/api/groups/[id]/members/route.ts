import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// DELETE /api/groups/[id]/members
// { userId } = remover outro membro (admin) ou sair (próprio userId)
export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json();
  const targetId = userId ?? session.user.id;

  const myMembership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId: params.id } },
  });
  if (!myMembership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const isSelf = targetId === session.user.id;

  // Membro tentando remover outra pessoa
  if (!isSelf && myMembership.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas admins podem remover membros" }, { status: 403 });
  }

  // Admin tentando sair
  if (isSelf && myMembership.role === "ADMIN") {
    const memberCount = await prisma.groupMember.count({ where: { groupId: params.id } });
    if (memberCount > 1) {
      return NextResponse.json(
        { error: "O dono não pode sair enquanto houver outros moradores" },
        { status: 400 }
      );
    }
    // Último membro — deleta o grupo inteiro
    await prisma.group.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  }

  await prisma.groupMember.delete({
    where: { userId_groupId: { userId: targetId, groupId: params.id } },
  });
  return NextResponse.json({ ok: true });
}
