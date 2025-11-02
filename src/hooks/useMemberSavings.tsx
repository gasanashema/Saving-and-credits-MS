import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { MemberSavings } from "../types/memberTypes";

export default function useMemberSavings(memberId: string, limit: number) {
  const [savings, setSavings] = useState<MemberSavings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMemberSavings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await server.get<MemberSavings[]>(`/members/${memberId}/savings/${limit}`);
      setSavings(resp.data);
    } catch (error) {
      console.error("Failed to fetch member savings:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [memberId, limit]);

  useEffect(() => {
    if (memberId) {
      getMemberSavings();
    }
  }, [getMemberSavings, memberId]);

  return { savings, loading, error, refresh: getMemberSavings };
}
