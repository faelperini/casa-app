import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, bio: true, birthDate: true, createdAt: true },
  });
  return NextResponse.json(user);
}

// PATCH /api/user
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, bio, birthDate } = await req.json();

    const data: { name?: string; bio?: string; birthDate?: Date | null } = {};
    if (name !== undefined) data.name = String(name).trim();
    if (bio  !== undefined) data.bio  = String(bio).trim();
    if (birthDate !== undefined) data.birthDate = birthDate ? new Date(`${birthDate}T12:00:00Z`) : null;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true, image: true, bio: true, birthDate: true },
    });
    return NextResponse.json(user);
  } catch (e) {
    console.error("[PATCH /api/user]", e);
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
