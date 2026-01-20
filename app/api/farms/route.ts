import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const body = await request.json();

    const { data, error } = await supabase
      .from('farms')
      .insert([{
        name: body.name,
        code: body.code,
        location: body.location,
        total_acreage: body.total_acreage,
        description: body.description,
        status: body.status || 'active',
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating farm:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/farms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching farms:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/farms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
