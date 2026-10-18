import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/admin-auth';
import AdminDashboard from './ui';
export const dynamic = 'force-dynamic';
export default async function AdminPage(){if(!await isAdmin())redirect('/admin/login');return <main className="page"><div className="shell"><header className="topbar"><div className="brand"><div className="brand-mark">L</div><div>LoanTrack<div className="small muted" style={{fontWeight:400,marginTop:3}}>Administrator dashboard</div></div></div><Link href="/" className="back">Public lookup ↗</Link></header><AdminDashboard/></div></main>}
