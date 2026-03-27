import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { scryptSync, randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// GET /api/groups — lista grupos do usuário logado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json(memberships.map((m) => ({ ...m.group, role: m.role })));
}

// POST /api/groups — cria novo grupo
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, image, isPrivate, password } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

  if (isPrivate) {
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres" }, { status: 400 });
    }
    if (!/\d/.test(password)) {
      return NextResponse.json({ error: "Senha deve conter pelo menos 1 número" }, { status: 400 });
    }
  }

  // Gera código único #NNNN
  let inviteCode: string;
  let attempts = 0;
  do {
    const num = Math.floor(1000 + Math.random() * 9000);
    inviteCode = `#${num}`;
    const exists = await prisma.group.findUnique({ where: { inviteCode } });
    if (!exists) break;
    attempts++;
  } while (attempts < 10);

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      image: image ?? null,
      inviteCode: inviteCode!,
      isPrivate: !!isPrivate,
      password: isPrivate && password ? hashPassword(password) : null,
      members: {
        create: {
          userId: session.user.id,
          role: "ADMIN",
        },
      },
    },
  });

  return NextResponse.json(group, { status: 201 });
}
