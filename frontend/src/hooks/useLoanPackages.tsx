import { useState, useCallback, useEffect } from 'react';
import server from '../utils/server';
import { LoanPackage } from '../types/loanTypes';

export default function useLoanPackages() {
    const [packages, setPackages] = useState<LoanPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPackages = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await server.get<LoanPackage[]>('/loans/packages/all');
            setPackages(response.data);
        } catch (err) {
            console.error("Failed to fetch loan packages:", err);
            setError("Failed to load loan packages.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    return { packages, loading, error, refresh: fetchPackages };
}
