import { useState, useEffect } from 'react';

interface AuthData {
  userId: string | null;
  token: string | null;
}

export const useAuth = (): AuthData => {
  const [authData, setAuthData] = useState<AuthData>({
    userId: null,
    token: null
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    let userId = null;
    if (user) {
      try {
        const userData = JSON.parse(user);
        userId = userData.id || userData.user_id;
      } catch {
        userId = null;
      }
    }

    setAuthData({
      userId,
      token
    });
  }, []);

  return authData;
};