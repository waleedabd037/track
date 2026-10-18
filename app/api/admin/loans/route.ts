import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';

function parseLoan(body: Record<string, unknown>) {
  const customer_id = String(body.customer_id ?? '');
  const title = String(body.title ?? '').trim();
  const due_date = body.due_date ? String(body.due_date) : null;
  const total_amount = Number(body.total_amount);
  const returned_amount = Number(body.returned_amount);
  const status = String(body.status ?? 'Unsettled');
  const valid = Boolean(
    customer_id && title && title.length <= 120 &&
    Number.isFinite(total_amount) && total_amount > 0 &&
    Number.isFinite(returned_amount) && returned_amount >= 0 && returned_amount <= total_amount &&
    ['Lending', 'Unsettled', 'Completed'].includes(status) &&
    (!due_date || /^\d{4}-\d{2}-\d{2}$/.test(due_date))
  );
  return { customer_id, title, due_date, total_amount, returned_amount, status, valid };
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabase
    .from('loans')
    .select('id,customer_id,title,total_amount,returned_amount,due_date,status,created_at,customers(name,phone)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Could not load loans.' }, { status: 500 });
  return NextResponse.json({ loans: data });
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const loan = parseLoan(body);
    if (!loan.valid) return NextResponse.json({ error: 'Check the loan details and amounts. Returned amount cannot exceed total amount.' }, { status: 400 });
    const { data, error } = await supabase
      .from('loans')
      .insert({ customer_id: loan.customer_id, title: loan.title, total_amount: loan.total_amount, returned_amount: loan.returned_amount, due_date: loan.due_date, status: loan.status })
      .select('id')
      .single();
    if (error) throw error;
    return NextResponse.json({ loan: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Could not save loan. Check that the selected customer exists.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const id = String(body.id ?? '');
    const loan = parseLoan(body);
    if (!id || !loan.valid) return NextResponse.json({ error: 'Check the loan details and amounts. Returned amount cannot exceed total amount.' }, { status: 400 });
    const { data, error } = await supabase
      .from('loans')
      .update({ customer_id: loan.customer_id, title: loan.title, total_amount: loan.total_amount, returned_amount: loan.returned_amount, due_date: loan.due_date, status: loan.status })
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Loan record not found.' }, { status: 404 });
    return NextResponse.json({ loan: data });
  } catch {
    return NextResponse.json({ error: 'Could not update loan record.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Loan ID is required.' }, { status: 400 });
  const { data, error } = await supabase.from('loans').delete().eq('id', id).select('id').maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not delete loan record.' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Loan record not found.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
