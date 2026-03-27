import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecipesPageClient } from "@/components/group/RecipesPageClient";

export default async function RecipesPage({ params }: { params: { id: string } }) {
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
      recipes: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!group) notFound();

  return <RecipesPageClient group={group} currentUserId={session.user.id} />;
}
