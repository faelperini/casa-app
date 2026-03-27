import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [dbUser, memberships] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, bio: true, birthDate: true },
    }),
    prisma.groupMember.findMany({
      where: { userId: session.user.id },
      include: { group: { include: { _count: { select: { members: true } } } } },
      orderBy: { joinedAt: "desc" },
    }),
  ]);

  const groups = memberships.map((m) => ({ ...m.group, role: m.role }));

  return <DashboardClient user={dbUser ?? session.user} groups={groups} />;
}
