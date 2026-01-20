import { useState, useCallback, useEffect } from 'react';
import server from '../utils/server';
import { useAuth } from '../context/AuthContext';

interface EligibilityFactors {
    totalSavings: number;
    baseLimit: number;
    consistencyFactor: number;
    repaymentFactor: number;
}

interface EligibilityResult {
    eligible: boolean;
    limit: number;
    factors: EligibilityFactors;
    reason?: string;
}

export default function useLoanEligibility() {
    const { user } = useAuth();
    const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkEligibility = useCallback(async (packageId?: number) => {
        if (!user || !user.id) return;

        setLoading(true);
        setError(null);
        try {
            const url = packageId 
                ? `/loans/eligibility/${user.id}?packageId=${packageId}` 
                : `/loans/eligibility/${user.id}`;
            const response = await server.get<EligibilityResult>(url);
            setEligibility(response.data);
        } catch (err) {
            console.error("Failed to check eligibility:", err);
            setError("Failed to load loan limit.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial check without package (default/standard)
    useEffect(() => {
        if (user && user.id) {
            checkEligibility();
        }
    }, [user]); // Removed checkEligibility from deps to avoid loop if not memoized correctly upstream, though useCallback handles it.

    return { eligibility, loading, error, refresh: checkEligibility };
}
