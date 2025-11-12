import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { LoanPaymentDetails } from "../types/loanTypes";

export interface UseLoanPaymentDetailsResult {
  paymentDetails: LoanPaymentDetails | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Fetch payment details for a specific loan from `loans/payment-details/:loanId`.
 */
export default function useLoanPaymentDetails(loanId: number | null): UseLoanPaymentDetailsResult {
  const [paymentDetails, setPaymentDetails] = useState<LoanPaymentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentDetails = useCallback(async () => {
    if (!loanId) {
      setPaymentDetails(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await server.get(`/loans/payment-details/${loanId}`);
      const data = resp?.data ?? resp;

      setPaymentDetails(data as LoanPaymentDetails);
    } catch (err) {
      console.error("useLoanPaymentDetails error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setPaymentDetails(null);
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => {
    void fetchPaymentDetails();
  }, [fetchPaymentDetails]);

  return {
    paymentDetails,
    loading,
    error,
    refresh: fetchPaymentDetails,
  };
}