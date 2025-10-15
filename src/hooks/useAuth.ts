import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth";
import { OAuthService } from "@/services/OAuthService";
import type {
  LoginCredentials,
  SignupCredentials,
  PasswordResetRequest,
  PasswordResetConfirm,
  OTPVerification,
  PasswordResetWithOTP,
  EmailVerificationRequest,
} from "@/types";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember_me: z.boolean().optional(),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  company: z.string().optional(),
  role: z.enum(["admin", "manager", "developer", "client"]),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const passwordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const emailVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const passwordResetWithOTPSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// Hook for login form
export const useLoginForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.data) {
        // Store tokens
        localStorage.setItem("auth_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Update query cache
        queryClient.setQueryData(["user"], response.data.user);

        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  return {
    form,
    onSubmit,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
};

// Hook for signup form
export const useSignupForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<SignupCredentials & { confirm_password: string }>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
      full_name: "",
      company: "",
      role: "client",
    },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (response) => {
      if (response.data) {
        // Store tokens
        localStorage.setItem("auth_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Update query cache
        queryClient.setQueryData(["user"], response.data.user);

        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const { confirm_password: _, ...signupData } = data;
    signupMutation.mutate(signupData);
  });

  return {
    form,
    onSubmit,
    isLoading: signupMutation.isPending,
    error: signupMutation.error,
  };
};

// Hook for password reset request
export const usePasswordResetForm = () => {
  const form = useForm<PasswordResetRequest>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: authApi.requestPasswordReset,
    onSuccess: () => {
      toast.success("Password reset email sent!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    resetMutation.mutate(data);
  });

  return {
    form,
    onSubmit,
    isLoading: resetMutation.isPending,
    error: resetMutation.error,
  };
};

// Hook for password reset confirmation
export const usePasswordResetConfirmForm = (token: string) => {
  const navigate = useNavigate();

  const form = useForm<PasswordResetConfirm>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: {
      token,
      password: "",
      confirm_password: "",
    },
  });

  const confirmMutation = useMutation({
    mutationFn: authApi.confirmPasswordReset,
    onSuccess: () => {
      toast.success("Password reset successfully!");
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Password reset failed");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    confirmMutation.mutate(data);
  });

  return {
    form,
    onSubmit,
    isLoading: confirmMutation.isPending,
    error: confirmMutation.error,
  };
};

// Hook for email verification
export const useEmailVerificationForm = () => {
  const form = useForm<EmailVerificationRequest>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: "",
    },
  });

  const verificationMutation = useMutation({
    mutationFn: authApi.requestEmailVerification,
    onSuccess: () => {
      toast.success("Verification email sent!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send verification email");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    verificationMutation.mutate(data);
  });

  return {
    form,
    onSubmit,
    isLoading: verificationMutation.isPending,
    error: verificationMutation.error,
  };
};

// Hook for OAuth authentication
export const useOAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleOAuthLogin = (provider: "google" | "github") => {
    OAuthService.initiateOAuth(provider, "/dashboard");
  };

  const handleOAuthCallback = async () => {
    if (!OAuthService.isOAuthCallback()) {
      return;
    }

    const params = OAuthService.extractOAuthParams();
    if (!params) {
      toast.error("Invalid OAuth callback");
      return;
    }

    try {
      const response = await OAuthService.handleCallback(
        params.provider,
        params.code,
        params.state
      );

      if (response) {
        // Update query cache
        queryClient.setQueryData(["user"], response.user);
        toast.success("Successfully authenticated!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("OAuth callback error:", error);
      toast.error("OAuth authentication failed");
      navigate("/login");
    }
  };

  return {
    handleOAuthLogin,
    handleOAuthCallback,
  };
};

// Hook for current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!localStorage.getItem("auth_token"),
    retry: false,
  });
};

// Hook for logout
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      toast.success("Logged out successfully");
      navigate("/login");
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      // Even if logout fails on server, clear local data
      queryClient.clear();
      localStorage.clear();
      navigate("/login");
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    logout,
    isLoading: logoutMutation.isPending,
  };
};

// Hook for OTP verification
export const useOTPVerificationForm = () => {
  const form = useForm<OTPVerification>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const verificationMutation = useMutation({
    mutationFn: authApi.verifyOTP,
    onSuccess: () => {
      toast.success("OTP verified successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "OTP verification failed");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    verificationMutation.mutate(data);
  });

  return {
    form,
    onSubmit,
    isLoading: verificationMutation.isPending,
    error: verificationMutation.error,
  };
};

// Hook for password reset with OTP
export const usePasswordResetWithOTPForm = () => {
  const navigate = useNavigate();

  const form = useForm<PasswordResetWithOTP>({
    resolver: zodResolver(passwordResetWithOTPSchema),
    defaultValues: {
      email: "",
      otp: "",
      password: "",
      confirm_password: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: authApi.resetPasswordWithOTP,
    onSuccess: () => {
      toast.success("Password reset successfully!");
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Password reset failed");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    resetMutation.mutate(data);
  });

  return {
    form,
    onSubmit,
    isLoading: resetMutation.isPending,
    error: resetMutation.error,
  };
};
