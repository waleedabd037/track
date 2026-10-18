'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const money = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(value);

type Method = { title: string; subtitle: string; website: string; mark: string };
const methods: Method[] = [
  { title: 'Paytm', subtitle: 'Open your UPI payment app', website: 'https://paytm.com/', mark: 'P' },
  { title: 'PhonePe', subtitle: 'Open your UPI payment app', website: 'https://www.phonepe.com/', mark: 'पे' },
  { title: 'UPI', subtitle: 'Pay with a UPI-compatible app', website: 'https://www.npci.org.in/what-we-do/upi/product-overview', mark: '₹' },
];

function PaymentClient() {
  const params = useSearchParams();
  const amount = params.get('amount') ?? '';
  const upiId = params.get('upiId') ?? '';
  const expires = params.get('expires') ?? '';
  const sig = params.get('sig') ?? '';
  const [qr, setQr] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [utr, setUtr] = useState('');
  const [checking, setChecking] = useState(false);
  const [seconds, setSeconds] = useState(900);
  const [expired, setExpired] = useState(false);

  const validShape = useMemo(() => Boolean(amount && upiId && expires && sig), [amount, upiId, expires, sig]);

  useEffect(() => {
    if (!validShape) {
      setError('Invalid payment link. Please return to your loan account and select Make Payment again.');
      return;
    }
    let alive = true;
    fetch('/api/generate-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, upiId, expires, sig }),
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Payment link expired or is invalid.');
      if (alive) { setQr(result.qr); setVerified(true); }
    }).catch((reason: unknown) => {
      if (alive) setError(reason instanceof Error ? reason.message : 'Something went wrong.');
    });
    return () => { alive = false; };
  }, [amount, upiId, expires, sig, validShape]);

  useEffect(() => {
    const remainingSeconds = Math.max(0, Math.ceil((Number(expires) - Date.now()) / 1000));
    setSeconds(remainingSeconds);
    setExpired(remainingSeconds <= 0);
  }, [expires]);

  useEffect(() => {
    if (seconds <= 0) { setExpired(true); return; }
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const formattedTime = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId).replace(/%40/g, '@')}&pn=Merchant&am=${encodeURIComponent(amount)}&cu=INR&tn=ORD${encodeURIComponent(expires)}`;

  async function copyText(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setError('Clipboard access failed. Please copy the value manually.');
    }
  }

  function openPaymentApp(method: Method) {
    if (expired || !verified) return;
    const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    if (!mobile) {
      window.open(method.website, '_blank', 'noopener,noreferrer');
      return;
    }
    let hidden = false;
    const onVisibility = () => { if (document.hidden) hidden = true; };
    document.addEventListener('visibilitychange', onVisibility);
    window.location.href = upiLink;
    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (!hidden) window.open(method.website, '_blank', 'noopener,noreferrer');
    }, 1800);
  }

  function submitUtr() {
    setChecking(true);
    setError('UTR submission is not connected to payment verification yet. Please contact the administrator after paying.');
  }

  if (!validShape || error.startsWith('Invalid payment link.')) {
    return <main className="page"><div className="shell" style={{ maxWidth: 520 }}><section className="panel"><h1>Payment link unavailable</h1><p className="muted">{error || 'This payment link is invalid.'}</p><Link className="btn" href="/loans" style={{ display: 'inline-block', textDecoration: 'none', marginTop: 12 }}>Return to loan account</Link></section></div></main>;
  }

  return (
    <main className="pay-page">
      <section className="pay-card">
        <div className="pay-timer">Payment link closes in: <strong>{expired ? 'Expired' : formattedTime}</strong></div>
        {expired && <div className="pay-error">This link has expired. Return to your loan account and select Make Payment to create a new link.</div>}
        <div className="pay-price-row"><div className="pay-price">{money(Number(amount))}</div><button className="pay-copy" onClick={() => copyText(amount, 'amount')} aria-label="Copy amount" disabled={!verified || expired}>▢</button>{copied === 'amount' && <span className="pay-copied">Copied</span>}</div>
        <p className="pay-subtitle">Outstanding amount to pay</p>

        <section className="pay-section"><h2>Method 1 · Pay using an app</h2>
          {methods.map((method) => <button type="button" className="pay-method" key={method.title} onClick={() => openPaymentApp(method)} disabled={expired || !verified}>
            <span className="pay-mark">{method.mark}</span><span className="pay-method-text"><strong>{method.title}</strong><small>{method.subtitle}</small></span><span aria-hidden="true">↗</span>
          </button>)}
        </section>

        <section className="pay-section"><h2>Method 2 · Manual transfer</h2>
          <div className="pay-manual"><div><strong>Customer UPI ID</strong><small className="pay-upi">{upiId}</small></div><button type="button" className="pay-small-btn" onClick={() => copyText(upiId, 'upi')} disabled={!verified || expired}>Copy UPI</button></div>
          {copied === 'upi' && <p className="pay-copied">UPI ID copied to clipboard</p>}
          <p className="pay-help">After making the payment, you can enter your UTR/reference number below.</p>
          <input className="pay-input" value={utr} onChange={(event) => setUtr(event.target.value)} placeholder="Enter UTR after payment" aria-label="UTR after payment" disabled={expired || checking || !verified} />
          <button className="pay-submit" type="button" onClick={submitUtr} disabled={expired || checking || !verified || !utr.trim()}>{checking ? 'SUBMITTED' : 'SUBMIT'}</button>
        </section>

        <section className="pay-section"><h2>Method 3 · Scan QR to pay</h2><p className="pay-qr-title">Scan using any UPI app</p>
          <div className="pay-qr-tile">{qr && verified ? <img src={qr} alt="UPI payment QR code" width="250" height="250" /> : <p>{error || 'Verifying payment link and loading QR code…'}</p>}</div>
        </section>

        <aside className="pay-warning"><strong>⚠️ Important payment instructions</strong><p><b>Exact amount:</b> Pay the outstanding amount shown above in one transaction.</p><p><b>Check before paying:</b> Confirm the UPI ID and amount in your payment app before authorising.</p><p>Do not pay repeatedly for the same link. If the link expires, create a new one from your loan account.</p></aside>
        {error && !error.startsWith('Invalid payment link.') && <p className="pay-error" role="alert">{error}</p>}
        <div className="pay-footer"><Link href="/loans">← Back to LoanTrack</Link></div>
      </section>
      <style jsx>{`
        .pay-page{min-height:100vh;background:#f2f2f2;display:flex;justify-content:center;padding:22px 14px 40px;color:#171717}
        .pay-card{width:410px;max-width:100%;height:fit-content;background:#fff;border-radius:18px;padding:22px;box-shadow:0 6px 18px #00000012}
        .pay-timer{text-align:center;font-size:14px;margin-bottom:16px}.pay-price-row{display:flex;align-items:center;justify-content:center;gap:8px}.pay-price{font-size:32px;font-weight:800;overflow-wrap:anywhere}.pay-copy{border:0;background:#f2f2f2;border-radius:8px;padding:6px 9px;font-size:19px}.pay-copied{font-size:12px;color:#16845b;margin:6px 0}.pay-subtitle{text-align:center;margin:6px 0 22px;color:#666;font-size:14px}
        .pay-section{margin-top:20px}.pay-section h2{font-size:15px;margin:0 0 10px}.pay-method{display:flex;align-items:center;gap:11px;width:100%;text-align:left;border:1px solid #eee;background:#fff;border-radius:12px;padding:11px;margin-bottom:8px;color:#111}.pay-method:disabled{opacity:.5}.pay-mark{width:40px;height:40px;display:grid;place-items:center;background:#f0f2ff;color:#315bd6;border-radius:9px;font-weight:800;font-size:18px}.pay-method-text{display:flex;flex:1;flex-direction:column;gap:3px}.pay-method-text small,.pay-manual small{color:#666;font-size:12px}.pay-manual{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #eee;border-radius:12px;padding:12px}.pay-manual>div{min-width:0;display:flex;flex-direction:column;gap:5px}.pay-upi{overflow-wrap:anywhere}.pay-small-btn{border:0;border-radius:8px;background:#edf2ff;color:#315bd6;padding:9px 11px;font-weight:700;white-space:nowrap}.pay-help{font-size:12px;line-height:1.5;color:#666}.pay-input{width:100%;border:1px solid #ddd;border-radius:8px;padding:12px 13px;margin:7px 0 9px}.pay-submit{width:100%;border:0;border-radius:8px;background:#4f46e5;color:white;padding:12px;font-weight:700}.pay-submit:disabled{background:#c7c7c7}.pay-qr-title{text-align:center;font-size:13px;color:#555}.pay-qr-tile{display:flex;justify-content:center;align-items:center;min-height:180px;background:linear-gradient(145deg,#f8f9ff,#eef1ff);border-radius:18px;padding:15px;overflow:hidden}.pay-qr-tile img{display:block;max-width:100%;height:auto;border-radius:10px;background:#fff}.pay-warning{background:linear-gradient(135deg,#fff8e6,#fff3cd);border-left:5px solid #ff9800;border-radius:12px;padding:15px;margin-top:22px;font-size:13px;line-height:1.5}.pay-warning>strong{display:block;color:#995b00;margin-bottom:9px}.pay-warning p{margin:8px 0;color:#444}.pay-error{background:#fff0ef;color:#a11b16;border-radius:9px;padding:11px;font-size:13px;line-height:1.5}.pay-footer{text-align:center;margin-top:20px;font-size:13px}.pay-footer a{color:#315bd6;text-decoration:none;font-weight:700}
      `}</style>
    </main>
  );
}


export default function PaymentPage() {
  return (
    <Suspense fallback={<main className="page"><div className="shell" style={{ maxWidth: 520 }}><div className="empty">Loading payment page…</div></div></main>}>
      <PaymentClient />
    </Suspense>
  );
}
