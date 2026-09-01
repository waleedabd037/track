"use client";

import { FormEvent, useState } from "react";
import { Plus, ReceiptText } from "lucide-react";
import { useLoans } from "@/components/loan-provider";
import { money, PageHeader } from "@/components/ui";
import type { Payment } from "@/lib/types";

export default function PaymentsPage() {
  const { payments, borrowers, addPayment } = useLoans();
  const [show, setShow] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const fd = new FormData(e.currentTarget); const borrowerId = String(fd.get("borrowerId")); const b = borrowers.find(x => x.id === borrowerId)!; const item: Payment = { id:`p-${Date.now()}`, borrowerId, borrowerName:b.name, amount:Number(fd.get("amount")), date:String(fd.get("date")), method:String(fd.get("method")) as Payment["method"], reference:String(fd.get("reference")) }; addPayment(item); setShow(false); }
  const total = payments.reduce((s,p)=>s+p.amount,0);
  return <div className="page-wrap"><PageHeader eyebrow="Transactions" title="Payments" subtitle="Record repayments and maintain a clear recovery transaction history." action={<button className="button primary" onClick={()=>setShow(true)}><Plus size={16}/> Record payment</button>}/>
    <section className="stat-grid three"><div className="stat-card"><div className="stat-icon success"><ReceiptText/></div><span>Total recorded</span><strong>{money(total)}</strong><small>All demo transactions</small></div><div className="stat-card"><span>Payments</span><strong>{payments.length}</strong><small>Transaction records</small></div><div className="stat-card"><span>Average payment</span><strong>{money(payments.length ? Math.round(total/payments.length) : 0)}</strong><small>Across all repayments</small></div></section>
    <div className="panel flush"><div className="table-wrap"><table><thead><tr><th>Date</th><th>Borrower</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead><tbody>{payments.map(p=><tr key={p.id}><td>{p.date}</td><td><strong>{p.borrowerName}</strong></td><td><strong>{money(p.amount)}</strong></td><td>{p.method}</td><td><span className="mono">{p.reference}</span></td></tr>)}</tbody></table></div></div>
    {show && <div className="modal-backdrop" onMouseDown={()=>setShow(false)}><div className="modal compact" onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><div><h2>Record payment</h2><p>Apply a repayment to a borrower account.</p></div><button className="icon-button" onClick={()=>setShow(false)}>×</button></div><form className="form-grid" onSubmit={submit}><label className="full-span">Borrower<select name="borrowerId" required>{borrowers.filter(b=>b.outstanding>0).map(b=><option value={b.id} key={b.id}>{b.name} · {b.loanId}</option>)}</select></label><label>Amount<input name="amount" type="number" min="1" required/></label><label>Date<input name="date" type="date" defaultValue="2026-09-01" required/></label><label>Method<select name="method"><option>Bank</option><option>Cash</option><option>Card</option><option>Wallet</option></select></label><label>Reference<input name="reference" required placeholder="TRX-..."/></label><div className="form-actions full-span"><button type="button" className="button secondary" onClick={()=>setShow(false)}>Cancel</button><button className="button primary">Save payment</button></div></form></div></div>}
  </div>;
}
