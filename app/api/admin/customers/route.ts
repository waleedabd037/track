import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('customers').select('id,name,phone,created_at').order('created_at',{ascending:false});
  if (error) return NextResponse.json({ error: 'Could not load customers.' }, { status: 500 });
  return NextResponse.json({ customers: data });
}
export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json(); const name = String(body.name ?? '').trim(); const phone = String(body.phone ?? '').replace(/[\s()-]/g,'');
    if (!name || name.length > 120 || !/^\+?[0-9]{7,15}$/.test(phone)) return NextResponse.json({ error: 'Enter a name and a valid phone number.' }, { status: 400 });
    const { data, error } = await supabase.from('customers').insert({name,phone}).select('id,name,phone').single();
    if (error) { if (error.code === '23505') return NextResponse.json({ error: 'That phone number is already registered.' }, { status: 409 }); throw error; }
    return NextResponse.json({ customer: data }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Could not create customer.' }, { status: 500 }); }
}
