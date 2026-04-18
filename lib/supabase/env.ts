type SupabaseEnv = {
  supabaseUrl: string
  supabaseAnonKey: string
}

function readEnvValue(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  return process.env[name]
}

function getEnvValue(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const value = readEnvValue(name)

  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`)
  }

  return value
}

export function hasSupabaseEnv() {
  return Boolean(
    readEnvValue("NEXT_PUBLIC_SUPABASE_URL") &&
      readEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  )
}

export function getSupabaseEnv(): SupabaseEnv {
  return {
    supabaseUrl: getEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  }
}
