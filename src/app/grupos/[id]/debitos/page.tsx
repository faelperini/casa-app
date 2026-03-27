import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DebtsPageClient } from "@/components/group/DebtsPageClient";

export default async function DebtsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId: params.id } },
  });
  if (!membership) notFound();

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      debts: { where: { status: "PENDING" }, orderBy: { createdAt: "desc" } },
      members: {
        include: { user: { select: { id: true, name: true, image: true, email: true } } },
      },
    },
  });
  if (!group) notFound();

  return <DebtsPageClient group={group} currentUserId={session.user.id} />;
}
