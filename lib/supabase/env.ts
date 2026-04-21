type SupabaseEnv = {
  supabaseUrl: string
  supabasePublishableKey: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

function getConfiguredSupabaseKey() {
  return supabasePublishableKey ?? supabaseAnonKey
}

function getRequiredValue(
  value: string | undefined,
  missingVariableLabel: string
) {
  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${missingVariableLabel}`)
  }

  return value
}

export function hasSupabaseEnv() {
  return Boolean(supabaseUrl && getConfiguredSupabaseKey())
}

export function getSupabaseEnv(): SupabaseEnv {
  return {
    supabaseUrl: getRequiredValue(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    supabasePublishableKey: getRequiredValue(
      getConfiguredSupabaseKey(),
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ),
  }
}
