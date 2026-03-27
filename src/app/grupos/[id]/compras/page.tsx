import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShoppingPageClient } from "@/components/group/ShoppingPageClient";

export default async function ShoppingPage({ params }: { params: { id: string } }) {
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
      shoppingItems: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!group) notFound();

  return <ShoppingPageClient group={group} />;
}
