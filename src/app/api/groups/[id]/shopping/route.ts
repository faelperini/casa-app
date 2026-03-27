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

// POST /api/groups/[id]/shopping — adiciona item
export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertMember(session.user.id, params.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, quantity } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

  const item = await prisma.shoppingItem.create({
    data: { name: name.trim(), quantity: quantity?.trim() || null, groupId: params.id },
  });
  return NextResponse.json(item, { status: 201 });
}

// PATCH /api/groups/[id]/shopping — toggle checked de um item
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertMember(session.user.id, params.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { itemId, checked } = await req.json();
  const item = await prisma.shoppingItem.update({
    where: { id: itemId },
    data: { checked },
  });
  return NextResponse.json(item);
}

// DELETE /api/groups/[id]/shopping — remove item
export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertMember(session.user.id, params.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { itemId } = await req.json();
  await prisma.shoppingItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
