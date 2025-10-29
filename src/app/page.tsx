import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        Unlock Opportunities with <span className="text-primary">LaunchPath</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Discover scholarships, admissions, grants, and seed funding programs to build your future.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/admissions">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg">Sign In</Button>
        </Link>
      </div>
    </section>
  )
}
