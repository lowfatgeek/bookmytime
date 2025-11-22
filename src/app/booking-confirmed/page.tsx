'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Calendar, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

export default function BookingConfirmedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  useEffect(() => {
    // Get booking details from URL params
    const details = {
      eventName: searchParams.get('eventName') || '',
      hostName: searchParams.get('hostName') || '',
      date: searchParams.get('date') || '',
      time: searchParams.get('time') || '',
      duration: searchParams.get('duration') || '30',
      location: searchParams.get('location') || '',
      guestEmail: searchParams.get('guestEmail') || '',
      guestName: searchParams.get('guestName') || '',
    }

    if (!details.eventName || !details.date) {
      // If no booking details, redirect to home
      router.push('/')
      return
    }

    setBookingDetails(details)
  }, [searchParams, router])

  const handleAddToGoogleCalendar = () => {
    if (!bookingDetails) return

    const startDate = new Date(bookingDetails.date)
    const [hours, minutes] = bookingDetails.time.split(':')
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    // Calculate end time using the actual event duration
    const duration = parseInt(bookingDetails.duration) || 30
    const endDate = new Date(startDate.getTime() + duration * 60000)

    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render')
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE')
    googleCalendarUrl.searchParams.set('text', `${bookingDetails.eventName} with ${bookingDetails.hostName}`)
    googleCalendarUrl.searchParams.set('dates', `${format(startDate, "yyyyMMdd'T'HHmmss")}/${format(endDate, "yyyyMMdd'T'HHmmss")}`)
    googleCalendarUrl.searchParams.set('details', `Meeting with ${bookingDetails.hostName}${bookingDetails.location ? `\nLocation: ${bookingDetails.location}` : ''}`)
    googleCalendarUrl.searchParams.set('location', bookingDetails.location || '')

    window.open(googleCalendarUrl.toString(), '_blank')
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-green-200 shadow-lg">
          <CardContent className="pt-12 pb-8">
            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            {/* Title */}
            <h1 className="text-center text-3xl font-bold mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Your meeting has been successfully scheduled
            </p>

            {/* Booking Details */}
            <div className="rounded-lg border bg-muted/50 p-6 space-y-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Event</p>
                <p className="text-lg font-semibold">{bookingDetails.eventName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">With</p>
                <p className="text-lg font-semibold">{bookingDetails.hostName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                <p className="text-lg font-semibold">
                  {format(new Date(bookingDetails.date), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-lg font-semibold">{bookingDetails.time}</p>
              </div>

              {bookingDetails.location && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="text-lg font-semibold">{bookingDetails.location}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Attendee</p>
                <p className="font-medium">{bookingDetails.guestName}</p>
                <p className="text-sm text-muted-foreground">{bookingDetails.guestEmail}</p>
              </div>
            </div>

            {/* Email Notification Note */}
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 mb-8">
              <p className="font-medium mb-1">📧 Email Confirmation</p>
              <p className="text-blue-700">
                Email confirmation of your booking is coming soon!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push('/')}
                variant="default"
                size="lg"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={handleAddToGoogleCalendar}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Add to Google Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          You can close this page or navigate back to the homepage
        </p>
      </div>
    </div>
  )
}
