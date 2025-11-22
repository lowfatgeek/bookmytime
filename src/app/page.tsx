import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Scheduling Made{' '}
            <span className="text-primary">Simple</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            BookMyTime makes it easy for people to schedule meetings with you.
            Share your availability and let others book time that works for everyone.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to schedule meetings
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              title="Easy Availability"
              description="Set your weekly availability once and we'll handle the rest."
            />
            <Feature
              title="Custom Event Types"
              description="Create different meeting types with custom durations and settings."
            />
            <Feature
              title="Timezone Support"
              description="Automatically converts times to your guests' timezone."
            />
            <Feature
              title="Email Notifications"
              description="Automatic confirmations and reminders for you and your guests."
            />
            <Feature
              title="Simple Booking"
              description="Your guests can book instantly without creating an account."
            />
            <Feature
              title="Dashboard"
              description="Manage all your bookings in one place with easy cancellation."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to simplify your scheduling?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of professionals who trust BookMyTime
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/signup">Start Free Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
