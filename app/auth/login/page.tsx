// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, AlertCircle } from "lucide-react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

interface GoogleCredentialResponse {
  credential?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user"; // sesuaikan dengan role yang kamu punya
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-laporin.vercel.app/api/v1/auth/google-verify";

  const handleGoogleSuccess = async (credentialResponse: GoogleCredentialResponse) => {
    setLoading(true);
    setError(null);

    const idToken = credentialResponse.credential;

    if (!idToken) {
      setError("Token Google tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      // Kita beri tahu axios bahwa response datanya mengandung token (string) dan user (UserData)
      const response = await axios.post<{ token: string; user: UserData }>(API_URL, {
        token: idToken,
      });

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(user));

        if (user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: unknown) {
      let errorMessage = "Gagal melakukan login. Silakan coba lagi.";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Gagal login dengan Google. Silakan coba lagi.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Header Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">LaporinAja</h1>
        <p className="text-gray-600 mt-2">Platform Pelaporan Masyarakat</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-xl border border-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-2 pb-4 pt-8">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">Masuk ke Akun Anda</CardTitle>
          <CardDescription className="text-center text-gray-600">Gunakan akun Google untuk melanjutkan</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-8 px-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-50 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Login Section */}
          <div className="space-y-6">
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center">
              <div className="w-full">
                {loading ? (
                  <Button disabled className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </Button>
                ) : (
                  <div className="flex justify-center">
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} theme="filled_blue" size="large" shape="rectangular" text="signin_with" locale="id" width="100%" />
                  </div>
                )}
              </div>
            </div>

            {/* Info Text */}
            <div className="pt-4">
              <p className="text-xs text-center text-gray-500 leading-relaxed">
                Dengan melanjutkan, Anda menyetujui{" "}
                <a href="/terms" className="text-blue-600 hover:underline font-medium">
                  Syarat Layanan
                </a>{" "}
                dan{" "}
                <a href="/privacy" className="text-blue-600 hover:underline font-medium">
                  Kebijakan Privasi
                </a>{" "}
                kami
              </p>
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Butuh bantuan?</p>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => window.open("mailto:support@laporinaja.com")}>
                Hubungi Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} LaporinAja. All rights reserved.</p>
      </div>
    </div>
  );
}
