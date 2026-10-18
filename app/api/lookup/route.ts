import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    const normalized = String(phone ?? '').replace(/[\s()-]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(normalized)) return NextResponse.json({ error: 'Enter a valid phone number.' }, { status: 400 });
    const { data, error } = await supabase.from('customers').select('id').eq('phone', normalized).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'No account was found for that mobile number. Please check it or contact your administrator.' }, { status: 404 });
    return NextResponse.json({ found: true });
  } catch (e) { console.error('Phone lookup failed', e); return NextResponse.json({ error: 'Unable to check the account right now.' }, { status: 500 }); }
}
