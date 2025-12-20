"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, FileText, LogOut, Menu, X } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("userData");
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        // Bungkus dengan setTimeout 0
        setTimeout(() => {
          setUser(parsedData);
        }, 0);
      } catch (e) {
        console.error("Gagal parse data user", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    router.replace("/auth/login");
  };

  if (!user) return null;

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white border-b"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-15">
          <div className="flex justify-between items-center h-16">
            {/* KELOMPOK 1: Logo (Sisi Kiri) */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">LA</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">LaporinAja</span>
              </Link>
            </div>

            {/* KELOMPOK 2: Menu & Profile (Sisi Kanan) */}
            <div className="flex items-center space-x-2 md:space-x-6">
              {/* Link Beranda (Hanya Desktop) */}
              <div className="hidden md:flex">
                <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50">
                  <Home size={18} />
                  <span>Beranda</span>
                </Link>
                <Link href="/laporan" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50">
                  <FileText size={18} />
                  <span>Buat Laporan</span>
                </Link>
              </div>

              {/* User Profile Dropdown (Hanya Desktop) */}
              <div className="hidden md:block relative group">
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="relative">
                    {user.avatar ? (
                      <Image src={user.avatar} alt="avatar" width={40} height={40} className="rounded-full border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">{user.name.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="font-semibold text-gray-800 leading-none">{user.name}</p>
                  </div>
                </button>

                {/* Menu Dropdown - Pastikan ada invisible & group-hover:visible */}
                <div className="absolute right-0 mt-0 pt-2 w-64 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-[60]">
                  <div className="bg-white rounded-xl shadow-xl border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/50">
                      <div className="flex items-center space-x-3">
                        {user.avatar ? (
                          <Image src={user.avatar} alt="avatar" width={40} height={40} className="rounded-full" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">{user.name.charAt(0).toUpperCase()}</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={logout} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                        <LogOut size={18} />
                        <span className="font-medium">Keluar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button (Hanya Mobile) */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-4 pt-4 pb-6 border-t bg-white">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-4">
              {user.avatar ? (
                <Image src={user.avatar} alt="avatar" width={48} height={48} className="rounded-full" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">{user.name.charAt(0).toUpperCase()}</div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* Mobile Links */}
            <div className="space-y-1">
              <Link href="/laporan" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50">
                <Home size={18} />
                <span>Buat Laporan</span>
              </Link>
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50">
                <Home size={18} />
                <span>Beranda</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600"
              >
                <LogOut size={18} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
