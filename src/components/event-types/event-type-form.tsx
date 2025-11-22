'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createEventType } from '@/lib/event-types/actions'

export function EventTypeForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    const result = await createEventType({
      name: formData.get('name') as string,
      duration_minutes: parseInt(formData.get('duration_minutes') as string),
      description: formData.get('description') as string || undefined,
      location: formData.get('location') as string || undefined,
      buffer_before_minutes: parseInt(formData.get('buffer_before_minutes') as string) || 0,
      buffer_after_minutes: parseInt(formData.get('buffer_after_minutes') as string) || 0,
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/dashboard/event-types')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name *</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g., 30-Minute Consultation"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
        <Input
          id="duration_minutes"
          name="duration_minutes"
          type="number"
          min="15"
          step="15"
          defaultValue="30"
          required
        />
        <p className="text-sm text-muted-foreground">
          Minimum 15 minutes
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Brief description of this meeting type"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location/Meeting Link</Label>
        <Input
          id="location"
          name="location"
          placeholder="e.g., Zoom, Google Meet, Phone"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buffer_before_minutes">Buffer Before (minutes)</Label>
          <Input
            id="buffer_before_minutes"
            name="buffer_before_minutes"
            type="number"
            min="0"
            step="5"
            defaultValue="0"
          />
          <p className="text-sm text-muted-foreground">
            Time to prepare before
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="buffer_after_minutes">Buffer After (minutes)</Label>
          <Input
            id="buffer_after_minutes"
            name="buffer_after_minutes"
            type="number"
            min="0"
            step="5"
            defaultValue="0"
          />
          <p className="text-sm text-muted-foreground">
            Time to wrap up after
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Event Type'}
        </Button>
      </div>
    </form>
  )
}
