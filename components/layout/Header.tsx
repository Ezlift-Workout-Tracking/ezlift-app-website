"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Menu, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Header({ hideMenu = false }: { hideMenu?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
  ];

  const getBackHref = () => {
    console.log("hello")
    if (pathname?.startsWith("/blog/")) {
      return "/blog"; 
    }
    return "/";
  };

  const getBackLabel = () => {
    if (pathname?.startsWith("/blog/")) {
      return "Back to Blog";
    }
    return "Back";
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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