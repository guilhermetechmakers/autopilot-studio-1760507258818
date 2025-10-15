import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InputOTP } from "@/components/ui/input-otp";
import { Zap, Mail, Lock, Loader2, CheckCircle, Shield, Eye, EyeOff } from "lucide-react";
import { usePasswordResetForm, usePasswordResetConfirmForm, useOTPVerificationForm, usePasswordResetWithOTPForm } from "@/hooks/useAuth";

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [emailSent, setEmailSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Form for requesting password reset
  const requestForm = usePasswordResetForm();
  
  // Form for confirming password reset (when token is present)
  const confirmForm = usePasswordResetConfirmForm(token || "");
  
  // Form for OTP verification
  const otpForm = useOTPVerificationForm();
  
  // Form for password reset with OTP
  const otpResetForm = usePasswordResetWithOTPForm();

  // Handle successful email send
  const handleEmailSent = () => {
    setEmailSent(true);
  };

  // Handle OTP verification
  const handleOtpVerification = () => {
    if (otp.length === 6) {
      // Set the email in the OTP form from the request form
      const email = requestForm.form.getValues("email");
      otpForm.form.setValue("email", email);
      otpResetForm.form.setValue("email", email);
      setOtpSent(true);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  // Handle password change
  const handlePasswordChange = (password: string) => {
    setPasswordStrength(calculatePasswordStrength(password));
  };

  // If email was sent, show OTP verification or success message
  if (emailSent && !otpSent) {
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
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Verify your identity</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={otpForm.onSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="otp" className="text-center block">
                    Verification Code
                  </Label>
                  <InputOTP
                    value={otp}
                    onChange={(value) => {
                      setOtp(value);
                      otpForm.form.setValue("otp", value);
                      otpResetForm.form.setValue("otp", value);
                      if (value.length === 6) {
                        handleOtpVerification();
                      }
                    }}
                    maxLength={6}
                    pattern={/^[0-9]$/}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Didn't receive the code? Check your spam folder or{" "}
                    <button
                      type="button"
                      onClick={() => setEmailSent(false)}
                      className="text-primary hover:underline"
                    >
                      resend
                    </button>
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    type="submit"
                    className="w-full"
                    disabled={otp.length !== 6 || otpForm.isLoading}
                  >
                    {otpForm.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setEmailSent(false)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Back to email
                  </Button>
                  <Link to="/login">
                    <Button variant="ghost" className="w-full">
                      Back to login
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If OTP is verified, show password reset form
  if (emailSent && otpSent) {
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

          <Card className="animate-fade-in-up shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Reset your password</CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={otpResetForm.onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      className="pl-10 pr-10 h-12"
                      {...otpResetForm.form.register("password", {
                        onChange: (e) => handlePasswordChange(e.target.value)
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {otpResetForm.form.watch("password") && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Password strength</span>
                        <span className={`font-medium ${
                          passwordStrength < 25 ? 'text-red-500' :
                          passwordStrength < 50 ? 'text-orange-500' :
                          passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {passwordStrength < 25 ? 'Weak' :
                           passwordStrength < 50 ? 'Fair' :
                           passwordStrength < 75 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                      <Progress 
                        value={passwordStrength} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {otpResetForm.form.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {otpResetForm.form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      className="pl-10 pr-10 h-12"
                      {...otpResetForm.form.register("confirm_password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {otpResetForm.form.formState.errors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {otpResetForm.form.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold" 
                  disabled={otpResetForm.isLoading || passwordStrength < 25}
                >
                  {otpResetForm.isLoading ? (
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
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Back to login
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
              <form onSubmit={confirmForm.onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      className="pl-10 pr-10"
                      {...confirmForm.form.register("password", {
                        onChange: (e) => handlePasswordChange(e.target.value)
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {confirmForm.form.watch("password") && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Password strength</span>
                        <span className={`font-medium ${
                          passwordStrength < 25 ? 'text-red-500' :
                          passwordStrength < 50 ? 'text-orange-500' :
                          passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {passwordStrength < 25 ? 'Weak' :
                           passwordStrength < 50 ? 'Fair' :
                           passwordStrength < 75 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                      <Progress 
                        value={passwordStrength} 
                        className="h-2"
                      />
                    </div>
                  )}

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
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      className="pl-10 pr-10"
                      {...confirmForm.form.register("confirm_password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmForm.form.formState.errors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {confirmForm.form.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-primary" 
                  disabled={confirmForm.isLoading || passwordStrength < 25}
                >
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

        <Card className="animate-fade-in-up shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={requestForm.onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10 h-12"
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
                className="w-full h-12 text-base font-semibold" 
                disabled={requestForm.isLoading}
                onClick={handleEmailSent}
              >
                {requestForm.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending verification code...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Remember your password? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
