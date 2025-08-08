"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Chrome, Check, X, Apple } from "lucide-react";
import Link from "next/link";
import { signupSchema, type SignupFormData } from "@/lib/auth/schemas";
import { signUpWithEmail, signInWithGoogle, completeRedirectSignIn } from "@/lib/auth/firebaseClient";
import { signInWithApple, completeAppleRedirect, handleAccountExistsError, getUserEmail } from "@/lib/auth/signInWithApple";
import { getErrorMessages, isPopupBlockedError } from "@/lib/auth/errorMap";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const redirect = searchParams.get("redirect") || "/app";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const passwordRequirements = [
    {
      label: "At least 6 characters",
      met: password && password.length >= 6,
    },
    {
      label: "One uppercase letter",
      met: password && /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      met: password && /[a-z]/.test(password),
    },
    {
      label: "One number",
      met: password && /\d/.test(password),
    },
  ];

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Complete redirect flow if we were redirected back
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Check for both Google and Apple redirects
        let user = await completeRedirectSignIn();
        if (!user) {
          user = await completeAppleRedirect();
        }
        if (!active || !user) return;
        const idToken = await user.getIdToken();
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        if (!response.ok) throw new Error("Failed to create session");
        router.push(redirect);
        toast({ title: "Welcome to EZLift!", description: "Your account has been created successfully." });
      } catch (_) {
        // ignore if not a redirect result
      }
    })();
    return () => { active = false; };
  }, [redirect, router, toast]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    
    try {
      const { user, error } = await signUpWithEmail(data.email, data.password);
      
      if (error) {
        const errorMessage = getErrorMessages(error);
        setError("root", { message: errorMessage });
        return;
      }

      if (user) {
        // Get the ID token
        const idToken = await user.getIdToken();
        
        // Create session with backend
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        // Redirect to the intended page
        router.push(redirect);
        
        toast({
          title: "Welcome to EZLift!",
          description: "Your account has been created successfully.",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setError("root", { 
        message: error.message || "An unexpected error occurred. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const result = await signInWithApple();
      
      // If result is null, redirect was initiated
      if (!result) {
        setIsLoading(false);
        return;
      }

      const { user } = result;
      if (user) {
        const idToken = await user.getIdToken();
        
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        router.push(redirect);
        
        toast({
          title: "Welcome to EZLift!",
          description: "Your account has been created successfully with Apple.",
        });
      }
    } catch (error: any) {
      console.error("Apple sign up error:", error);
      
      // Handle account exists with different credential
      if (error?.code === 'auth/account-exists-with-different-credential') {
        const email = error?.customData?.email || getUserEmail(error?.user);
        if (email) {
          const methods = await handleAccountExistsError(email);
          const providerName = methods.includes('google.com') ? 'Google' : 
                             methods.includes('password') ? 'email/password' : 'another provider';
          
          toast({
            title: "Account already exists",
            description: `An account with this email already exists. Please sign in with ${providerName} first, then you can link your Apple account in your profile settings.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account linking required",
            description: "This Apple ID is associated with an existing account. Please contact support for assistance.",
            variant: "destructive",
          });
        }
      } else if (isPopupBlockedError(error)) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site to sign up with Apple.",
          variant: "destructive",
        });
      } else {
        const errorMessage = getErrorMessages(error);
        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { user, error } = await signInWithGoogle();
      
      if (error) {
        if (isPopupBlockedError(error)) {
          toast({
            title: "Popup blocked",
            description: "Please allow popups for this site to sign in with Google.",
            variant: "destructive",
          });
        } else {
          const errorMessage = getErrorMessages(error);
          toast({
            title: "Sign up failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
        return;
      }

      if (user) {
        const idToken = await user.getIdToken();
        
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        router.push(redirect);
        
        toast({
          title: "Welcome!",
          description: "You have been successfully signed up with Google.",
        });
      }
    } catch (error: any) {
      console.error("Google sign up error:", error);
      toast({
        title: "Sign up failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
        <CardDescription className="text-center">
          Enter your details to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10 h-12 text-base"
                autoComplete="email"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="pl-10 pr-10 h-12 text-base"
                autoComplete="new-password"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error password-requirements" : "password-requirements"}
                {...register("password")}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Password requirements */}
            {passwordFocused && password && (
              <div id="password-requirements" className="space-y-1 text-sm" aria-live="polite">
                <p className="text-muted-foreground">Password requirements:</p>
                {passwordRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {requirement.met ? (
                      <Check className="h-3 w-3 text-green-500" aria-hidden="true" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" aria-hidden="true" />
                    )}
                    <span className={requirement.met ? "text-green-600" : "text-red-600"}>
                      {requirement.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="pl-10 pr-10 h-12 text-base"
                autoComplete="new-password"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby={errors.confirmPassword ? "confirm-password-error password-match" : "password-match"}
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Password match indicator */}
            {confirmPassword && (
              <div id="password-match" className="flex items-center gap-2 text-sm" aria-live="polite">
                {passwordsMatch ? (
                  <Check className="h-3 w-3 text-green-500" aria-hidden="true" />
                ) : (
                  <X className="h-3 w-3 text-red-500" aria-hidden="true" />
                )}
                <span className={passwordsMatch ? "text-green-600" : "text-red-600"}>
                  Passwords {passwordsMatch ? "match" : "don't match"}
                </span>
              </div>
            )}
            
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={watch("terms")}
                onCheckedChange={(checked) => setValue("terms", checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.terms && (
              <p className="text-sm text-destructive">
                {errors.terms.message}
              </p>
            )}
          </div>

          {errors.root && (
            <div
              role="alert"
              aria-live="polite"
              className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-md border border-destructive/20"
            >
              {errors.root.message}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold" 
            disabled={isLoading || !watch("email") || !watch("password") || !watch("confirmPassword") || !watch("terms") || !passwordsMatch}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

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

        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            onClick={handleAppleSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-black text-white hover:bg-gray-800 border-black text-base font-semibold"
            aria-label="Sign up with Apple"
          >
            <Apple className="mr-3 h-5 w-5 fill-current" />
            Continue with Apple
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold"
            aria-label="Sign up with Google"
          >
            <Chrome className="mr-3 h-5 w-5" />
            Continue with Google
          </Button>
        </div>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 