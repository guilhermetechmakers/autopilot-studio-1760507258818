import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Zap, Mail, CheckCircle, XCircle, Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { useEmailVerificationForm } from "@/hooks/useAuth";
import { authApi } from "@/api/auth";

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error" | "expired">("pending");
  const [isVerifying, setIsVerifying] = useState(false);

  const verificationForm = useEmailVerificationForm();

  // Handle token verification on page load
  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    }
  }, [token]);

  const verifyEmailToken = async (token: string) => {
    setIsVerifying(true);
    try {
      const response = await authApi.verifyEmail(token);
      if (response.error) {
        throw new Error(response.error);
      }
      setVerificationStatus("success");
    } catch (error) {
      console.error("Email verification error:", error);
      // Check if it's an expired token error
      if (error instanceof Error && error.message.includes("expired")) {
        setVerificationStatus("expired");
      } else {
        setVerificationStatus("error");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = () => {
    verificationForm.onSubmit();
  };

  // Success state
  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold gradient-text">Autopilot Studio</span>
            </Link>
          </div>

          <Card className="animate-fade-in-up border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4 animate-bounce-in">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Email verified!
              </CardTitle>
              <CardDescription className="text-base">
                Your email address has been successfully verified
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                You can now access all features of Autopilot Studio. 
                Welcome aboard!
              </p>
              <div className="space-y-3">
                <Link to="/dashboard">
                  <Button className="w-full btn-primary group">
                    <span>Go to Dashboard</span>
                    <ArrowLeft className="w-4 h-4 ml-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full hover:bg-secondary/50">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Expired state
  if (verificationStatus === "expired") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold gradient-text">Autopilot Studio</span>
            </Link>
          </div>

          <Card className="animate-fade-in-up border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4 animate-bounce-in">
                <XCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Link expired
              </CardTitle>
              <CardDescription className="text-base">
                This verification link has expired
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Verification links expire after 24 hours for security reasons. 
                Please request a new verification email.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleResendVerification}
                  variant="outline" 
                  className="w-full group hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-300 dark:hover:border-orange-700"
                  disabled={verificationForm.isLoading}
                >
                  {verificationForm.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                      Request new verification email
                    </>
                  )}
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full hover:bg-muted/50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold gradient-text">Autopilot Studio</span>
            </Link>
          </div>

          <Card className="animate-fade-in-up border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 animate-bounce-in">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Verification failed
              </CardTitle>
              <CardDescription className="text-base">
                The verification link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                The verification link may have expired or been used already. 
                Please request a new verification email.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleResendVerification}
                  variant="outline" 
                  className="w-full group hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-700"
                  disabled={verificationForm.isLoading}
                >
                  {verificationForm.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                      Resend verification email
                    </>
                  )}
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full hover:bg-muted/50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state (verifying token)
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold gradient-text">Autopilot Studio</span>
            </Link>
          </div>

          <Card className="animate-fade-in-up border-primary/20 bg-primary/5">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Verifying email...
              </CardTitle>
              <CardDescription className="text-base">
                Please wait while we verify your email address
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Default: show email verification request form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">Autopilot Studio</span>
          </Link>
        </div>

        <Card className="animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Verify your email
            </CardTitle>
            <CardDescription className="text-base">
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                Please check your inbox and click the verification link to activate your account. 
                If you don't see the email, check your spam folder.
              </p>
            </div>

            <Form onSubmit={verificationForm.onSubmit}>
              <FormField>
                <FormItem>
                  <FormLabel htmlFor="email">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        {...verificationForm.form.register("email")}
                        disabled={verificationForm.isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage>
                    {verificationForm.form.formState.errors.email?.message}
                  </FormMessage>
                </FormItem>
              </FormField>

              <Button 
                type="submit" 
                className="w-full btn-primary group" 
                disabled={verificationForm.isLoading}
              >
                {verificationForm.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                    Resend verification email
                  </>
                )}
              </Button>
            </Form>

            <div className="mt-6 space-y-3">
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already verified? </span>
                <Link 
                  to="/login" 
                  className="text-primary hover:underline hover:text-primary/80 transition-colors duration-200 font-medium"
                >
                  Sign in
                </Link>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Need help? <Link to="/support" className="text-primary hover:underline">Contact support</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
