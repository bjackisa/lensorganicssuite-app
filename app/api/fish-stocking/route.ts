import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const body = await request.json();

    const { data, error } = await supabase
      .from('fish_stocking')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update pond current_stock
    if (body.fish_pond_id && body.quantity) {
      await supabase.rpc('increment_pond_stock', {
        pond_id: body.fish_pond_id,
        amount: body.quantity
      }).catch(() => {
        // If RPC doesn't exist, try direct update
        supabase
          .from('fish_ponds')
          .select('current_stock')
          .eq('id', body.fish_pond_id)
          .single()
          .then(({ data: pond }) => {
            if (pond) {
              supabase
                .from('fish_ponds')
                .update({ current_stock: (pond.current_stock || 0) + body.quantity })
                .eq('id', body.fish_pond_id);
            }
          });
      });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from('fish_stocking')
      .select('*, fish_ponds(pond_code)')
      .order('stocking_date', { ascending: false })
      .limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
