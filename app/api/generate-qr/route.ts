import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function safeEqualHex(a: string, b: string) {
  if (!/^[a-f0-9]{64}$/i.test(a) || !/^[a-f0-9]{64}$/i.test(b)) return false;
  const first = Buffer.from(a, 'hex');
  const second = Buffer.from(b, 'hex');
  return first.length === second.length && timingSafeEqual(first, second);
}

function buildUpiLink(upiId: string, amount: string, expires: string) {
  const enc = (value: string) => encodeURIComponent(value).replace(/%40/g, '@');
  return `upi://pay?pa=${enc(upiId)}&pn=Merchant&am=${enc(amount)}&cu=INR&tn=ORD${enc(expires)}`;
}

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYMENT_SECRET;
    if (!secret) return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 503 });

    const body = await request.json();
    const amount = String(body.amount ?? '');
    const upiId = String(body.upiId ?? '');
    const expires = String(body.expires ?? '');
    const sig = String(body.sig ?? '');

    if (!/^\d+(?:\.\d{2})$/.test(amount) || !upiId || !/^\d{13}$/.test(expires) || !sig) {
      return NextResponse.json({ error: 'Invalid payment link.' }, { status: 400 });
    }
    if (Date.now() > Number(expires)) {
      return NextResponse.json({ error: 'Payment link expired.' }, { status: 401 });
    }

    const expected = createHmac('sha256', secret).update(`${amount}|${upiId}|${expires}`).digest('hex');
    if (!safeEqualHex(expected, sig)) {
      return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 401 });
    }

    const upiLink = buildUpiLink(upiId, amount, expires);
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;
    return NextResponse.json({ qr });
  } catch (error) {
    console.error('QR generation failed:', error);
    return NextResponse.json({ error: 'Could not generate the QR code.' }, { status: 500 });
  }
}
