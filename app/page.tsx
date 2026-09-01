"use client";

import Link from "next/link";
import { ArrowRight, Banknote, CalendarClock, CircleAlert, HandCoins, TrendingUp, Users } from "lucide-react";
import { useLoans } from "@/components/loan-provider";
import { money, PageHeader, StatusBadge } from "@/components/ui";

export default function DashboardPage() {
  const { borrowers, payments, actions } = useLoans();
  const outstanding = borrowers.reduce((s, b) => s + b.outstanding, 0);
  const overdue = borrowers.filter((b) => b.daysPastDue > 0 && b.outstanding > 0);
  const overdueBalance = overdue.reduce((s, b) => s + b.outstanding, 0);
  const recovered = payments.filter((p) => p.date >= "2026-08-01").reduce((s, p) => s + p.amount, 0);
  const highRisk = borrowers.filter((b) => b.riskScore >= 70 && b.outstanding > 0).length;
  const priority = [...borrowers].filter((b) => b.outstanding > 0).sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  return <div className="page-wrap">
    <PageHeader eyebrow="Portfolio overview" title="Recovery Dashboard" subtitle="Track collections, prioritize overdue accounts, and keep recovery activity organized." action={<Link className="button primary" href="/recovery">Open recovery queue <ArrowRight size={16}/></Link>} />

    <section className="stat-grid">
      <div className="stat-card"><div className="stat-icon"><Banknote/></div><span>Total outstanding</span><strong>{money(outstanding)}</strong><small>Across {borrowers.filter(b => b.outstanding > 0).length} active loans</small></div>
      <div className="stat-card"><div className="stat-icon warning"><CircleAlert/></div><span>Overdue balance</span><strong>{money(overdueBalance)}</strong><small>{overdue.length} accounts need action</small></div>
      <div className="stat-card"><div className="stat-icon success"><TrendingUp/></div><span>Recovered this month</span><strong>{money(recovered)}</strong><small>{payments.filter(p => p.date >= "2026-08-01").length} recorded payments</small></div>
      <div className="stat-card"><div className="stat-icon danger"><Users/></div><span>High-risk accounts</span><strong>{highRisk}</strong><small>Risk score 70 or above</small></div>
    </section>

    <section className="dashboard-grid">
      <div className="panel span-2">
        <div className="panel-header"><div><h2>Priority accounts</h2><p>Highest-risk accounts requiring collection activity.</p></div><Link href="/borrowers">View all</Link></div>
        <div className="table-wrap"><table><thead><tr><th>Borrower</th><th>Status</th><th>Outstanding</th><th>DPD</th><th>Risk</th><th></th></tr></thead><tbody>{priority.map((b) => <tr key={b.id}><td><div className="person-cell"><div className="mini-avatar">{b.name.split(" ").map(x => x[0]).join("").slice(0,2)}</div><div><strong>{b.name}</strong><span>{b.loanId}</span></div></div></td><td><StatusBadge status={b.status}/></td><td><strong>{money(b.outstanding)}</strong></td><td>{b.daysPastDue} days</td><td><div className="risk-cell"><span>{b.riskScore}</span><div className="risk-track"><i style={{width: `${b.riskScore}%`}} /></div></div></td><td><Link className="table-link" href={`/borrowers/${b.id}`}>Open</Link></td></tr>)}</tbody></table></div>
      </div>

      <div className="panel">
        <div className="panel-header"><div><h2>Today&apos;s workload</h2><p>Recovery tasks due now.</p></div></div>
        <div className="workload-list">
          <div className="workload-item"><div className="workload-icon"><CalendarClock/></div><div><strong>{actions.filter(a => a.nextFollowUp === "2026-09-01").length}</strong><span>Follow-ups due today</span></div></div>
          <div className="workload-item"><div className="workload-icon"><HandCoins/></div><div><strong>{overdue.length}</strong><span>Overdue borrowers</span></div></div>
          <div className="workload-item"><div className="workload-icon"><CircleAlert/></div><div><strong>{highRisk}</strong><span>Critical reviews</span></div></div>
        </div>
        <Link className="button secondary full" href="/recovery">Start recovery work</Link>
      </div>
    </section>

    <section className="panel">
      <div className="panel-header"><div><h2>Recent recovery activity</h2><p>Latest contact and follow-up records.</p></div></div>
      <div className="activity-list">{actions.slice(0,5).map(a => <div className="activity-item" key={a.id}><div className="activity-dot"/><div className="activity-body"><div><strong>{a.borrowerName}</strong><span className="activity-channel">{a.channel}</span></div><p>{a.note}</p><small>{a.date} · {a.outcome}{a.nextFollowUp ? ` · Next: ${a.nextFollowUp}` : ""}</small></div></div>)}</div>
    </section>
  </div>;
}
