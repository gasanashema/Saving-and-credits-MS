import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { useAuth } from "../context/AuthContext";

interface MemberProfile {
  member_id: number;
  nid: string;
  firstName: string;
  lastName: string;
  telephone: string;
  email: string;
  balance: number;
}

export default function useMemberProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await server.get<MemberProfile>("/members/profile");
      setProfile(response.data);
    } catch (err) {
      console.error("Failed to fetch member profile:", err);
      setError(err instanceof Error ? err.message : String(err));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [fetchProfile, user]);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile
  };
}