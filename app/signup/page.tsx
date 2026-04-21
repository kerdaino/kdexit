import AuthPageShell from "@/components/auth/auth-page-shell"
import EmailAuthForm from "@/components/auth/email-auth-form"

function getSafeRedirectPath(next: string | undefined) {
  if (!next || !next.startsWith("/")) {
    return "/dashboard"
  }

  return next
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <AuthPageShell
      eyebrow="Signup"
      title="Create an account for the next KDEXIT phase."
      description="This keeps the UI lightweight while giving us a real Supabase Auth entry point for secure beta rollout and future protected dashboard data."
    >
      <EmailAuthForm mode="signup" redirectPath={getSafeRedirectPath(next)} />
    </AuthPageShell>
  )
}
