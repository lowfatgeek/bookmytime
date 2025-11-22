import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EventTypeForm } from '@/components/event-types/event-type-form'

export default async function NewEventTypePage() {
  const user = await getUser()
  if (!user) redirect('/login')

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Event Type</h1>
        <p className="text-muted-foreground">
          Define a new type of meeting for your booking page
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Configure the details for this event type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventTypeForm />
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button asChild variant="outline">
          <Link href="/dashboard/event-types">Cancel</Link>
        </Button>
      </div>
    </div>
  )
}
