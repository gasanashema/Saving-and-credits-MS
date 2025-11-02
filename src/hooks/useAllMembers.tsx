import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { Member } from "../types/memberTypes";

export default function useAllMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await server.get<Member[]>("/members");
      setMembers(resp.data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getMembers();
  }, [getMembers]);

  return { members, loading, error, refresh: getMembers };
}
