import { useEffect, useState, useCallback } from 'react';
import server from '../utils/server';
import { useAuth } from '../context/AuthContext';

export default function usePendingLoanPaymentsCount() {
  const { user } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCount = useCallback(async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'sadmin')) {
      setCount(0);
      return;
    }
    
    setLoading(true);
    try {
      const res = await server.get('/loans/payments/pending/count');
      if (res.data && typeof res.data.count === 'number') {
        setCount(res.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch pending loan payments count', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCount();

    const handleUpdate = () => fetchCount();
    window.addEventListener('repayments:changed', handleUpdate);
    
    // Optional: poll every minute to keep it fresh for admins
    const interval = setInterval(fetchCount, 60000);

    return () => {
      window.removeEventListener('repayments:changed', handleUpdate);
      clearInterval(interval);
    };
  }, [fetchCount]);

  return { count, loading, refresh: fetchCount };
}
