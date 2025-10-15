import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const { data: userData, isLoading, refetch } = useCurrentUser();
  const { logout: logoutMutation } = useLogout();

  // Update user state when data changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else {
      setUser(null);
    }
  }, [userData]);

  // Check for existing user in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const logout = () => {
    setUser(null);
    logoutMutation();
  };

  const refetchUser = () => {
    refetch();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
