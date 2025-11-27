import React, { createContext, useState, useContext, useEffect, type ReactNode } from "react";
import type { User } from "@/schema/index";
import { useNavigate } from "react-router";

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('crowdgraph-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        // Validate user data structure
        if (parsedUser && parsedUser.id && parsedUser.username) {
          return parsedUser;
        }
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem('crowdgraph-user');
    }
    return null;
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('crowdgraph-user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Validate user data
          if (!parsedUser || !parsedUser.id || !parsedUser.username) {
            console.warn('Invalid user data in localStorage, clearing...');
            localStorage.removeItem('crowdgraph-user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('crowdgraph-user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      try {
        // Validate user data before saving
        if (user.id && user.username) {
          localStorage.setItem('crowdgraph-user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Failed to save user to localStorage:', error);
      }
    } else {
      localStorage.removeItem('crowdgraph-user');
    }
  }, [user]);

  // Helper function to log in
  const login = (userData: User) => {
    if (!userData || !userData.id || !userData.username) {
      console.error('Invalid user data provided to login');
      return;
    }
    setUser(userData);
  };

  // Helper function to log out
  const logout = () => {
    setUser(null);
    localStorage.removeItem('crowdgraph-user');
    navigate('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      logout, 
      isLoading,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};




