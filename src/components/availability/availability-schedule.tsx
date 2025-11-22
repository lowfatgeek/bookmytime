'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAvailability, deleteAvailability } from '@/lib/availability/actions'

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

interface TimeSlot {
  id: string
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  is_active: boolean
}

interface AvailabilityScheduleProps {
  availability: TimeSlot[]
  days: Array<{ value: string; label: string }>
}

export function AvailabilitySchedule({ availability, days }: AvailabilityScheduleProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleAddTime = (dayValue: string) => {
    setSelectedDay(dayValue)
    setStartTime('09:00')
    setEndTime('17:00')
    setError('')
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const result = await createAvailability({
      day_of_week: selectedDay as DayOfWeek,
      start_time: startTime,
      end_time: endTime,
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsDialogOpen(false)
    }
  }

  const handleRemove = async (slotId: string) => {
    if (!confirm('Are you sure you want to remove this time slot?')) {
      return
    }

    await deleteAvailability(slotId)
  }

  return (
    <>
      <div className="space-y-4">
        {days.map((day) => {
          const daySlots = availability.filter((a) => a.day_of_week === day.value)
          return (
            <div key={day.value} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{day.label}</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddTime(day.value)}
                >
                  Add Time
                </Button>
              </div>
              {daySlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Unavailable</p>
              ) : (
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between text-sm">
                      <span>
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(slot.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Available Time</DialogTitle>
            <DialogDescription>
              Add a time slot for {days.find(d => d.value === selectedDay)?.label}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
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
                {isSubmitting ? 'Adding...' : 'Add Time Slot'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
