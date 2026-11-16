import type { NextRequest } from "next/server";
import { exportProject } from "@/server/services/export.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ format: string }> }
) {
  const { format } = await context.params;
  if (format !== "docx" && format !== "pptx") {
    return new Response("Unsupported format.", { status: 404 });
  }

  const id = request.nextUrl.searchParams.get("id") ?? "";

  try {
    const file = await exportProject(id, format);
    if (!file) return new Response("Not found.", { status: 404 });

    return new Response(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": file.mime,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Export failed.", { status: 500 });
  }
}