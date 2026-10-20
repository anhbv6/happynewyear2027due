import { reduce } from "@/lib/reducer";
import { readState, updateState } from "@/lib/server/db";
import type { Action } from "@/lib/types";

export async function GET() {
  return Response.json(await readState());
}

export async function POST(request: Request) {
  let action: Action;
  try {
    action = await request.json();
    if (typeof action?.type !== "string") throw new Error();
  } catch {
    return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  try {
    return Response.json(await updateState((s) => reduce(s, action)));
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Lỗi lưu dữ liệu" }, { status: 500 });
  }
}
