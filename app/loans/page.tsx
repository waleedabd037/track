
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
  loans: Loan[];
};

const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

export default function LoansPage() {
  const [data, setData] = useState<RecordData | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Loan | null>(null);

  useEffect(() => {
    async function loadLoans() {
      try {
        const phone = sessionStorage.getItem('loanLookupPhone');

        if (!phone) {
          setError('Please enter your registered mobile number first.');
          return;
        }

        const response = await fetch('/api/loans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Could not load loans.');
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load your loan records.'
        );
      }
    }

    loadLoans();
  }, []);

  const filteredLoans = (data?.loans ?? []).filter(
    (loan) => filter === 'All' || loan.status === filter
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
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                marginTop: 12,
              }}
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

  const total = data.loans.reduce(
    (sum, loan) => sum + Number(loan.total_amount || 0),
    0
  );

  const returned = data.loans.reduce(
    (sum, loan) => sum + Number(loan.returned_amount || 0),
    0
  );

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

          <h1 style={{ fontSize: 28, margin: '8px 0 4px' }}>
            My Loans
          </h1>

          <div className="muted small">
            {data.name} · {data.phone}
          </div>

          <div
            className="stats"
            style={{
              gridTemplateColumns: '1fr',
              marginTop: 22,
            }}
          >
            <div className="stat">
              <span className="stat-label">Total loan amount</span>
              <div className="stat-value">{money(total)}</div>
            </div>

            <div className="stat">
              <span className="stat-label">Loan returned</span>
              <div
                className="stat-value"
                style={{ color: 'var(--green)' }}
              >
                {money(returned)}
              </div>
            </div>

            <div className="stat">
              <span className="stat-label">Loan remaining</span>
              <div
                className="stat-value"
                style={{
                  color: remaining > 0 ? 'var(--blue)' : 'var(--green)',
                }}
              >
                {money(remaining)}
              </div>
            </div>
          </div>
        </section>

        <div className="section-head">
          <h2>Loan history</h2>
          <span className="small muted">
            {filteredLoans.length} records
          </span>
        </div>

        <div className="tabs">
          {['All', 'Lending', 'Unsettled', 'Completed'].map((tab) => (
            <button
              key={tab}
              type="button"
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

                <span
                  className={`status ${
                    loan.status === 'Completed' ? '' : 'unsettled'
                  }`}
                >
                  {loan.status}
                </span>
              </div>

              <div className="loan-meta">
                <span>
                  Loan {money(Number(loan.total_amount))}
                </span>

                <span>
                  Due date{' '}
                  {loan.due_date
                    ? new Date(
                        `${loan.due_date}T00:00:00`
                      ).toLocaleDateString('en-GB')
                    : 'Not set'}
                </span>
              </div>

              <div className="loan-bottom">
                <button
                  type="button"
                  className="detail-btn"
                  onClick={() => setSelected(loan)}
                >
                  Detail
                </button>
              </div>
            </article>
          ))}

          {filteredLoans.length === 0 && (
            <div className="empty">
              No loans found in this section.
            </div>
          )}
        </div>

        <div className="footer">
          If any information looks incorrect, please contact your loan
          administrator.
        </div>

        {selected && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Loan details"
            className="modal-backdrop"
            onClick={() => setSelected(null)}
          >
            <div
              className="panel modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="topbar">
                <h2 style={{ margin: 0 }}>{selected.title}</h2>

                <button
                  type="button"
                  className="tab"
                  onClick={() => setSelected(null)}
                >
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
                  <strong>
                    {money(Number(selected.total_amount))}
                  </strong>
                </div>

                <div className="stat">
                  <span className="stat-label">Loan returned</span>
                  <strong>
                    {money(Number(selected.returned_amount))}
                  </strong>
                </div>

                <div className="stat">
                  <span className="stat-label">Loan remaining</span>
                  <strong>
                    {money(
                      Number(selected.total_amount) -
                        Number(selected.returned_amount)
                    )}
                  </strong>
                </div>

                <div className="stat">
                  <span className="stat-label">Due date</span>
                  <strong>
                    {selected.due_date
                      ? new Date(
                          `${selected.due_date}T00:00:00`
                        ).toLocaleDateString('en-GB')
                      : 'Not set'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
