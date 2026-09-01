export type LoanStatus = "Current" | "Due Soon" | "Overdue" | "Critical" | "Closed";
export type ContactChannel = "Call" | "SMS" | "Email" | "Visit";

export interface Borrower {
  id: string;
  name: string;
  phone: string;
  email: string;
  loanId: string;
  principal: number;
  outstanding: number;
  installment: number;
  dueDate: string;
  daysPastDue: number;
  status: LoanStatus;
  riskScore: number;
  address: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface Payment {
  id: string;
  borrowerId: string;
  borrowerName: string;
  amount: number;
  date: string;
  method: "Bank" | "Cash" | "Card" | "Wallet";
  reference: string;
}

export interface RecoveryAction {
  id: string;
  borrowerId: string;
  borrowerName: string;
  channel: ContactChannel;
  note: string;
  date: string;
  outcome: "Promise to pay" | "No answer" | "Paid" | "Dispute" | "Follow-up";
  nextFollowUp?: string;
}
