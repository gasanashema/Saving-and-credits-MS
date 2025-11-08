import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";

export interface Payment {
  id: number; // pay_id
  date: string; // pay_date (ISO)
  amount: number; // payment_amount
  loanId: number;
  loanAmount: number;
  amountToPay: number;
  payedAmount: number;
  loanStatus: string;
  firstName?: string;
  lastName?: string;
  payerName?: string; // firstName + lastName
  telephone?: string;
  recorderName?: string;
  approverName?: string;
  remainingAmount?: number;
  penaltyType?: string;
  penaltyAmount?: number;
  penaltyStatus?: string;
  // raw extra fields allowed
  [key: string]: any;
}

export interface UseLoanPaymentsResult {
  payments: Payment[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Fetch recent loan payments from `loans/payments/recent`.
 * Optionally pass `limit` to include as query param.
 */
export default function useLoanPayments(limit?: number): UseLoanPaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await server.get("/loans/payments/recent", {
        params: limit ? { limit } : undefined,
      });

      const data = resp?.data ?? resp;
      const rawPayments: any[] = Array.isArray(data?.payments) ? data.payments : [];

      const normalized: Payment[] = rawPayments.map((p: any) => {
        const firstName = p.firstName ?? p.first_name ?? "";
        const lastName = p.lastName ?? p.last_name ?? "";
        return {
          id: Number(p.pay_id ?? p.id ?? 0),
          date: p.pay_date ?? p.date ?? "",
          amount: Number(p.payment_amount ?? p.amount ?? 0),
          loanId: Number(p.loanId ?? p.loan_id ?? 0),
          loanAmount: Number(p.loan_amount ?? p.loanAmount ?? 0),
          amountToPay: Number(p.amountTopay ?? p.amountToPay ?? 0),
          payedAmount: Number(p.payedAmount ?? p.paidAmount ?? 0),
          loanStatus: String(p.loan_status ?? p.lstatus ?? p.status ?? ""),
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          payerName: `${firstName} ${lastName}`.trim() || undefined,
          telephone: p.telephone ?? undefined,
          recorderName: p.recorder_name ?? p.recorderName ?? undefined,
          approverName: p.approver_name ?? undefined,
          remainingAmount: p.remaining_amount != null ? Number(p.remaining_amount) : undefined,
          penaltyType: p.penalty_type ?? undefined,
          penaltyAmount: p.penalty_amount != null ? Number(p.penalty_amount) : undefined,
          penaltyStatus: p.penalty_status ?? undefined,
          // keep original payload for debug if needed
          raw: p,
        };
      });

      setPayments(normalized);
      setTotal(Number(data?.total ?? normalized.length));
    } catch (err) {
      console.error("useLoanPayments error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    total,
    loading,
    error,
    refresh: fetchPayments,
  };
}