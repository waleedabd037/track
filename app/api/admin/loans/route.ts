import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('loans').select('id,customer_id,title,total_amount,returned_amount,due_date,status,created_at,customers(name,phone)').order('created_at',{ascending:false});
  if (error) return NextResponse.json({ error: 'Could not load loans.' }, { status: 500 });
  return NextResponse.json({ loans: data });
}
export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const b = await request.json(); const customer_id = String(b.customer_id ?? ''); const title = String(b.title ?? '').trim(); const due_date = b.due_date ? String(b.due_date) : null; const total_amount = Number(b.total_amount); const returned_amount = Number(b.returned_amount); const status = String(b.status ?? 'Unsettled');
    if (!customer_id || !title || title.length > 120 || !Number.isFinite(total_amount) || total_amount <= 0 || !Number.isFinite(returned_amount) || returned_amount < 0 || returned_amount > total_amount || !['Lending','Unsettled','Completed'].includes(status)) return NextResponse.json({ error: 'Check the loan details and amounts.' }, { status: 400 });
    const { data, error } = await supabase.from('loans').insert({customer_id,title,total_amount,returned_amount,due_date,status}).select('id').single();
    if (error) throw error;
    return NextResponse.json({ loan: data }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Could not save loan. Check that the selected customer exists.' }, { status: 500 }); }
}
