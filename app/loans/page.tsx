'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Loan = {
  id: string;
  title: string;
  total_amount: number;
  returned_amount: number;
  due_date: string | null;
  status: string;
};

type RecordData = {
  name: string;
  phone: string;
  upi: string | null;
  loans: Loan[];
};

const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string | null) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-GB') : 'Not set';

export default function LoansPage() {
  const [data, setData] = useState<RecordData | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Loan | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    const phone = sessionStorage.getItem('loanLookupPhone');

    if (!phone) {
      setError('Please enter your registered mobile number first.');
      return;
    }

    fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Could not load loans');
        }
        setData(result as RecordData);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Could not load loans');
      });
  }, []);

  async function makePayment() {
    if (!data) return;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const response = await fetch('/api/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create payment link.');
      window.location.assign(result.url);
    } catch (reason) {
      setPaymentError(reason instanceof Error ? reason.message : 'Could not create payment link.');
    } finally {
      setPaymentLoading(false);
    }
  }

  const filteredLoans = (data?.loans ?? []).filter(
    (loan) => filter === 'All' || loan.status === filter,
  );

  if (error) {
    return (
      <main className="page">
        <div className="shell" style={{ maxWidth: 520 }}>
          <section className="panel">
            <h1>Unable to open account</h1>
            <p className="muted">{error}</p>
            <Link
              className="btn"
              href="/"
              style={{ display: 'inline-block', textDecoration: 'none', marginTop: 12 }}
            >
              Back to lookup
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="page">
        <div className="shell" style={{ maxWidth: 520 }}>
          <div className="empty">Loading your loan records…</div>
        </div>
      </main>
    );
  }

  const total = data.loans.reduce((sum, loan) => sum + Number(loan.total_amount), 0);
  const returned = data.loans.reduce((sum, loan) => sum + Number(loan.returned_amount), 0);
  const remaining = total - returned;

  return (
    <main className="page">
      <div className="shell" style={{ maxWidth: 520 }}>
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">L</div>
            <span>LoanTrack</span>
          </div>
          <Link className="back" href="/">
            ← Exit
          </Link>
        </header>

        <section className="panel">
          <div className="small muted">LOAN ACCOUNT</div>
          <h1 style={{ fontSize: 28, margin: '8px 0 4px' }}>My Loans</h1>
          <div className="muted small">
            {data.name} · {data.phone}
          </div>

          {data.upi && (
            <div className="stat" style={{ marginTop: 14 }}>
              <span className="stat-label">UPI ID</span>
              <div className="stat-value" style={{ fontSize: 18, overflowWrap: 'anywhere' }}>
                {data.upi}
              </div>
            </div>
          )}

          <div className="stats" style={{ gridTemplateColumns: '1fr', marginTop: 22 }}>
            <div className="stat">
              <span className="stat-label">Total loan amount</span>
              <div className="stat-value">{money(total)}</div>
            </div>
            <div className="stat">
              <span className="stat-label">Loan returned</span>
              <div className="stat-value" style={{ color: 'var(--green)' }}>
                {money(returned)}
              </div>
            </div>
            <div className="stat">
              <span className="stat-label">Loan remaining</span>
              <div className="stat-value" style={{ color: remaining > 0 ? 'var(--blue)' : 'var(--green)' }}>
                {money(remaining)}
              </div>
            </div>
          </div>
          {remaining > 0 && (
            <div style={{ marginTop: 18 }}>
              <button className="btn" type="button" onClick={makePayment} disabled={paymentLoading} style={{ width: '100%' }}>
                {paymentLoading ? 'Preparing payment…' : 'Make Payment'}
              </button>
              {paymentError && <div className="error" role="alert">{paymentError}</div>}
              <p className="muted small" style={{ margin: '9px 0 0', lineHeight: 1.5 }}>
                Opens a secure payment link for your outstanding balance using the UPI ID registered to your account.
              </p>
            </div>
          )}
        </section>

        <div className="section-head">
          <h2>Loan history</h2>
          <span className="small muted">{filteredLoans.length} records</span>
        </div>

        <div className="tabs">
          {['All', 'Lending', 'Unsettled', 'Completed'].map((tab) => (
            <button
              key={tab}
              className={`tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="loan-list">
          {filteredLoans.map((loan) => (
            <article className="loan-card" key={loan.id}>
              <div className="loan-top">
                <div className="loan-icon">↗</div>
                <div className="loan-title">{loan.title}</div>
                <span className={`status ${loan.status === 'Completed' ? '' : 'unsettled'}`}>
                  {loan.status}
                </span>
              </div>
              <div className="loan-meta">
                <span>Loan {money(Number(loan.total_amount))}</span>
                <span>Due date {formatDate(loan.due_date)}</span>
              </div>
              <div className="loan-bottom">
                <button className="detail-btn" onClick={() => setSelected(loan)}>
                  Detail
                </button>
              </div>
            </article>
          ))}
          {filteredLoans.length === 0 && (
            <div className="empty">No loans found in this section.</div>
          )}
        </div>

        <div className="footer">
          If any information looks incorrect, please contact your loan administrator.
        </div>

        {selected && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Loan details"
            className="modal-backdrop"
            onClick={() => setSelected(null)}
          >
            <div className="panel modal" onClick={(event) => event.stopPropagation()}>
              <div className="topbar">
                <h2 style={{ margin: 0 }}>{selected.title}</h2>
                <button className="tab" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
              <div className="stack">
                <div className="stat">
                  <span className="stat-label">Status</span>
                  <strong>{selected.status}</strong>
                </div>
                <div className="stat">
                  <span className="stat-label">Total loan amount</span>
                  <strong>{money(Number(selected.total_amount))}</strong>
                </div>
                <div className="stat">
                  <span className="stat-label">Loan returned</span>
                  <strong>{money(Number(selected.returned_amount))}</strong>
                </div>
                <div className="stat">
                  <span className="stat-label">Loan remaining</span>
                  <strong>
                    {money(Number(selected.total_amount) - Number(selected.returned_amount))}
                  </strong>
                </div>
                <div className="stat">
                  <span className="stat-label">Due date</span>
                  <strong>{formatDate(selected.due_date)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
