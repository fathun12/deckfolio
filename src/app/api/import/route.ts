import { NextResponse, type NextRequest } from "next/server";
import { importProjectFromFile } from "@/server/services/import.service";

export async function POST(request: NextRequest) {
  let file: FormDataEntryValue | null = null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file was uploaded." }, { status: 400 });
  }

  const result = await importProjectFromFile(file);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}