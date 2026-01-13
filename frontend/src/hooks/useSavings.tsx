import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { SavingType } from "../types/savingTypes";

export default function useSavings(limit: number) {
  const [savings, setSavings] = useState<SavingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMemberSavings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await server.get<SavingType[]>(`/saving/${limit}?t=${Date.now()}`);
      setSavings(resp.data);
    } catch (error) {
      console.error("Failed to fetch member savings:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    
      getMemberSavings();

  }, [getMemberSavings,limit]);

  return { savings, loading, error, refresh: getMemberSavings };
}
