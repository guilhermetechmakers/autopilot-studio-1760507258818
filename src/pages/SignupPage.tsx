import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Mail, Lock, User, Building, Github, Loader2 } from "lucide-react";
import { useSignupForm, useOAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const { form, onSubmit, isLoading } = useSignupForm();
  const { handleOAuthLogin } = useOAuth();

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
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Get started with Autopilot Studio today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    {...form.register("full_name")}
                  />
                </div>
                {form.formState.errors.full_name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    {...form.register("password")}
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
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
                    placeholder="Confirm your password"
                    className="pl-10"
                    {...form.register("confirm_password")}
                  />
                </div>
                {form.formState.errors.confirm_password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Enter your company name"
                    className="pl-10"
                    {...form.register("company")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select {...form.register("role")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Agency Owner</SelectItem>
                    <SelectItem value="manager">Project Manager</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  required
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full hover:scale-105 transition-transform"
                  onClick={() => handleOAuthLogin("github")}
                  disabled={isLoading}
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:scale-105 transition-transform"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={isLoading}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Google
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Guest Intake CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want to try before signing up?
          </p>
          <Link to="/intake">
            <Button variant="outline" className="w-full">
              Book AI Intake (No Account Required)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
