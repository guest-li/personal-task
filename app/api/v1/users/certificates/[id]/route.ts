import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthContext } from "@/server/middleware/with-auth";
import { prisma } from "@/server/db";
import { deleteFile } from "@/server/services/upload.service";
import { jsonError } from "@/server/http";

export const DELETE = withAuth<{ id: string }>(
  async (_req: NextRequest, { user, params }: AuthContext<{ id: string }>) => {
    const cert = await prisma.certificate.findFirst({
      where: { id: params.id, userId: user.sub },
    });

    if (!cert) {
      return jsonError("Certificate not found", 404);
    }

    await deleteFile(cert.fileUrl);
    await prisma.certificate.delete({ where: { id: cert.id } });

    return NextResponse.json({ message: "Certificate deleted" });
  },
);
