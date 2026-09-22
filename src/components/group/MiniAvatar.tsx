import Image from "next/image";
import { User } from "lucide-react";

export function MiniAvatar({ img }: { img: string | null }) {
  return img ? (
    <Image src={img} alt="avatar" width={28} height={28} className="rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="w-7 h-7 rounded-full bg-cream-300 flex items-center justify-center flex-shrink-0">
      <User size={13} className="text-stone-warm" />
    </div>
  );
}
