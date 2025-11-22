'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format, addDays, startOfDay } from 'date-fns'
import { createAnonClient } from '@/lib/supabase/anon-client'

interface Availability {
  id: string
  day_of_week: string
  start_time: string
  end_time: string
}

interface BookingCalendarProps {
  userId: string
  eventDuration: number
  eventId: string
  eventName: string
  hostName: string
  location?: string
}

const DAYS_MAP: { [key: string]: number } = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}

export function BookingCalendar({ userId, eventDuration, eventId, eventName, hostName, location }: BookingCalendarProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availability, setAvailability] = useState<Availability[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  useEffect(() => {
    fetchAvailability()
  }, [userId])

  useEffect(() => {
    if (selectedDate && availability.length > 0) {
      generateTimeSlots(selectedDate)
    }
  }, [selectedDate, availability])

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/availability/${userId}`)
      const data = await response.json()
      setAvailability(data.availability || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching availability:', error)
      setLoading(false)
    }
  }

  const generateTimeSlots = (date: Date) => {
    const dayOfWeek = Object.keys(DAYS_MAP).find(
      (key) => DAYS_MAP[key] === date.getDay()
    )

    if (!dayOfWeek) {
      setAvailableSlots([])
      return
    }

    const dayAvailability = availability.filter(
      (a) => a.day_of_week === dayOfWeek
    )

    if (dayAvailability.length === 0) {
      setAvailableSlots([])
      return
    }

    const slots: string[] = []
    dayAvailability.forEach((avail) => {
      const [startHour, startMin] = avail.start_time.split(':').map(Number)
      const [endHour, endMin] = avail.end_time.split(':').map(Number)

      let currentMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin

      while (currentMinutes + eventDuration <= endMinutes) {
        const hour = Math.floor(currentMinutes / 60)
        const min = currentMinutes % 60
        const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        slots.push(timeString)
        currentMinutes += eventDuration
      }
    })

    setAvailableSlots(slots)
  }

  const isDateAvailable = (date: Date) => {
    const dayOfWeek = Object.keys(DAYS_MAP).find(
      (key) => DAYS_MAP[key] === date.getDay()
    )
    return availability.some((a) => a.day_of_week === dayOfWeek)
  }

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time)
    setError('')
    setIsDialogOpen(true)
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time')
      setIsSubmitting(false)
      return
    }

    try {
      // Combine date and time into a proper datetime
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const bookingDateTime = new Date(selectedDate)
      bookingDateTime.setHours(hours, minutes, 0, 0)

      // Calculate end time
      const endDateTime = new Date(bookingDateTime.getTime() + eventDuration * 60000)

      // Get user's timezone
      const guestTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

      // Create Supabase client for anonymous user
      const supabase = createAnonClient()

      // Insert booking directly using client
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          event_type_id: eventId,
          host_user_id: userId,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_timezone: guestTimezone,
          start_time_utc: bookingDateTime.toISOString(),
          end_time_utc: endDateTime.toISOString(),
          status: 'CONFIRMED',
        })
        .select()
        .single()

      if (bookingError) {
        console.error('Booking error:', bookingError)
        setError(bookingError.message)
        setIsSubmitting(false)
        return
      }

      // Success! Redirect to confirmation page
      const confirmationUrl = new URL('/booking-confirmed', window.location.origin)
      confirmationUrl.searchParams.set('eventName', eventName)
      confirmationUrl.searchParams.set('hostName', hostName)
      confirmationUrl.searchParams.set('date', selectedDate.toISOString())
      confirmationUrl.searchParams.set('time', selectedTime)
      confirmationUrl.searchParams.set('duration', eventDuration.toString())
      confirmationUrl.searchParams.set('location', location || '')
      confirmationUrl.searchParams.set('guestEmail', guestEmail)
      confirmationUrl.searchParams.set('guestName', guestName)
      
      router.push(confirmationUrl.toString())
      
    } catch (err: any) {
      console.error('Error creating booking:', err)
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading availability...</p>
      </div>
    )
  }

  if (availability.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-4">No availability configured yet</p>
        <p className="text-sm">
          The host needs to configure their availability first
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => {
            const isPast = date < startOfDay(new Date())
            const isTooFar = date > addDays(new Date(), 60)
            const notAvailable = !isDateAvailable(date)
            return isPast || isTooFar || notAvailable
          }}
          className="rounded-md border"
        />
      </div>

      {selectedDate && (
        <div>
          <h3 className="font-medium mb-3">
            Available times for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          {availableSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No available time slots for this date
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  onClick={() => handleTimeSlotClick(time)}
                  className="w-full"
                >
                  {time}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-sm text-muted-foreground text-center">
          Select a date to see available time slots
        </p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              {hostName} - {eventName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitBooking}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <div className="text-sm font-medium">
                  {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-name">Your Name *</Label>
                <Input
                  id="guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-email">Your Email *</Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
