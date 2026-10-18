import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function POST(request: Request) {
  try {
    const { phone } = await request.json(); const normalized = String(phone ?? '').replace(/[\s()-]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(normalized)) return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 });
    const { data: customer, error: customerError } = await supabase.from('customers').select('id,name,phone,upi').eq('phone', normalized).maybeSingle();
    if (customerError) throw customerError;
    if (!customer) return NextResponse.json({ error: 'Account not found. Return to the home page and try again.' }, { status: 404 });
    const { data: loans, error } = await supabase.from('loans').select('id,title,total_amount,returned_amount,due_date,status').eq('customer_id', customer.id).order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ name: customer.name, phone: customer.phone, upi: customer.upi ?? null, loans: loans ?? [] });
  } catch (e) { console.error('Loan fetch failed', e); return NextResponse.json({ error: 'Unable to load loan details right now.' }, { status: 500 }); }
}
