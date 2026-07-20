import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const publicPaths = ["/", "/login", "/signup", "/auth", "/api", "/demo", "/label", "/scan"]

function isPublicPath(path: string) {
  return publicPaths.some((p) => path === p || path.startsWith(p + "/"))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) return NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (request.cookies.has("hybridx-dev-auth")) return NextResponse.next()

    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("setup", "true")
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
