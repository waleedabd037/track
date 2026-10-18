import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'LoanTrack | Loan records', description: 'Securely view and manage loan records.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
