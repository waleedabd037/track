import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';

function normalizePhone(value: unknown) {
  return String(value ?? '').replace(/[\s()-]/g, '');
}

function validCustomer(name: string, phone: string, upi: string) {
  return Boolean(
    name && name.length <= 120 &&
    /^\+?[0-9]{7,15}$/.test(phone) &&
    upi.length <= 2000
  );
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabase
    .from('customers')
    .select('id,name,phone,upi,created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load customers.' }, { status: 500 });
  return NextResponse.json({ customers: data });
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const phone = normalizePhone(body.phone);
    const upi = String(body.upi ?? '').trim();
    if (!validCustomer(name, phone, upi)) {
      return NextResponse.json({ error: 'Enter a name, valid phone number, and UPI ID up to 2000 characters.' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('customers')
      .insert({ name, phone, upi: upi || null })
      .select('id,name,phone,upi')
      .single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'That phone number is already registered.' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ customer: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Could not create customer.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const id = String(body.id ?? '');
    const name = String(body.name ?? '').trim();
    const phone = normalizePhone(body.phone);
    const upi = String(body.upi ?? '').trim();
    if (!id || !validCustomer(name, phone, upi)) {
      return NextResponse.json({ error: 'Enter a name, valid phone number, and UPI ID up to 2000 characters.' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('customers')
      .update({ name, phone, upi: upi || null })
      .eq('id', id)
      .select('id,name,phone,upi')
      .maybeSingle();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'That phone number is already registered.' }, { status: 409 });
      throw error;
    }
    if (!data) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    return NextResponse.json({ customer: data });
  } catch {
    return NextResponse.json({ error: 'Could not update customer.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Customer ID is required.' }, { status: 400 });
  const { data, error } = await supabase.from('customers').delete().eq('id', id).select('id').maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not delete customer.' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
  // The loans table has ON DELETE CASCADE, so this also deletes this customer's loans.
  return NextResponse.json({ success: true });
}
