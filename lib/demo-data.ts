import type { Borrower, Payment, RecoveryAction } from "./types";

export const demoBorrowers: Borrower[] = [
  { id: "b1", name: "Ahmed Raza", phone: "+92 300 1234567", email: "ahmed@example.com", loanId: "LN-24001", principal: 450000, outstanding: 184500, installment: 37500, dueDate: "2026-08-12", daysPastDue: 20, status: "Overdue", riskScore: 72, address: "Gulberg, Lahore", lastPaymentDate: "2026-07-12", lastPaymentAmount: 37500 },
  { id: "b2", name: "Sara Khan", phone: "+92 321 5558844", email: "sara@example.com", loanId: "LN-24002", principal: 280000, outstanding: 93000, installment: 31000, dueDate: "2026-08-01", daysPastDue: 31, status: "Critical", riskScore: 88, address: "DHA, Karachi", lastPaymentDate: "2026-06-30", lastPaymentAmount: 31000 },
  { id: "b3", name: "Usman Ali", phone: "+92 333 8712231", email: "usman@example.com", loanId: "LN-24003", principal: 520000, outstanding: 260000, installment: 40000, dueDate: "2026-09-05", daysPastDue: 0, status: "Due Soon", riskScore: 42, address: "F-10, Islamabad", lastPaymentDate: "2026-08-05", lastPaymentAmount: 40000 },
  { id: "b4", name: "Mariam Noor", phone: "+92 302 2221133", email: "mariam@example.com", loanId: "LN-24004", principal: 190000, outstanding: 42000, installment: 21000, dueDate: "2026-09-15", daysPastDue: 0, status: "Current", riskScore: 18, address: "Cantt, Rawalpindi", lastPaymentDate: "2026-08-15", lastPaymentAmount: 21000 },
  { id: "b5", name: "Bilal Mahmood", phone: "+92 315 9001122", email: "bilal@example.com", loanId: "LN-24005", principal: 650000, outstanding: 397500, installment: 52500, dueDate: "2026-07-20", daysPastDue: 43, status: "Critical", riskScore: 94, address: "Model Town, Lahore", lastPaymentDate: "2026-06-20", lastPaymentAmount: 52500 },
  { id: "b6", name: "Hina Siddiqui", phone: "+92 304 6627810", email: "hina@example.com", loanId: "LN-24006", principal: 350000, outstanding: 140000, installment: 35000, dueDate: "2026-08-24", daysPastDue: 8, status: "Overdue", riskScore: 63, address: "Clifton, Karachi", lastPaymentDate: "2026-07-24", lastPaymentAmount: 35000 },
  { id: "b7", name: "Farhan Iqbal", phone: "+92 322 1188765", email: "farhan@example.com", loanId: "LN-24007", principal: 240000, outstanding: 0, installment: 30000, dueDate: "2026-08-10", daysPastDue: 0, status: "Closed", riskScore: 5, address: "Saddar, Peshawar", lastPaymentDate: "2026-08-10", lastPaymentAmount: 30000 },
  { id: "b8", name: "Ayesha Tariq", phone: "+92 334 9191002", email: "ayesha@example.com", loanId: "LN-24008", principal: 410000, outstanding: 205000, installment: 41000, dueDate: "2026-09-03", daysPastDue: 0, status: "Due Soon", riskScore: 39, address: "Johar Town, Lahore", lastPaymentDate: "2026-08-03", lastPaymentAmount: 41000 }
];

export const demoPayments: Payment[] = [
  { id: "p1", borrowerId: "b4", borrowerName: "Mariam Noor", amount: 21000, date: "2026-08-15", method: "Bank", reference: "TRX-874332" },
  { id: "p2", borrowerId: "b3", borrowerName: "Usman Ali", amount: 40000, date: "2026-08-05", method: "Wallet", reference: "TRX-874117" },
  { id: "p3", borrowerId: "b8", borrowerName: "Ayesha Tariq", amount: 41000, date: "2026-08-03", method: "Bank", reference: "TRX-873980" },
  { id: "p4", borrowerId: "b7", borrowerName: "Farhan Iqbal", amount: 30000, date: "2026-08-10", method: "Cash", reference: "RCPT-10088" },
  { id: "p5", borrowerId: "b1", borrowerName: "Ahmed Raza", amount: 37500, date: "2026-07-12", method: "Bank", reference: "TRX-869011" }
];

export const demoActions: RecoveryAction[] = [
  { id: "a1", borrowerId: "b2", borrowerName: "Sara Khan", channel: "Call", note: "Borrower requested three more days to arrange funds.", date: "2026-08-31", outcome: "Promise to pay", nextFollowUp: "2026-09-03" },
  { id: "a2", borrowerId: "b5", borrowerName: "Bilal Mahmood", channel: "SMS", note: "Final overdue reminder sent.", date: "2026-08-31", outcome: "Follow-up", nextFollowUp: "2026-09-02" },
  { id: "a3", borrowerId: "b1", borrowerName: "Ahmed Raza", channel: "Call", note: "No response after two call attempts.", date: "2026-08-30", outcome: "No answer", nextFollowUp: "2026-09-01" },
  { id: "a4", borrowerId: "b6", borrowerName: "Hina Siddiqui", channel: "Email", note: "Statement and payment link shared.", date: "2026-08-29", outcome: "Follow-up", nextFollowUp: "2026-09-02" }
];
