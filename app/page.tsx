// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Header from "@/app/component/landingPages/Header";
import { Shield, Upload, MapPin, CheckCircle, Smartphone, Globe } from "lucide-react";

export default function LandingPage() {
  const [stats, setStats] = useState({
    reports: 1250,
    users: 850,
    resolved: 920,
    cities: 12,
  });

  useEffect(() => {
    // Simulasi increment stats
    const interval = setInterval(() => {
      setStats((prev) => ({
        reports: prev.reports + Math.floor(Math.random() * 5),
        users: prev.users + Math.floor(Math.random() * 3),
        resolved: prev.resolved + Math.floor(Math.random() * 4),
        cities: prev.cities,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Unggah Cepat",
      description: "Laporkan masalah hanya dalam 3 langkah mudah dengan foto dan lokasi otomatis",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Lokasi Real-time",
      description: "Deteksi lokasi otomatis untuk akurasi penanganan yang lebih baik",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Proteksi Data",
      description: "Data Anda aman dengan enkripsi tingkat tinggi dan privasi terjamin",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Laporkan",
      description: "Ambil foto masalah dan deskripsikan dengan jelas",
      icon: <Smartphone className="w-6 h-6" />,
    },
    {
      step: 2,
      title: "Pantau",
      description: "Lacak perkembangan laporan Anda secara real-time",
      icon: <Globe className="w-6 h-6" />,
    },
    {
      step: 3,
      title: "Selesai",
      description: "Dapatkan notifikasi ketika laporan telah ditangani",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-5"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Laporkan Masalah,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Dapatkan Solusi</span>
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl">Sampaikan keluhan dan masalah di lingkungan Anda dengan mudah. Bersama kita wujudkan lingkungan yang lebih baik.</p>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="p-8">
                  {/* Mockup Dashboard */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="flex-1 text-center text-sm font-medium">LaporinAja Dashboard</div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">Total Laporan</div>
                          <div className="text-2xl font-bold text-blue-600">{stats.reports.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">Terselesaikan</div>
                          <div className="text-2xl font-bold text-green-600">{stats.resolved.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">Pengguna Aktif</div>
                          <div className="text-2xl font-bold text-purple-600">{stats.users.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stats.reports.toLocaleString()}+</div>
              <div className="text-gray-600">Laporan Masuk</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{stats.resolved.toLocaleString()}+</div>
              <div className="text-gray-600">Laporan Selesai</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">{stats.users.toLocaleString()}+</div>
              <div className="text-gray-600">Pengguna Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">{stats.cities}+</div>
              <div className="text-gray-600">Kota Terjangkau</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kenapa Memilih LaporinAja?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Platform pelaporan yang dirancang untuk kemudahan dan efektivitas</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6`}>{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cara Kerjanya Mudah</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Hanya dalam 3 langkah sederhana, masalah Anda akan ditangani</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                {index < howItWorks.length - 1 && <div className="hidden md:block absolute top-12 right-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transform translate-x-1/2"></div>}
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold">{step.step}</div>
                  </div>
                  <div className="pt-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">{step.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
