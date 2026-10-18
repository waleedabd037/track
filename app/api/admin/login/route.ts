import { NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/admin-auth';
export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return NextResponse.json({ error: 'Admin password is not configured on the server.' }, { status: 500 });
    if (typeof password !== 'string' || password.length > 200 || password !== expected) return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    await createAdminSession(); return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Could not sign in.' }, { status: 500 }); }
}
