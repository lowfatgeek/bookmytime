'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { DayOfWeek } from '@/types/database'

export async function getAvailability(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('day_of_week')
    .order('start_time')
  
  if (error) {
    return { error: error.message }
  }
  
  return { data }
}

export async function createAvailability(formData: {
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }
  
  // Validate time range
  if (formData.start_time >= formData.end_time) {
    return { error: 'End time must be after start time' }
  }
  
  const { error } = await supabase
    .from('availability')
    .insert({
      user_id: user.id,
      day_of_week: formData.day_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time,
      is_active: true,
    })
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/dashboard/availability')
  return { success: true }
}

export async function updateAvailability(id: string, formData: {
  start_time: string
  end_time: string
  is_active?: boolean
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }
  
  // Validate time range
  if (formData.start_time >= formData.end_time) {
    return { error: 'End time must be after start time' }
  }
  
  const { error } = await supabase
    .from('availability')
    .update({
      start_time: formData.start_time,
      end_time: formData.end_time,
      is_active: formData.is_active ?? true,
    })
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/dashboard/availability')
  return { success: true }
}

export async function deleteAvailability(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }
  
  const { error } = await supabase
    .from('availability')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/dashboard/availability')
  return { success: true }
}
