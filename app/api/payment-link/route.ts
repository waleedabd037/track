import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

function signPayment(amount: string, upiId: string, expires: string, secret: string) {
  return createHmac('sha256', secret).update(`${amount}|${upiId}|${expires}`).digest('hex');
}

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYMENT_SECRET;
    if (!secret) {
      console.error('Missing PAYMENT_SECRET environment variable.');
      return NextResponse.json({ error: 'Payment service is not configured yet.' }, { status: 503 });
    }

    const body = await request.json();
    const phone = String(body.phone ?? '').replace(/[\s()-]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 });
    }

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id,upi')
      .eq('phone', phone)
      .maybeSingle();
    if (customerError) throw customerError;
    if (!customer) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

    const upiId = String(customer.upi ?? '').trim();
    if (!upiId) {
      return NextResponse.json({ error: 'A UPI ID has not been added to your account yet. Please contact the administrator.' }, { status: 400 });
    }

    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('total_amount,returned_amount')
      .eq('customer_id', customer.id);
    if (loansError) throw loansError;

    const total = (loans ?? []).reduce((sum, loan) => sum + Number(loan.total_amount || 0), 0);
    const returned = (loans ?? []).reduce((sum, loan) => sum + Number(loan.returned_amount || 0), 0);
    const due = Math.max(0, Math.round((total - returned + Number.EPSILON) * 100) / 100);
    if (!Number.isFinite(due) || due <= 0) {
      return NextResponse.json({ error: 'There is no outstanding amount to pay.' }, { status: 400 });
    }

    const amount = due.toFixed(2);
    const expires = String(Date.now() + 15 * 60 * 1000);
    const sig = signPayment(amount, upiId, expires, secret);
    const paymentUrl = new URL('/pay', request.url);
    paymentUrl.searchParams.set('amount', amount);
    paymentUrl.searchParams.set('upiId', upiId);
    paymentUrl.searchParams.set('expires', expires);
    paymentUrl.searchParams.set('sig', sig);

    return NextResponse.json({ url: `${paymentUrl.pathname}${paymentUrl.search}` });
  } catch (error) {
    console.error('Payment link generation failed:', error);
    return NextResponse.json({ error: 'Unable to prepare the payment link right now.' }, { status: 500 });
  }
}
