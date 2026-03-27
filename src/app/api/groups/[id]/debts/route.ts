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

// POST /api/groups/[id]/debts — registra débito
export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertMember(session.user.id, params.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { description, amount, toUserId } = await req.json();
  if (!description || !amount || !toUserId) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const debt = await prisma.debt.create({
    data: {
      description: description.trim(),
      amount: Number(amount),
      fromUserId: session.user.id,
      toUserId,
      groupId: params.id,
    },
  });
  return NextResponse.json(debt, { status: 201 });
}

// PATCH /api/groups/[id]/debts — marcar como quitado
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertMember(session.user.id, params.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { debtId } = await req.json();
  const debt = await prisma.debt.update({
    where: { id: debtId },
    data: { status: "SETTLED" },
  });
  return NextResponse.json(debt);
}
