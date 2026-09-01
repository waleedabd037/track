"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useLoans } from "@/components/loan-provider";
import { money, PageHeader, StatusBadge } from "@/components/ui";
import type { Borrower, LoanStatus } from "@/lib/types";

export default function BorrowersPage() {
  const { borrowers, addBorrower } = useLoans();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const filtered = useMemo(() => borrowers.filter(b => (status === "All" || b.status === status) && `${b.name} ${b.loanId} ${b.phone}`.toLowerCase().includes(query.toLowerCase())), [borrowers, query, status]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const principal = Number(fd.get("principal"));
    const outstanding = Number(fd.get("outstanding"));
    const item: Borrower = {
      id: `b-${Date.now()}`,
      name: String(fd.get("name")), phone: String(fd.get("phone")), email: String(fd.get("email")),
      loanId: String(fd.get("loanId")), principal, outstanding,
      installment: Number(fd.get("installment")), dueDate: String(fd.get("dueDate")), daysPastDue: 0,
      status: String(fd.get("status")) as LoanStatus, riskScore: Number(fd.get("riskScore")), address: String(fd.get("address"))
    };
    addBorrower(item); setShowForm(false); e.currentTarget.reset();
  }

  return <div className="page-wrap">
    <PageHeader eyebrow="Accounts" title="Borrowers" subtitle="View loan accounts, outstanding balances, risk levels, and repayment status." action={<button className="button primary" onClick={() => setShowForm(true)}><Plus size={16}/> Add borrower</button>} />
    <div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search borrower, loan ID, phone..."/></div><select value={status} onChange={e => setStatus(e.target.value)}><option>All</option><option>Current</option><option>Due Soon</option><option>Overdue</option><option>Critical</option><option>Closed</option></select></div>
    <div className="panel flush"><div className="table-wrap"><table><thead><tr><th>Borrower</th><th>Loan</th><th>Status</th><th>Outstanding</th><th>Due date</th><th>Risk</th><th></th></tr></thead><tbody>{filtered.map(b => <tr key={b.id}><td><div className="person-cell"><div className="mini-avatar">{b.name.split(" ").map(x => x[0]).join("").slice(0,2)}</div><div><strong>{b.name}</strong><span>{b.phone}</span></div></div></td><td><strong>{b.loanId}</strong><span className="cell-sub">{money(b.principal)} original</span></td><td><StatusBadge status={b.status}/></td><td><strong>{money(b.outstanding)}</strong></td><td>{b.dueDate}<span className="cell-sub">{b.daysPastDue ? `${b.daysPastDue} days overdue` : "On schedule"}</span></td><td><strong>{b.riskScore}/100</strong></td><td><Link className="table-link" href={`/borrowers/${b.id}`}>Details</Link></td></tr>)}</tbody></table></div></div>

    {showForm && <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}><div className="modal" onMouseDown={e => e.stopPropagation()}><div className="modal-header"><div><h2>Add borrower</h2><p>Create a new loan recovery account.</p></div><button className="icon-button" onClick={() => setShowForm(false)}>×</button></div><form onSubmit={submit} className="form-grid"><label>Full name<input name="name" required /></label><label>Loan ID<input name="loanId" required placeholder="LN-24009"/></label><label>Phone<input name="phone" required /></label><label>Email<input name="email" type="email" required /></label><label>Principal<input name="principal" type="number" required /></label><label>Outstanding<input name="outstanding" type="number" required /></label><label>Installment<input name="installment" type="number" required /></label><label>Due date<input name="dueDate" type="date" required /></label><label>Risk score<input name="riskScore" type="number" min="0" max="100" defaultValue="50" required /></label><label>Status<select name="status" defaultValue="Current"><option>Current</option><option>Due Soon</option><option>Overdue</option><option>Critical</option><option>Closed</option></select></label><label className="full-span">Address<input name="address" required /></label><div className="form-actions full-span"><button type="button" className="button secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="button primary" type="submit">Create borrower</button></div></form></div></div>}
  </div>;
}
