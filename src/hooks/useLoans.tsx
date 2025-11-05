import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";

export interface Loan {
  loanId: number;
  requestDate: string;
  re?: string | null;
  amount: number;
  rate: number;
  duration: number;
  applovedDate?: string | null;
  apploverId?: number | null;
  memberId: number;
  amountToPay: number;
  payedAmount: number;
  status: string;
  id: number; // member id (joined)
  nid: string;
  firstName: string;
  lastName: string;
}

export default function useLoans(status: string, limit: number) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLoans = useCallback(async () => {
    if (!status) {
      setLoans([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await server.get<any[]>(`/loan/${status}/${limit}`);
      // resp.data could be the array or resp itself depending on axios wrapper
      const raw = Array.isArray(resp.data) ? resp.data : resp;

      // Normalize backend field names to Loan interface
      const normalized: Loan[] = raw.map((item: any) => {
        return {
          loanId: Number(item.loanId ?? item.loan_id ?? item.id ?? 0),
          requestDate: item.requestDate ?? item.request_date ?? item.requestAt ?? "",
          re: item.re ?? null,
          amount: Number(item.amount ?? 0),
          rate: Number(item.rate ?? 0),
          duration: Number(item.duration ?? 0),
          applovedDate: item.applovedDate ?? item.apploved_date ?? item.approvedDate ?? null,
          apploverId: item.apploverId ?? item.applover_id ?? item.approverId ?? null,
          memberId: Number(item.memberId ?? item.member_id ?? 0),
          amountToPay: Number(item.amountTopay ?? item.amountToPay ?? item.amount_to_pay ?? item.amounttopay ?? 0),
          payedAmount: Number(item.payedAmount ?? item.paidAmount ?? item.payed_amount ?? 0),
          status: String(item.lstatus ?? item.status ?? ""),
          id: Number(item.id ?? 0),
          nid: String(item.nid ?? ""),
          firstName: String(item.firstName ?? item.firstname ?? item.first_name ?? ""),
          lastName: String(item.lastName ?? item.lastname ?? item.last_name ?? ""),
        };
      });

      setLoans(normalized);
    } catch (err) {
      console.error("Failed to fetch loans:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [status, limit]);

  useEffect(() => {
    getLoans();
  }, [getLoans]);

  return { loans, loading, error, refresh: getLoans };
}