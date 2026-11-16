import type { NextRequest } from "next/server";
import { exportProject } from "@/server/services/export.service";

// Batas respons fungsi Vercel sekitar 4,5 MB
const MAX_HTML_BYTES = 4 * 1024 * 1024;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ format: string }> }
) {
  const { format } = await context.params;
  if (format !== "docx" && format !== "pptx" && format !== "html") {
    return new Response("Unsupported format.", { status: 404 });
  }

  const id = request.nextUrl.searchParams.get("id") ?? "";

  try {
    const file = await exportProject(id, format);
    if (!file) return new Response("Not found.", { status: 404 });

    const bytes = new Uint8Array(file.buffer);
    if (format === "html" && bytes.byteLength > MAX_HTML_BYTES) {
      return new Response(
        "This project is too large for an offline file (limit about 4 MB). Remove or shrink some images and try again.",
        { status: 413 }
      );
    }

    return new Response(bytes, {
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