import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Mail, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
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
      await authApi.verifyEmail(token);
      setVerificationStatus("success");
    } catch (error) {
      console.error("Email verification error:", error);
      setVerificationStatus("error");
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

          <Card className="animate-fade-in-up">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Email verified!</CardTitle>
              <CardDescription>
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
                  <Button className="w-full btn-primary">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
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

          <Card className="animate-fade-in-up">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl">Verification failed</CardTitle>
              <CardDescription>
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
                  className="w-full"
                  disabled={verificationForm.isLoading}
                >
                  {verificationForm.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend verification email
                    </>
                  )}
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
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

          <Card className="animate-fade-in-up">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verifying email...</CardTitle>
              <CardDescription>
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

        <Card className="animate-fade-in-up">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
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

            <form onSubmit={verificationForm.onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10"
                    {...verificationForm.form.register("email")}
                  />
                </div>
                {verificationForm.form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {verificationForm.form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary" 
                disabled={verificationForm.isLoading}
              >
                {verificationForm.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend verification email
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already verified? </span>
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
