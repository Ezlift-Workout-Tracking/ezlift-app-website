"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Menu, ArrowLeft, User } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function Header({ hideMenu = false, className = "" }: { hideMenu?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const pathname = usePathname();

  // Check authentication status on mount and on route changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }
        const data = await response.json().catch(() => ({ authenticated: false }));
        setIsAuthenticated(!!data?.authenticated);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [pathname]);

  const menuItems = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "/exercise-library", label: "Exercise Library" },
    { href: "/blog", label: "Blog" },
  ];

  const getBackHref = () => {
    if (pathname?.startsWith("/blog/")) {
      return "/blog"; 
    }
    if (pathname?.startsWith("/exercise-library/")) {
      return "/exercise-library";
    }
    return "/";
  };

  const getBackLabel = () => {
    if (pathname?.startsWith("/blog/")) {
      return "Back to Blog";
    }
    if (pathname?.startsWith("/exercise-library/")) {
      return "Back to Exercise Library";
    }
    return "Back";
  };

  return (
    <header className={clsx("fixed top-0 w-full z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        {!hideMenu && (
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Button key={item.href} variant="ghost" asChild>
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/app">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <LogoutButton variant="outline" size="sm" onSuccess={() => setIsAuthenticated(false)} />
              </div>
            ) : (
              <Button variant="default" asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        )}

        {/* Mobile Navigation */}
        {!hideMenu && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="justify-start"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
                <div className="pt-4 border-t">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setOpen(false)}>
                        <Link href="/app">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </Button>
                      <LogoutButton variant="outline" className="w-full" onSuccess={() => { setOpen(false); setIsAuthenticated(false); }} />
                    </div>
                  ) : (
                    <Button variant="default" className="w-full" asChild onClick={() => setOpen(false)}>
                      <Link href="/login">Login</Link>
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        )}

        {/* Back Button */}
        {hideMenu && (
          <Button variant="ghost" asChild>
            <Link href={getBackHref()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {getBackLabel()}
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}