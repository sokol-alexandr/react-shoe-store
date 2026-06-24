import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Role } from '../types';

// Define the shape of our context data
type AuthContextType = {
  user: User | null;
  // Function to simulate login / role switching
  loginAs: (role: Role) => void; 
  logout: () => void;
};

// Create mock users for testing purposes
const MOCK_CUSTOMER: User = { id: 1, name: 'John (Customer)', role: 'CUSTOMER' };
const MOCK_EMPLOYEE: User = { id: 2, name: 'Alice (Admin)', role: 'EMPLOYEE' };

// Create the context with an empty default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps our app and holds the state
export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with a customer logged in by default
  const [user, setUser] = useState<User | null>(MOCK_CUSTOMER);

  const loginAs = (role: Role) => {
    if (role === 'CUSTOMER') setUser(MOCK_CUSTOMER);
    if (role === 'EMPLOYEE') setUser(MOCK_EMPLOYEE);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to easily consume the context in any component
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}