import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const supabase = await createClient()

  const { data: availability, error } = await supabase
    .from('availability')
    .select('*')
    .eq('user_id', params.userId)
    .eq('is_active', true)
    .order('day_of_week')
    .order('start_time')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ availability })
}
