import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { BackendLoan, LoanStatus } from "../types/loanTypes";
import { useAuth } from "../context/AuthContext";

export default function useLoans(limit: number) {
  const { user } = useAuth();
  const [loans, setLoans] = useState<BackendLoan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLoans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use member-specific endpoint for members, admin endpoint for admins
      const endpoint = user?.role === 'member'
        ? `/loans/member/${user.id}`
        : (limit ? `/loans/${limit}` : `/loans/30`);

      const resp = await server.get<BackendLoan[]>(endpoint);
      const raw = Array.isArray(resp.data) ? resp.data : [];

      // Normalize backend field names to BackendLoan interface
      const normalized: BackendLoan[] = raw.map((item: any) => ({
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
        // Handle both lstatus and status fields, normalize 'approved' to 'active'
        status: String(item.lstatus ?? item.status ?? "").toLowerCase(),
        id: Number(item.id ?? 0),
        nid: String(item.nid ?? ""),
        firstName: String(item.firstName ?? item.firstname ?? item.first_name ?? ""),
        lastName: String(item.lastName ?? item.lastname ?? item.last_name ?? "")
      }));

      setLoans(normalized);
    } catch (err) {
      console.error("Failed to fetch loans:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    getLoans();
  }, [getLoans]);

  return {
    loans,
    loading,
    error,
    refresh: getLoans
  };
}