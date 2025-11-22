import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/actions'
import { getAvailability } from '@/lib/availability/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const DAYS: Array<{ value: string; label: string }> = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
]

export default async function AvailabilityPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const result = await getAvailability(user.id)
  const availability = result.data || []

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-muted-foreground">
          Set your weekly availability for booking appointments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Configure when you&apos;re available for meetings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map((day) => {
            const daySlots = availability.filter((a: any) => a.day_of_week === day.value)
            return (
              <div key={day.value} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{day.label}</h3>
                  <Button size="sm" variant="outline">
                    Add Time
                  </Button>
                </div>
                {daySlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map((slot: any) => (
                      <div key={slot.id} className="flex items-center justify-between text-sm">
                        <span>
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </span>
                        <Button size="sm" variant="ghost">Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
