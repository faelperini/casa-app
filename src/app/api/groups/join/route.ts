import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { scryptSync, timingSafeEqual } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function verifyPassword(plain: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const hashBuffer = Buffer.from(hash, "hex");
    const derived = scryptSync(plain, salt, 64);
    return timingSafeEqual(hashBuffer, derived);
  } catch {
    return false;
  }
}

// POST /api/groups/join — entra num grupo via código
// Fase 1: { inviteCode } → retorna { requiresPassword: true, groupName } se for privado
// Fase 2: { inviteCode, password } → verifica senha e entra
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteCode, password } = await req.json();
  if (!inviteCode?.trim()) {
    return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });
  }

  const code = inviteCode.trim().toUpperCase().startsWith("#")
    ? inviteCode.trim()
    : `#${inviteCode.trim()}`;

  const group = await prisma.group.findUnique({ where: { inviteCode: code } });
  if (!group) {
    return NextResponse.json({ error: "Código inválido" }, { status: 404 });
  }

  const existing = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId: group.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Você já é membro deste grupo" }, { status: 409 });
  }

  // Casa privada: se não enviou senha ainda, pede
  if (group.isPrivate && !password) {
    return NextResponse.json({ requiresPassword: true, groupName: group.name }, { status: 200 });
  }

  // Casa privada com senha: verifica
  if (group.isPrivate && group.password) {
    const valid = verifyPassword(password, group.password);
    if (!valid) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }
  }

  await prisma.groupMember.create({
    data: { userId: session.user.id, groupId: group.id, role: "MEMBER" },
  });

  return NextResponse.json(group, { status: 200 });
}
