import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/actions'
import { getEventTypes } from '@/lib/event-types/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function EventTypesPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const result = await getEventTypes(user.id)
  const eventTypes = result.data || []

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Types</h1>
          <p className="text-muted-foreground">
            Manage your meeting types and booking options
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/event-types/new">Create Event Type</Link>
        </Button>
      </div>

      {eventTypes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any event types yet
            </p>
            <Button asChild>
              <Link href="/dashboard/event-types/new">Create Your First Event Type</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {eventTypes.map((event: any) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
                <CardDescription>
                  {event.duration_minutes} minutes
                  {event.location && ` • ${event.location}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {event.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="ghost">Copy Link</Button>
                  {!event.is_active && (
                    <span className="text-sm text-muted-foreground ml-auto">Inactive</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
