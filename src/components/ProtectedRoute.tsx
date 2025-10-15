import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "manager" | "developer" | "client";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading skeleton while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page. 
              Required role: {requiredRole}
            </p>
            <p className="text-sm text-muted-foreground">
              Your current role: {user?.role}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for easier usage
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  requiredRole?: "admin" | "manager" | "developer" | "client"
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
