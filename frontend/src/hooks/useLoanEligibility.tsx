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

    const checkEligibility = useCallback(async () => {
        if (!user || !user.id) return;

        setLoading(true);
        setError(null);
        try {
            const response = await server.get<EligibilityResult>(`/loans/eligibility/${user.id}`);
            setEligibility(response.data);
        } catch (err) {
            console.error("Failed to check eligibility:", err);
            setError("Failed to load loan limit.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && user.id) {
            checkEligibility();
        }
    }, [checkEligibility, user]);

    return { eligibility, loading, error, refresh: checkEligibility };
}
