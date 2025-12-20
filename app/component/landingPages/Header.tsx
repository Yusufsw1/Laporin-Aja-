// app/components/landing/Navbar.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LA</span>
            </div>
            <span className="text-xl font-bold text-gray-900">LaporinAja</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-8">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/auth/login">Masuk</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
