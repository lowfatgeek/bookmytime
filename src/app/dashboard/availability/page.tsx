import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/actions'
import { getAvailability } from '@/lib/availability/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AvailabilitySchedule } from '@/components/availability/availability-schedule'

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
        <CardContent>
          <AvailabilitySchedule availability={availability} days={DAYS} />
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
