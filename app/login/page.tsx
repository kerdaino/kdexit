import AuthPageShell from "@/components/auth/auth-page-shell"
import EmailAuthForm from "@/components/auth/email-auth-form"

function getSafeRedirectPath(next: string | undefined) {
  if (!next || !next.startsWith("/")) {
    return "/dashboard"
  }

  return next
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <AuthPageShell
      eyebrow="Login"
      title="Return to your KDEXIT workspace."
      description="Use the new auth foundation to sign in with email and password while the dashboard continues to evolve toward a fully authenticated beta backend."
    >
      <EmailAuthForm mode="login" redirectPath={getSafeRedirectPath(next)} />
    </AuthPageShell>
  )
}
