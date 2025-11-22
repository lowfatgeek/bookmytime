'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getEventTypes(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) return { error: error.message }
  return { data }
}

export async function createEventType(formData: {
  name: string
  duration_minutes: number
  description?: string
  location?: string
  buffer_before_minutes?: number
  buffer_after_minutes?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  const { error } = await supabase.from('event_types').insert({
    user_id: user.id,
    name: formData.name,
    duration_minutes: formData.duration_minutes,
    description: formData.description,
    location: formData.location,
    buffer_before_minutes: formData.buffer_before_minutes || 0,
    buffer_after_minutes: formData.buffer_after_minutes || 0,
    is_active: true,
  })
  
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/event-types')
  return { success: true }
}

export async function deleteEventType(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }
  
  const { error } = await supabase
    .from('event_types')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/event-types')
  return { success: true }
}
