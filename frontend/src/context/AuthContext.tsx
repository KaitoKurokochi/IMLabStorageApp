import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, api } from '../api/client';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (firstName: string, lastName: string) => Promise<User>;
  register: (firstName: string, lastName: string, grade: string) => Promise<User>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'imlab_storage_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCurrentUserState(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load user from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (firstName: string, lastName: string): Promise<User> => {
    const user = await api.loginUser(firstName, lastName);
    setCurrentUser(user);
    return user;
  };

  const register = async (firstName: string, lastName: string, grade: string): Promise<User> => {
    const user = await api.createUser(firstName, lastName, grade);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        register,
        logout,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

