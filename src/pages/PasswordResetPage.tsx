import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Mail, Lock, Loader2, CheckCircle } from "lucide-react";
import { usePasswordResetForm, usePasswordResetConfirmForm } from "@/hooks/useAuth";

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [emailSent, setEmailSent] = useState(false);

  // Form for requesting password reset
  const requestForm = usePasswordResetForm();
  
  // Form for confirming password reset (when token is present)
  const confirmForm = usePasswordResetConfirmForm(token || "");

  // Handle successful email send
  const handleEmailSent = () => {
    setEmailSent(true);
  };

  // If email was sent, show success message
  if (emailSent) {
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
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                We've sent a password reset link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Please check your inbox and click the link to reset your password. 
                The link will expire in 1 hour.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setEmailSent(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  Send another email
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

  // If token is present, show password reset form
  if (token) {
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
              <CardTitle className="text-2xl">Reset your password</CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={confirmForm.onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your new password"
                      className="pl-10"
                      {...confirmForm.form.register("password")}
                    />
                  </div>
                  {confirmForm.form.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {confirmForm.form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm_password"
                      type="password"
                      placeholder="Confirm your new password"
                      className="pl-10"
                      {...confirmForm.form.register("confirm_password")}
                    />
                  </div>
                  {confirmForm.form.formState.errors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {confirmForm.form.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full btn-primary" disabled={confirmForm.isLoading}>
                  {confirmForm.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default: show email request form
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
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={requestForm.onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10"
                    {...requestForm.form.register("email")}
                  />
                </div>
                {requestForm.form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {requestForm.form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary" 
                disabled={requestForm.isLoading}
                onClick={handleEmailSent}
              >
                {requestForm.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Remember your password? </span>
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
