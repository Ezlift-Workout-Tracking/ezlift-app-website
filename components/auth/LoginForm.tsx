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
import { Eye, EyeOff, Mail, Lock, Chrome, Apple } from "lucide-react";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "@/lib/auth/schemas";
import { signInWithEmail, signInWithGoogle, completeRedirectSignIn } from "@/lib/auth/firebaseClient";
import { signInWithApple, completeAppleRedirect, handleAccountExistsError, getUserEmail } from "@/lib/auth/signInWithApple";
import { getErrorMessages, isPopupBlockedError } from "@/lib/auth/errorMap";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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
        toast({ title: "Welcome!", description: "You have been successfully signed in." });
      } catch (_) {
        // ignore if not a redirect result
      }
    })();
    return () => { active = false; };
  }, [redirect, router, toast]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const { user, error } = await signInWithEmail(data.email, data.password);
      
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
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
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
          title: "Welcome!",
          description: "You have been successfully signed in with Apple.",
        });
      }
    } catch (error: any) {
      console.error("Apple sign in error:", error);
      
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
          description: "Please allow popups for this site to sign in with Apple.",
          variant: "destructive",
        });
      } else {
        const errorMessage = getErrorMessages(error);
        toast({
          title: "Sign in failed",
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
            title: "Sign in failed",
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
          description: "You have been successfully signed in with Google.",
        });
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({
        title: "Sign in failed",
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
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
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
                placeholder="Enter your password"
                className="pl-10 pr-10 h-12 text-base"
                autoComplete="current-password"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
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
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
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

          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading || !watch("email") || !watch("password")}>
            {isLoading ? "Signing in..." : "Sign in"}
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
            aria-label="Sign in with Apple"
          >
            <Apple className="mr-3 h-5 w-5 fill-current" />
            Continue with Apple
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold"
            aria-label="Sign in with Google"
          >
            <Chrome className="mr-3 h-5 w-5" />
            Continue with Google
          </Button>
        </div>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 