import React, { useEffect, useState, createContext, useContext } from 'react';
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: () => {}
});
export const useAuth = () => useContext(AuthContext);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);
  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    return new Promise(resolve => {
      setTimeout(() => {
        // Simple validation for demo purposes
        if (email === 'admin@unitysave.com' && password === 'password') {
          const userData: User = {
            id: '1',
            name: 'Admin User',
            email: 'admin@unitysave.com',
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
          };
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000); // Simulate API delay
    });
  };
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };
  return <AuthContext.Provider value={{
    isAuthenticated,
    user,
    login,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
};