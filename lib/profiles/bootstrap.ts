import type { User } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type EnsureProfileResult =
  | { ok: true }
  | { ok: false; message: string }

export async function ensureProfileForUser(user: Pick<User, "id">): Promise<EnsureProfileResult> {
  try {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
        } as never,
        {
          onConflict: "id",
          ignoreDuplicates: true,
        }
      )

    if (error) {
      return {
        ok: false,
        message: "We could not prepare your account profile right now. Please try again.",
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: "We could not prepare your account profile right now. Please try again.",
    }
  }
}
