'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Copy } from 'lucide-react'

interface EventType {
  id: string
  name: string
  duration_minutes: number
  description?: string
  location?: string
  is_active: boolean
}

interface EventTypesListProps {
  eventTypes: EventType[]
  bookingSlug: string
}

export function EventTypesList({ eventTypes, bookingSlug }: EventTypesListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyLink = async (eventId: string) => {
    const baseUrl = window.location.origin
    const bookingUrl = `${baseUrl}/${bookingSlug}/${eventId}`
    
    try {
      await navigator.clipboard.writeText(bookingUrl)
      setCopiedId(eventId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="grid gap-4">
      {eventTypes.map((event) => (
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
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopyLink(event.id)}
              >
                {copiedId === event.id ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Link
                  </>
                )}
              </Button>
              {!event.is_active && (
                <span className="text-sm text-muted-foreground ml-auto">Inactive</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
