import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async signIn({ user }) {
      const allowedEmails = process.env.ADMIN_EMAIL_ALLOWLIST?.split(",").map(e => e.trim().toLowerCase()) || []
      
      if (user.email && allowedEmails.includes(user.email.toLowerCase())) {
        return true
      }
      return false
    },
  },
})
