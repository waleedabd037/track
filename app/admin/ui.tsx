'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Customer = { id: string; name: string; phone: string; upi: string | null };
type Loan = {
  id: string;
  customer_id: string;
  title: string;
  total_amount: number;
  returned_amount: number;
  due_date: string | null;
  status: string;
  customers: { name: string; phone: string } | null;
};

const money = (n: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(n);

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiValue, setUpiValue] = useState('');
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingUpiCustomerId, setEditingUpiCustomerId] = useState<string | null>(null);
  const [editingUpiValue, setEditingUpiValue] = useState('');
  const [upiManagerCustomerId, setUpiManagerCustomerId] = useState('');
  const [upiManagerValue, setUpiManagerValue] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [total, setTotal] = useState('');
  const [returned, setReturned] = useState('0');
  const [due, setDue] = useState('');
  const [status, setStatus] = useState('Unsettled');
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function load() {
    setLoading(true);
    try {
      const [customerResponse, loanResponse] = await Promise.all([
        fetch('/api/admin/customers'),
        fetch('/api/admin/loans'),
      ]);
      if (customerResponse.status === 401 || loanResponse.status === 401) {
        router.push('/admin/login');
        return;
      }
      const customerData = await customerResponse.json();
      const loanData = await loanResponse.json();
      if (!customerResponse.ok) throw new Error(customerData.error || 'Could not load customers.');
      if (!loanResponse.ok) throw new Error(loanData.error || 'Could not load loans.');
      const nextCustomers: Customer[] = customerData.customers || [];
      setCustomers(nextCustomers);
      setLoans(loanData.loans || []);
      setCustomerId((current) => current && nextCustomers.some((c) => c.id === current) ? current : (nextCustomers[0]?.id || ''));
      setUpiManagerCustomerId((current) => {
        const nextId = current && nextCustomers.some((c) => c.id === current) ? current : (nextCustomers[0]?.id || '');
        const selected = nextCustomers.find((c) => c.id === nextId);
        setUpiManagerValue(selected?.upi || '');
        return nextId;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function resetCustomerForm() {
    setName(''); setPhone(''); setUpiValue(''); setEditingCustomerId(null);
  }

  function editCustomer(customer: Customer) {
    setEditingCustomerId(customer.id);
    setName(customer.name);
    setPhone(customer.phone);
    setUpiValue(customer.upi || '');
    setError(''); setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveCustomer(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    try {
      const response = await fetch('/api/admin/customers', {
        method: editingCustomerId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCustomerId, name, phone, upi: upiValue }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save customer.');
      setCustomerId(result.customer.id);
      resetCustomerForm();
      setMessage(editingCustomerId ? 'Customer updated.' : 'Customer added.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save customer.');
    } finally { setBusy(false); }
  }

  async function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(`Delete ${customer.name} and ALL of their loan records? This cannot be undone.`);
    if (!confirmed) return;
    setError(''); setMessage(''); setBusy(true);
    try {
      const response = await fetch(`/api/admin/customers?id=${encodeURIComponent(customer.id)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not delete customer.');
      if (editingCustomerId === customer.id) resetCustomerForm();
      setMessage('Customer and all associated loans deleted.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete customer.');
    } finally { setBusy(false); }
  }

  function startEditingUpi(customer: Customer) {
    setEditingUpiCustomerId(customer.id);
    setEditingUpiValue(customer.upi || '');
    setError('');
    setMessage('');
  }

  async function saveManagedUpi() {
    const customer = customers.find((item) => item.id === upiManagerCustomerId);
    if (!customer) {
      setError('Choose a customer first.');
      return;
    }
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          upi: upiManagerValue.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update UPI ID.');
      setMessage(upiManagerValue.trim() ? `UPI ID saved for ${customer.name}.` : `UPI ID cleared for ${customer.name}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update UPI ID.');
    } finally {
      setBusy(false);
    }
  }

  async function saveCustomerUpi(customer: Customer) {
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          upi: editingUpiValue.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update UPI ID.');
      setEditingUpiCustomerId(null);
      setEditingUpiValue('');
      setMessage(editingUpiValue.trim() ? 'UPI ID updated.' : 'UPI ID cleared. This field is optional.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update UPI ID.');
    } finally {
      setBusy(false);
    }
  }

  function resetLoanForm() {
    setEditingLoanId(null); setTitle(''); setTotal(''); setReturned('0'); setDue(''); setStatus('Unsettled');
  }

  function editLoan(loan: Loan) {
    setEditingLoanId(loan.id); setCustomerId(loan.customer_id); setTitle(loan.title);
    setTotal(String(loan.total_amount)); setReturned(String(loan.returned_amount));
    setDue(loan.due_date || ''); setStatus(loan.status); setError(''); setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveLoan(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    try {
      const response = await fetch('/api/admin/loans', {
        method: editingLoanId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingLoanId, customer_id: customerId, title, total_amount: Number(total), returned_amount: Number(returned), due_date: due || null, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save loan record.');
      resetLoanForm();
      setMessage(editingLoanId ? 'Loan record updated.' : 'Loan record added.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save loan record.');
    } finally { setBusy(false); }
  }

  async function deleteLoan(loan: Loan) {
    if (!window.confirm(`Delete loan "${loan.title}" for ${loan.customers?.name || 'this customer'}?`)) return;
    setError(''); setMessage(''); setBusy(true);
    try {
      const response = await fetch(`/api/admin/loans?id=${encodeURIComponent(loan.id)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not delete loan record.');
      if (editingLoanId === loan.id) resetLoanForm();
      setMessage('Loan record deleted.'); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete loan record.');
    } finally { setBusy(false); }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login'); router.refresh();
  }

  return <>
    <div className="section-head" style={{ marginTop: 0 }}>
      <h2>Overview</h2><button className="btn secondary" onClick={logout}>Sign out</button>
    </div>
    <div className="stats">
      <div className="stat"><span className="stat-label">Registered customers</span><div className="stat-value">{customers.length}</div></div>
      <div className="stat"><span className="stat-label">Total loaned</span><div className="stat-value">{money(loans.reduce((sum, loan) => sum + Number(loan.total_amount), 0))}</div></div>
      <div className="stat"><span className="stat-label">Outstanding</span><div className="stat-value">{money(loans.reduce((sum, loan) => sum + Number(loan.total_amount) - Number(loan.returned_amount), 0))}</div></div>
    </div>

    {error && <div className="error" role="alert">{error}</div>}
    {message && <div className="success" role="status">{message}</div>}

    <div className="admin-grid" style={{ marginTop: 22 }}>
      <section className="panel">
        <h2 style={{ margin: '0 0 6px', fontSize: 19 }}>{editingCustomerId ? 'Edit customer' : 'Add customer'}</h2>
        <p className="muted small">UPI ID is optional. You can edit it here or directly in the customer records table.</p>
        <form className="stack" onSubmit={saveCustomer} style={{ marginTop: 18 }}>
          <label>Customer full name<input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required placeholder="Customer name" /></label>
          <label>Mobile number<input className="field" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+92 300 1234567" /></label>
          <label>UPI ID<textarea className="field" value={upiValue} onChange={(e) => setUpiValue(e.target.value)} maxLength={2000} rows={3} placeholder="Optional UPI ID" /></label>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : editingCustomerId ? 'Save customer changes' : 'Save customer'}</button>
          {editingCustomerId && <button type="button" className="btn secondary" onClick={resetCustomerForm}>Cancel editing</button>}
        </form>
      </section>

      <section className="panel">
        <h2 style={{ margin: '0 0 6px', fontSize: 19 }}>{editingLoanId ? 'Edit loan record' : 'Add loan record'}</h2>
        <p className="muted small">Amounts are in Indian rupees (₹) by default.</p>
        <form className="stack" onSubmit={saveLoan} style={{ marginTop: 18 }}>
          <label>Customer<select className="field" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required><option value="">Choose customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}</select></label>
          <label>Loan name<input className="field" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder="e.g. Personal loan" /></label>
          <label>Total loan amount<input className="field" type="number" min="0.01" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} required /></label>
          <label>Loan returned<input className="field" type="number" min="0" step="0.01" value={returned} onChange={(e) => setReturned(e.target.value)} required /></label>
          <label>Due date<input className="field" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
          <label>Status<select className="field" value={status} onChange={(e) => setStatus(e.target.value)}><option>Lending</option><option>Unsettled</option><option>Completed</option></select></label>
          <button className="btn" disabled={busy || !customers.length}>{busy ? 'Saving…' : editingLoanId ? 'Save loan changes' : 'Save loan record'}</button>
          {editingLoanId && <button type="button" className="btn secondary" onClick={resetLoanForm}>Cancel editing</button>}
          {!customers.length && <p className="muted small">Add a customer first.</p>}
        </form>
      </section>
    </div>

    <section className="panel" style={{ marginTop: 28 }}>
      <div className="section-head" style={{ marginTop: 0 }}>
        <div>
          <h2 style={{ margin: 0 }}>Manage customer UPI</h2>
          <p className="muted small" style={{ margin: '6px 0 0' }}>Optional field. Choose a customer to add, change, or clear their UPI ID.</p>
        </div>
      </div>
      {customers.length === 0 ? <p className="muted small">Add a customer first to manage a UPI ID.</p> :
        <div className="stack" style={{ marginTop: 14 }}>
          <label>Customer
            <select className="field" value={upiManagerCustomerId} onChange={(event) => {
              const id = event.target.value;
              setUpiManagerCustomerId(id);
              setUpiManagerValue(customers.find((customer) => customer.id === id)?.upi || '');
            }}>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}
            </select>
          </label>
          <label>UPI ID (optional)
            <input className="field" value={upiManagerValue} onChange={(event) => setUpiManagerValue(event.target.value)} maxLength={2000} placeholder="Enter UPI ID, or leave blank to remove it" />
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button type="button" className="btn" onClick={() => void saveManagedUpi()} disabled={busy || !upiManagerCustomerId}>{busy ? 'Saving…' : 'Save UPI ID'}</button>
            <button type="button" className="btn secondary" onClick={() => setUpiManagerValue('')} disabled={busy || !upiManagerCustomerId}>Clear field</button>
          </div>
        </div>}
    </section>

    <section style={{ marginTop: 28 }}>
      <div className="section-head"><h2>Customer records</h2><span className="small muted">{customers.length} customers</span></div>
      {loading ? <div className="empty">Loading records…</div> : !customers.length ? <div className="empty">No customers added yet.</div> :
        <div className="panel table-wrap" style={{ padding: 10 }}><table><thead><tr><th>Customer</th><th>UPI ID</th><th>Actions</th></tr></thead><tbody>
          {customers.map((customer) => <tr key={customer.id}>
            <td>{customer.name}<div className="muted small">{customer.phone}</div></td>
            <td style={{ maxWidth: 300, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
              {editingUpiCustomerId === customer.id ? (
                <div className="stack" style={{ minWidth: 180, gap: 8 }}>
                  <input
                    className="field"
                    value={editingUpiValue}
                    onChange={(event) => setEditingUpiValue(event.target.value)}
                    maxLength={2000}
                    placeholder="Optional UPI ID"
                    aria-label={`UPI ID for ${customer.name}`}
                  />
                  <span className="muted small">Leave blank to remove the UPI ID.</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <button type="button" className="btn" onClick={() => void saveCustomerUpi(customer)} disabled={busy}>
                      {busy ? 'Saving…' : 'Save UPI'}
                    </button>
                    <button type="button" className="btn secondary" onClick={() => { setEditingUpiCustomerId(null); setEditingUpiValue(''); }} disabled={busy}>Cancel</button>
                  </div>
                </div>
              ) : customer.upi || <span className="muted">Not set</span>}
            </td>
            <td><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button type="button" className="btn secondary" onClick={() => editCustomer(customer)} disabled={busy}>Edit customer</button>
              {editingUpiCustomerId !== customer.id && <button type="button" className="btn secondary" onClick={() => startEditingUpi(customer)} disabled={busy}>Edit UPI</button>}
              <button type="button" className="btn danger" onClick={() => void deleteCustomer(customer)} disabled={busy}>Delete person</button>
            </div></td>
          </tr>)}
        </tbody></table></div>}
    </section>

    <section style={{ marginTop: 28 }}>
      <div className="section-head"><h2>Loan records</h2><span className="small muted">{loans.length} records</span></div>
      {loading ? <div className="empty">Loading records…</div> : !loans.length ? <div className="empty">No loans added yet. Use the form above to create the first record.</div> :
        <div className="panel table-wrap" style={{ padding: 10 }}><table><thead><tr><th>Customer</th><th>Loan</th><th>Total</th><th>Returned</th><th>Remaining</th><th>Due date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {loans.map((loan) => <tr key={loan.id}>
            <td>{loan.customers?.name || '—'}<div className="muted small">{loan.customers?.phone}</div></td>
            <td>{loan.title}</td><td>{money(Number(loan.total_amount))}</td><td>{money(Number(loan.returned_amount))}</td>
            <td><strong>{money(Number(loan.total_amount) - Number(loan.returned_amount))}</strong></td><td>{loan.due_date || '—'}</td><td>{loan.status}</td>
            <td><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}><button type="button" className="btn secondary" onClick={() => editLoan(loan)} disabled={busy}>Edit</button><button type="button" className="btn danger" onClick={() => void deleteLoan(loan)} disabled={busy}>Delete</button></div></td>
          </tr>)}
        </tbody></table></div>}
    </section>
    <p className="notice">Deleting a person permanently deletes all their loan records too. Customer UPI IDs are also shown on the matching customer account page. Before using real financial data, consider adding OTP verification and rate limiting to the public phone lookup.</p>
  </>;
}
