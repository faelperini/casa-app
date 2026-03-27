import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/upload
// Recebe um FormData com o campo "file" (imagem)
// Faz upload para o Cloudinary e retorna a URL pública
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      { error: "Cloudinary não configurado. Adicione CLOUDINARY_CLOUD_NAME e CLOUDINARY_UPLOAD_PRESET ao .env.local" },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });

  // Valida tipo
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 });
  }

  // Valida tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Imagem deve ter no máximo 5MB" }, { status: 400 });
  }

  // Envia para o Cloudinary (unsigned upload)
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);
  body.append("folder", "casa-app");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.message ?? "Falha no upload" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ url: data.secure_url });
}
