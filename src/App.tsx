import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectPage from "@/pages/ProjectPage";
import IntakePage from "@/pages/IntakePage";
import BookingPage from "@/pages/BookingPage";
import ProposalsPage from "@/pages/ProposalsPage";
import ClientPortalPage from "@/pages/ClientPortalPage";
import AICopilotPage from "@/pages/AICopilotPage";
import BillingPage from "@/pages/BillingPage";
import TimeTrackingPage from "@/pages/TimeTrackingPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<PasswordResetPage />} />
                <Route path="/verify-email" element={<EmailVerificationPage />} />
                <Route path="/intake" element={<IntakePage />} />
                <Route path="/intake/book" element={<BookingPage />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/project/:id" 
                  element={
                    <ProtectedRoute>
                      <ProjectPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/proposals" 
                  element={
                    <ProtectedRoute>
                      <ProposalsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client-portal/:id" 
                  element={
                    <ProtectedRoute>
                      <ClientPortalPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ai-copilot" 
                  element={
                    <ProtectedRoute>
                      <AICopilotPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/billing" 
                  element={
                    <ProtectedRoute>
                      <BillingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/time-tracking" 
                  element={
                    <ProtectedRoute>
                      <TimeTrackingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
