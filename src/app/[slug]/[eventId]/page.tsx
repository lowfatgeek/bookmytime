import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingCalendar } from '@/components/booking/booking-calendar'

export default async function BookingPage({
  params,
}: {
  params: { slug: string; eventId: string }
}) {
  const supabase = await createClient()

  // Get user by booking slug
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('booking_slug', params.slug)
    .single()

  if (!user) notFound()

  // Get event type
  const { data: eventType } = await supabase
    .from('event_types')
    .select('*')
    .eq('id', params.eventId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!eventType) notFound()

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-5xl py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Host Info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{user.full_name}</CardTitle>
                <CardDescription>
                  {eventType.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Duration</h3>
                  <p className="text-sm text-muted-foreground">
                    {eventType.duration_minutes} minutes
                  </p>
                </div>

                {eventType.description && (
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {eventType.description}
                    </p>
                  </div>
                )}

                {eventType.location && (
                  <div>
                    <h3 className="font-medium mb-2">Location</h3>
                    <p className="text-sm text-muted-foreground">
                      {eventType.location}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Calendar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Select a Date & Time</CardTitle>
                <CardDescription>
                  Choose an available time slot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingCalendar 
                  userId={user.id} 
                  eventDuration={eventType.duration_minutes}
                  eventId={eventType.id}
                  eventName={eventType.name}
                  hostName={user.full_name}
                  location={eventType.location}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by BookMyTime</p>
        </div>
      </div>
    </div>
  )
}
