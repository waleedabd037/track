"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Mail, MapPin, Phone } from "lucide-react";
import { useParams } from "next/navigation";
import { useLoans } from "@/components/loan-provider";
import { money, StatusBadge } from "@/components/ui";

export default function BorrowerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { borrowers, payments, actions } = useLoans();
  const b = borrowers.find(x => x.id === id);
  if (!b) return <div className="page-wrap"><Link className="back-link" href="/borrowers"><ArrowLeft size={16}/> Borrowers</Link><div className="empty-state">Borrower not found.</div></div>;
  const p = payments.filter(x => x.borrowerId === b.id);
  const a = actions.filter(x => x.borrowerId === b.id);
  const paid = b.principal - b.outstanding;
  const progress = Math.min(100, Math.round((paid / b.principal) * 100));
  return <div className="page-wrap">
    <Link className="back-link" href="/borrowers"><ArrowLeft size={16}/> Back to borrowers</Link>
    <div className="detail-hero"><div className="large-avatar">{b.name.split(" ").map(x => x[0]).join("").slice(0,2)}</div><div className="detail-title"><div><h1>{b.name}</h1><StatusBadge status={b.status}/></div><p>{b.loanId} · {b.daysPastDue ? `${b.daysPastDue} days past due` : "Account on schedule"}</p></div><Link className="button primary" href="/recovery">Record recovery action</Link></div>
    <section className="detail-grid">
      <div className="panel span-2"><h2>Loan overview</h2><div className="metric-row"><div><span>Original principal</span><strong>{money(b.principal)}</strong></div><div><span>Outstanding</span><strong>{money(b.outstanding)}</strong></div><div><span>Installment</span><strong>{money(b.installment)}</strong></div><div><span>Risk score</span><strong>{b.riskScore}/100</strong></div></div><div className="progress-section"><div><span>Repayment progress</span><strong>{progress}%</strong></div><div className="progress-track"><i style={{width:`${progress}%`}}/></div><small>{money(paid)} repaid · {money(b.outstanding)} remaining</small></div></div>
      <div className="panel"><h2>Contact details</h2><div className="contact-list"><div><Phone/><span>{b.phone}</span></div><div><Mail/><span>{b.email}</span></div><div><MapPin/><span>{b.address}</span></div><div><Calendar/><span>Due {b.dueDate}</span></div></div></div>
    </section>
    <section className="detail-grid">
      <div className="panel"><div className="panel-header"><div><h2>Payment history</h2><p>{p.length} recorded payments</p></div></div>{p.length ? <div className="simple-list">{p.map(x => <div key={x.id}><div><strong>{money(x.amount)}</strong><span>{x.method} · {x.reference}</span></div><small>{x.date}</small></div>)}</div> : <div className="empty-state small">No payments recorded.</div>}</div>
      <div className="panel"><div className="panel-header"><div><h2>Recovery history</h2><p>{a.length} contact actions</p></div></div>{a.length ? <div className="simple-list">{a.map(x => <div key={x.id}><div><strong>{x.channel} · {x.outcome}</strong><span>{x.note}</span></div><small>{x.date}</small></div>)}</div> : <div className="empty-state small">No recovery actions recorded.</div>}</div>
    </section>
  </div>;
}
