import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { eventId, hostUserId, guestName, guestEmail, startTime, eventDuration } = body

    // Validate required fields
    if (!eventId || !hostUserId || !guestName || !guestEmail || !startTime || !eventDuration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate end time
    const startDateTime = new Date(startTime)
    const endDateTime = new Date(startDateTime.getTime() + eventDuration * 60000)

    // Get user's timezone (default to UTC for now)
    const guestTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        event_type_id: eventId,
        host_user_id: hostUserId,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_timezone: guestTimezone,
        start_time_utc: startDateTime.toISOString(),
        end_time_utc: endDateTime.toISOString(),
        status: 'CONFIRMED',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.json(
        { error: bookingError.message },
        { status: 500 }
      )
    }

    // TODO: Send confirmation email here
    // For now, just return success

    return NextResponse.json({ 
      success: true, 
      booking,
      message: 'Booking created successfully'
    })

  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    )
  }
}
