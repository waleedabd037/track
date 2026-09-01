"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, HandCoins, LayoutDashboard, Menu, Settings, ShieldCheck, Users, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/borrowers", label: "Borrowers", icon: Users },
  { href: "/recovery", label: "Recovery", icon: HandCoins },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><ShieldCheck size={21} /></div><div><strong>Recoverly</strong><span>Loan Recovery</span></div></div>
        <nav className="nav-list">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return <Link key={item.href} className={`nav-item ${active ? "active" : ""}`} href={item.href} onClick={() => setOpen(false)}><Icon size={18}/><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="sidebar-card"><BarChart3 size={20}/><strong>Recovery health</strong><p>Prioritize high-risk overdue accounts and document every contact.</p></div>
        <div className="sidebar-footer"><div className="avatar">RM</div><div><strong>Recovery Manager</strong><span>Administrator</span></div></div>
      </aside>
      {open && <button aria-label="Close menu" className="mobile-overlay" onClick={() => setOpen(false)} />}
      <main className="main-content">
        <header className="mobile-header"><button className="icon-button" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button><strong>Recoverly</strong></header>
        {children}
      </main>
    </div>
  );
}
