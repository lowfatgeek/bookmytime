'use client'

import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'

interface BookingSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  bookingDetails: {
    date: Date
    time: string
    guestEmail: string
    guestName: string
    eventName: string
    hostName: string
    location?: string
  }
}

export function BookingSuccessDialog({
  isOpen,
  onClose,
  bookingDetails,
}: BookingSuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Booking Confirmed!</DialogTitle>
          <DialogDescription className="text-center">
            Your meeting has been successfully scheduled
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Event</p>
              <p className="font-medium">{bookingDetails.eventName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">With</p>
              <p className="font-medium">{bookingDetails.hostName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-medium">
                {format(bookingDetails.date, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="font-medium">{bookingDetails.time}</p>
            </div>

            {bookingDetails.location && (
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{bookingDetails.location}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Confirmation sent to</p>
              <p className="font-medium">{bookingDetails.guestEmail}</p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">📝 Save Your Booking Details</p>
            <p className="text-blue-700">
              Please save the booking details above. Email notifications are coming soon!
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/'
            }}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
