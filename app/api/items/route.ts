import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ContentType, ItemStatus } from '@/types/database'

// Valid content types for validation
const VALID_CONTENT_TYPES: ContentType[] = ['link', 'tweet', 'image', 'note']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url, title, type } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate and determine content type (default to 'link' if invalid)
    const contentType: ContentType = VALID_CONTENT_TYPES.includes(type) ? type : 'link'

    // Insert item
    const { data: item, error } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        type: contentType,
        url,
        title: title || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    let query = supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Validate type parameter before using it
    if (type && VALID_CONTENT_TYPES.includes(type as ContentType)) {
      query = query.eq('type', type as ContentType)
    }
    // Validate status parameter before using it
    if (status && ['inbox', 'done', 'archived'].includes(status)) {
      query = query.eq('status', status as ItemStatus)
    }

    const { data: items, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
