import { useState, useEffect } from 'react';

interface User {
  id: number;
  fullname: string;
  email: string;
  role: string;
  token: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(null);
      }
    }
  }, []);

  return { user, userId: user?.id || null };
};