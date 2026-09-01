import type { LoanStatus } from "@/lib/types";

export const money = (value: number) => `PKR ${new Intl.NumberFormat("en-PK").format(value)}`;

export function StatusBadge({ status }: { status: LoanStatus }) {
  const key = status.toLowerCase().replace(" ", "-");
  return <span className={`badge badge-${key}`}>{status}</span>;
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{subtitle}</p></div>{action && <div className="page-actions">{action}</div>}</div>;
}

export function EmptyState({ text }: { text: string }) { return <div className="empty-state">{text}</div>; }
