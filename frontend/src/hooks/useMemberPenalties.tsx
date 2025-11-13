import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { useAuth } from "../context/AuthContext";

export interface Penalty {
  p_id: number;
  date: string;
  amount: number;
  memberId: number;
  pstatus: 'wait' | 'paid';
  PayedArt: string | null;
  confirmedBy: number;
  firstName: string;
  lastName: string;
  id: number;
  telephone: string;
  reason: string;
}

export interface UseMemberPenaltiesResult {
  penalties: Penalty[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Fetch penalties for the current member from `penalities/data/0/50/all`.
 */
export default function useMemberPenalties(): UseMemberPenaltiesResult {
  const { user } = useAuth();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPenalties = useCallback(async () => {

    if (!user || user.id === undefined || user.id === null) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await server.get(`/penalities/member/${user.id}`);
      const rawPenalties: any[] = Array.isArray(resp.data) ? resp.data : [];

      const normalized: Penalty[] = rawPenalties.map((p: any) => ({
        p_id: Number(p.p_id ?? 0),
        date: p.date ?? "",
        amount: Number(p.amount ?? 0),
        memberId: Number(p.memberId ?? 0),
        pstatus: String(p.pstatus ?? "wait") as 'wait' | 'paid',
        PayedArt: p.PayedArt ?? null,
        confirmedBy: Number(p.confirmedBy ?? 0),
        firstName: p.firstName ?? "",
        lastName: p.lastName ?? "",
        id: Number(p.id ?? 0),
        telephone: p.telephone ?? "",
        reason: p.reason ?? "",
      }));

      setPenalties(normalized);
      setTotal(normalized.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPenalties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id !== undefined && user.id !== null) {
      void fetchPenalties();
    }
  }, [fetchPenalties, user]);

  return {
    penalties,
    total,
    loading,
    error,
    refresh: fetchPenalties,
  };
}