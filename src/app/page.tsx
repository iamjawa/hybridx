import Link from "next/link"
import { Sprout, Leaf, GitMerge, Sparkles, ArrowRight, Play } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-5" />
            </div>
            <span className="font-semibold">HybridX</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/demo" className="text-sm text-muted-foreground hover:text-foreground">Demo</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link href="/signup" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Get Started</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-24 pb-16 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            The operating system for plant breeders
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            From cross to cultivar.
            <br />
            <span className="text-primary">Ship better varieties.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Track pedigrees, record crosses, evaluate seedlings, and manage your entire breeding programme
            from a single workspace — built for breeders who ship.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/demo" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Play className="mr-2 size-4" />
              Explore Demo
            </Link>
            <Link href="/signup" className="inline-flex h-11 items-center justify-center rounded-lg border bg-background px-8 text-sm font-medium hover:bg-muted">
              Start Your Programme
            </Link>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Leaf, title: "Plant Management", desc: "Track your breeding stock with full pedigree, trait data, and inventory." },
              { icon: GitMerge, title: "Cross Planning", desc: "Design crosses, track pollinations, and manage seed batches from one view." },
              { icon: Sparkles, title: "Seedling Evaluation", desc: "Score, rank, and select your best seedlings with structured evaluation systems." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border p-6">
                <Icon className="mb-4 size-8 text-primary" />
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        HybridX — built for breeders who ship.
      </footer>
    </div>
  )
}
