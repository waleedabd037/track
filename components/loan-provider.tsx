"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { demoActions, demoBorrowers, demoPayments } from "@/lib/demo-data";
import type { Borrower, Payment, RecoveryAction } from "@/lib/types";

type LoanContextValue = {
  borrowers: Borrower[];
  payments: Payment[];
  actions: RecoveryAction[];
  addBorrower: (borrower: Borrower) => void;
  addPayment: (payment: Payment) => void;
  addAction: (action: RecoveryAction) => void;
  resetDemo: () => void;
};

const LoanContext = createContext<LoanContextValue | null>(null);

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [borrowers, setBorrowers] = useState<Borrower[]>(demoBorrowers);
  const [payments, setPayments] = useState<Payment[]>(demoPayments);
  const [actions, setActions] = useState<RecoveryAction[]>(demoActions);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("recoverly-data-v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        setBorrowers(parsed.borrowers ?? demoBorrowers);
        setPayments(parsed.payments ?? demoPayments);
        setActions(parsed.actions ?? demoActions);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("recoverly-data-v1", JSON.stringify({ borrowers, payments, actions }));
  }, [borrowers, payments, actions, hydrated]);

  const addBorrower = (borrower: Borrower) => setBorrowers((v) => [borrower, ...v]);

  const addPayment = (payment: Payment) => {
    setPayments((v) => [payment, ...v]);
    setBorrowers((v) => v.map((b) => {
      if (b.id !== payment.borrowerId) return b;
      const outstanding = Math.max(0, b.outstanding - payment.amount);
      return {
        ...b,
        outstanding,
        lastPaymentDate: payment.date,
        lastPaymentAmount: payment.amount,
        status: outstanding === 0 ? "Closed" : b.status,
      };
    }));
  };

  const addAction = (action: RecoveryAction) => setActions((v) => [action, ...v]);
  const resetDemo = () => {
    setBorrowers(demoBorrowers);
    setPayments(demoPayments);
    setActions(demoActions);
  };

  const value = useMemo(() => ({ borrowers, payments, actions, addBorrower, addPayment, addAction, resetDemo }), [borrowers, payments, actions]);
  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
}

export function useLoans() {
  const ctx = useContext(LoanContext);
  if (!ctx) throw new Error("useLoans must be used inside LoanProvider");
  return ctx;
}
