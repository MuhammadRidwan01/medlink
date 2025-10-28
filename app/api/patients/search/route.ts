import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ patients: [] });

  const like = `%${q}%`;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, phone")
    .or(`email.ilike.${like},name.ilike.${like},phone.ilike.${like}`)
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ patients: data ?? [] });
}
