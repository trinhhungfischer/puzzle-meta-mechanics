import { signIn } from "@/auth"
import { Button } from "@/components/ui/Button"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="glass-panel p-8 rounded-2xl max-w-sm w-full text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/10 via-zinc-950 to-brand-fuchsia/10 z-0 pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-white">Admin Portal</h1>
          <p className="text-zinc-400 mb-8 text-sm">Sign in with an authorized Google account.</p>
          
          {resolvedParams.error === "AccessDenied" && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg mb-6 text-sm">
              Access denied. Your email is not in the allowlist.
            </div>
          )}

          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/admin" })
            }}
          >
            <Button type="submit" className="w-full">
              Sign in with Google
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <a href="/" className="text-zinc-500 text-sm hover:text-white transition-colors">
              &larr; Back to Catalog
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
