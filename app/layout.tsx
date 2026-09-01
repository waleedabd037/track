import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { LoanProvider } from "@/components/loan-provider";

export const metadata: Metadata = {
  title: "Recoverly | Loan Recovery",
  description: "Loan recovery and collections management dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LoanProvider>
          <AppShell>{children}</AppShell>
        </LoanProvider>
      </body>
    </html>
  );
}
