"use client";

import { mapLink } from "@/utils/getExifLocation";
import { useEffect, useState, useMemo } from "react";
import Navbar from "../component/dashboard/Navbar";
import { useAuth } from "../hooks/useAuth";
import { MapPin, Calendar, ChevronUp, AlertCircle, CheckCircle, Clock, Image as ImageIcon, Globe, Star, PlusCircle, Camera, Tag, ArrowBigUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Report {
  id: string;
  category: string;
  latitude: number;
  longitude: number;
  photo_list: string[];
  label: string | null;
  cluster_total: number | null;
  deskripsi: string | null;
  status: string | null;
  created_at: string;
  support_count: number;
  view_count?: number;
  user_has_supported?: boolean;
  feedback?: {
    message: string;
    photo_url: string;
    created_at: string;
  } | null;
  user?: {
    name: string;
  };
}

export default function FeedPage() {
  useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "supported">("recent");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const rawUserData = localStorage.getItem("userData");
      const user = rawUserData ? JSON.parse(rawUserData) : null;
      const queryParam = user?.id ? `?user_id=${user.id}` : "";
      const res = await fetch(`https://backend-laporin.vercel.app/api/v1/reports/all${queryParam}`);

      const json = await res.json();
      setReports(json.reports || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSupport = async (reportId: string) => {
    const rawUserData = localStorage.getItem("userData");
    if (!rawUserData) return alert("Anda harus login terlebih dahulu!");

    const user = JSON.parse(rawUserData);
    setProcessingId(reportId);

    try {
      const res = await fetch(`https://backend-laporin.vercel.app/api/v1/reports/${reportId}/support`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? {
                  ...r,
                  user_has_supported: !r.user_has_supported,
                  support_count: data.current_count,
                }
              : r
          )
        );
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.log(error);

      alert("Koneksi gagal");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAndSortedReports = useMemo(() => {
    const filtered = reports.filter((report) => {
      const matchesSearch =
        searchTerm === "" || report.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) || report.category?.toLowerCase().includes(searchTerm.toLowerCase()) || report.label?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sorting
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "popular":
        filtered.sort((a, b) => (b.support_count || 0) - (a.support_count || 0));
        break;
      case "supported":
        filtered.sort((a, b) => (b.user_has_supported ? 1 : 0) - (a.user_has_supported ? 1 : 0));
        break;
    }

    return filtered;
  }, [reports, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusIcon = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "selesai":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "diproses":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="block md:hidden mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              {/* Fake Input yang nge-link ke halaman /laporan */}
              <Link href="/laporan" className="flex-1 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full py-2.5 px-5 text-gray-500 text-sm flex items-center justify-between">
                <span>Ada laporan apa hari ini?</span>
                <PlusCircle className="w-5 h-5 text-blue-600" />
              </Link>
            </div>

            {/* Action Buttons di bawah input */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <Link href="/laporan" className="flex items-center space-x-2 text-gray-600 text-xs font-medium px-2">
                <Camera className="w-4 h-4 text-pink-500" />
                <span>Foto</span>
              </Link>
              <Link href="/laporan" className="flex items-center space-x-2 text-gray-600 text-xs font-medium px-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span>Lokasi</span>
              </Link>
              <Link href="/laporan" className="flex items-center space-x-2 text-gray-600 text-xs font-medium px-2">
                <Tag className="w-4 h-4 text-yellow-500" />
                <span>Kategori</span>
              </Link>
            </div>
          </div>
        </div>
        {/* Feed Content */}
        <div className="space-y-6">
          {filteredAndSortedReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada laporan ditemukan</h3>
              <p className="text-gray-500 mb-6">{searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : "Belum ada laporan yang dibuat"}</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tampilkan Semua Laporan
              </button>
            </div>
          ) : (
            filteredAndSortedReports.map((report) => {
              const isSupported = report.user_has_supported;

              return (
                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{report.user?.name?.charAt(0).toUpperCase() || "U"}</div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(report.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 rounded-full">
                          {getStatusIcon(report.status)}
                          <span className="text-sm font-medium text-gray-700">{report.status || "Menunggu"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Category and Label */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{report.category}</span>
                      </span>
                      {report.label && (
                        <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{report.label}</span>
                        </span>
                      )}
                      {report.cluster_total && report.cluster_total > 1 && <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">{report.cluster_total} Laporan Serupa</span>}
                    </div>

                    {/* Description */}
                    <p className="text-gray-800 text-lg leading-relaxed mb-4">{report.deskripsi}</p>
                  </div>

                  {/* Photo Gallery */}
                  {report.photo_list.length > 0 && (
                    <div className="px-6 py-4">
                      <div className={`grid gap-3 ${report.photo_list.length === 1 ? "grid-cols-1" : report.photo_list.length === 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3"}`}>
                        {report.photo_list.map((url, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden cursor-pointer">
                            <div className="relative w-full h-64 overflow-hidden rounded-lg">
                              <Image
                                src={url}
                                alt={`Bukti ${idx + 1}`}
                                fill // Mengisi container div-nya
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                onClick={() => window.open(url, "_blank")}
                              />
                            </div>
                            <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/10 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ImageIcon className="w-8 h-8 text-white/80" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="px-6 py-4 border-t border-gray-100">
                    <a
                      href={mapLink(report.latitude, report.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors"
                    >
                      <MapPin className="w-5 h-5" />
                      <span>Lihat Lokasi di Peta</span>
                      <ChevronUp className="w-4 h-4 rotate-90" />
                    </a>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleToggleSupport(report.id)}
                          disabled={processingId === report.id}
                          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
                            isSupported ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          <ArrowBigUp className={`w-5 h-5 ${isSupported ? "text-white" : "text-gray-500"}`} />
                          <span className="font-medium">{isSupported ? "Dukung Naik" : "Dukung Naik"}</span>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isSupported ? "bg-purple-700" : "bg-gray-200"}`}>{report.support_count || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  {report.status === "Selesai" && report.feedback && (
                    <div className="border-t border-gray-200">
                      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-green-800">Sudah Ditangani ✓</h4>
                            <p className="text-sm text-green-600">
                              {new Date(report.feedback.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6">
                          {report.feedback.photo_url && (
                            <div className="lg:w-1/4">
                              {/* Container harus relative untuk Image dengan layout 'fill' atau 'responsive' */}
                              <div className="relative w-full h-48 rounded-xl border-4 border-white shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                                <Image
                                  src={report.feedback.photo_url}
                                  alt="Bukti Selesai"
                                  fill // Membuat gambar memenuhi container div
                                  className="object-cover"
                                  onClick={() => window.open(report.feedback?.photo_url, "_blank")}
                                  unoptimized // Tambahkan ini jika kamu tidak ingin ribet setting domain di next.config.js
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-green-200">
                              <p className="text-green-900 font-medium mb-2">Tanggapan Petugas:</p>
                              <p className="text-gray-800 text-lg italic leading-relaxed">{report.feedback.message || "Laporan telah diselesaikan sesuai prosedur."}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Load More Button */}
        {filteredAndSortedReports.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Muat Lebih Banyak Laporan</button>
          </div>
        )}
      </div>
    </div>
  );
}
