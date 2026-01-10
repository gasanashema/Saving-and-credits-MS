import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { useAuth } from "../context/AuthContext";

interface MemberSaving {
  sav_id: number;
  date: string;
  numberOfShares: number;
  shareValue: number;
  amount: number;
  type: string;
}

interface MemberSavingsResponse {
  savings: MemberSaving[];
  totalSavings: number;
  count: number;
}

export default function useMemberSavings(memberId?: string) {
  const { user } = useAuth();
  const [savings, setSavings] = useState<MemberSaving[]>([]);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetMemberId = memberId || user?.id;

  const fetchMemberSavings = useCallback(async () => {
    if (!targetMemberId) {
      // member id not yet available (auth still loading) — don't treat as an error
      console.log('fetchMemberSavings skipped: no member id');
      return;
    }

    console.log('fetchMemberSavings starting for memberId:', targetMemberId);
    setLoading(true);
    setError(null);

    try {
      const response = await server.get<MemberSavingsResponse>(`/saving/transactions/${targetMemberId}`);
      const data = response.data;
      console.log('fetchMemberSavings response:', data);

      // Normalize savings items to consistent shape
      const normalized = (data.savings || []).map((s: any) => ({
        sav_id: s.sav_id ?? s.savId ?? s.id ?? null,
        id: s.sav_id ?? s.savId ?? s.id ?? null,
        date: s.date,
        numberOfShares: Number(s.numberOfShares || s.number_of_shares || 0),
        shareValue: Number(s.shareValue || s.sharevalue || s.share_value || 0),
        amount: Number(s.amount || (s.numberOfShares && s.shareValue ? s.numberOfShares * s.shareValue : 0) || 0),
        type: s.type || s.title || s.name || ''
      }));

      console.log('fetchMemberSavings normalized sample:', normalized[0] || null);

      setSavings(normalized);
      setTotalSavings(data.totalSavings || 0);
    } catch (err) {
      console.error("Failed to fetch member savings:", err);
      setError(err instanceof Error ? err.message : String(err));
      setSavings([]);
      setTotalSavings(0);
    } finally {
      setLoading(false);
    }
  }, [targetMemberId]);

  useEffect(() => {
    if (targetMemberId) {
      fetchMemberSavings();
    }
  }, [fetchMemberSavings, targetMemberId]);

  return { 
    savings, 
    totalSavings, 
    loading, 
    error, 
    refresh: fetchMemberSavings 
  };
}