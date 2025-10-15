import { api } from "@/lib/api";
import type { ApiResponse } from "@/lib/api";
import type {
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest,
  User,
} from "@/types";

// Authentication API endpoints
export const authApi = {
  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    return api.post<ApiResponse<AuthResponse>>("/auth/login", credentials);
  },

  // Register new user
  signup: async (credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> => {
    return api.post<ApiResponse<AuthResponse>>("/auth/signup", credentials);
  },

  // Logout user
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>("/auth/logout", {});
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    return response;
  },

  // Refresh access token
  refreshToken: async (): Promise<ApiResponse<AuthResponse>> => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    return api.post<ApiResponse<AuthResponse>>("/auth/refresh", {
      refresh_token: refreshToken,
    });
  },

  // Get current user profile
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return api.get<ApiResponse<User>>("/auth/me");
  },

  // Request password reset
  requestPasswordReset: async (data: PasswordResetRequest): Promise<ApiResponse<void>> => {
    return api.post<ApiResponse<void>>("/auth/password-reset", data);
  },

  // Confirm password reset
  confirmPasswordReset: async (data: PasswordResetConfirm): Promise<ApiResponse<void>> => {
    return api.post<ApiResponse<void>>("/auth/password-reset/confirm", data);
  },

  // Request email verification
  requestEmailVerification: async (data: EmailVerificationRequest): Promise<ApiResponse<void>> => {
    return api.post<ApiResponse<void>>("/auth/verify-email", data);
  },

  // Verify email with token
  verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
    return api.post<ApiResponse<void>>("/auth/verify-email/confirm", { token });
  },

  // OAuth callback
  oauthCallback: async (provider: string, code: string, state?: string): Promise<ApiResponse<AuthResponse>> => {
    return api.post<ApiResponse<AuthResponse>>("/auth/oauth-callback", {
      provider,
      code,
      state,
    });
  },

  // Get OAuth providers
  getOAuthProviders: async (): Promise<ApiResponse<{ providers: Array<{ name: string; display_name: string; url: string }> }>> => {
    return api.get<ApiResponse<{ providers: Array<{ name: string; display_name: string; url: string }> }>>("/auth/oauth-providers");
  },
};
