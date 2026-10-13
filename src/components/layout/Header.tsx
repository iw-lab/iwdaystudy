"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "소개" },
  { href: "#contact", label: "문의" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size={36} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button size="sm" asChild>
              <Link href="/">바로 시작하기</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="메뉴 열기"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>
              <Logo size={28} />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 mt-6 px-4">
            {navLinks.map((link) => (
              <SheetClose key={link.href} asChild>
                <a
                  href={link.href}
                  className="flex items-center rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-accent transition-colors"
                >
                  {link.label}
                </a>
              </SheetClose>
            ))}
            <div className="my-4 border-t" />
            <SheetClose asChild>
              <Button className="w-full mt-2" asChild>
                <Link href="/">바로 시작하기</Link>
              </Button>
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>
    </motion.header>
  );
}
