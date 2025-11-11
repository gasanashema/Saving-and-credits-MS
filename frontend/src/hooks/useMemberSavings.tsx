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

export default function useMemberSavings() {
  const { user } = useAuth();
  const [savings, setSavings] = useState<MemberSaving[]>([]);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberSavings = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await server.get<MemberSavingsResponse>(`/saving/transactions/${user.id}`);
      const data = response.data;
      
      setSavings(data.savings || []);
      setTotalSavings(data.totalSavings || 0);
    } catch (err) {
      console.error("Failed to fetch member savings:", err);
      setError(err instanceof Error ? err.message : String(err));
      setSavings([]);
      setTotalSavings(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMemberSavings();
    }
  }, [fetchMemberSavings, user]);

  return { 
    savings, 
    totalSavings, 
    loading, 
    error, 
    refresh: fetchMemberSavings 
  };
}