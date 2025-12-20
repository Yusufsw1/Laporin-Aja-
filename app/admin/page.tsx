"use client";

import { useEffect, useState } from "react";
import { mapLink } from "@/utils/getExifLocation";
import { exportReportsToExcel } from "@/lib/exportExcel";
import { useAdmin } from "../hooks/useAdmin";
import Navbar from "../component/admin/Navbar";
import Swal from "sweetalert2";
import { Search, Filter, MapPin, Calendar, Users, AlertTriangle, CheckCircle, Clock, Download, FileText, Image as ImageIcon, X, Shield, ExternalLink, ThumbsUp, Flag, Trash2 } from "lucide-react";

interface Report {
  id: string;
  category: string;
  latitude: number;
  longitude: number;
  photo_list: string[];
  label: string | null;
  cluster_total: number | null;
  deskripsi: string | null;
  created_at: string;
  status: string;
  support_count?: number;
  user?: {
    name: string;
    email?: string;
  };
}

export default function AdminPage() {
  useAdmin();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLabel, setFilterLabel] = useState<"all" | "Rendah" | "Sedang" | "Tinggi" | "Sangat Tinggi">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackPhoto, setFeedbackPhoto] = useState<File | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://backend-laporin.vercel.app/api/v1/reports/all");
      const json = await res.json();
      setReports(json.reports || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      if (status === "Selesai") {
        const report = reports.find((r) => r.id === id);
        setSelectedReport(report || null);
        setShowFeedbackModal(true);
        return;
      }

      // Tampilkan loading sebentar
      Swal.showLoading();

      const res = await fetch(`https://backend-laporin.vercel.app/api/v1/reports/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        Toast.fire({
          icon: "success",
          title: `Status diperbarui menjadi ${status}`,
        });
        fetchReports();
      } else {
        throw new Error();
      }
    } catch {
      Swal.fire("Gagal", "Tidak dapat memperbarui status laporan.", "error");
    } finally {
      Swal.close();
    }
  };

  const submitFeedback = async () => {
    if (!selectedReport || !feedbackPhoto) {
      return Swal.fire("Perhatian", "Foto bukti penyelesaian wajib diunggah!", "warning");
    }

    const rawUserData = localStorage.getItem("userData");
    if (!rawUserData) return Swal.fire("Sesi Berakhir", "Silakan login kembali.", "error");

    const adminUuid = JSON.parse(rawUserData).id;
    const formData = new FormData();
    formData.append("photo", feedbackPhoto);
    formData.append("message", feedbackMessage);
    formData.append("admin_id", adminUuid);

    // Tampilkan loading indicator
    Swal.fire({
      title: "Mengirim Feedback...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(`https://backend-laporin.vercel.app/api/v1/reports/${selectedReport.id}/feedback`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        Swal.fire({
          title: "Tugas Selesai!",
          text: "Laporan telah ditutup dan feedback berhasil dikirim ke masyarakat.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });

        setShowFeedbackModal(false);
        setFeedbackMessage("");
        setFeedbackPhoto(null);
        setSelectedReport(null);
        fetchReports();
      } else {
        throw new Error();
      }
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan saat mengirim feedback.", "error");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      searchTerm === "" || report.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) || report.category?.toLowerCase().includes(searchTerm.toLowerCase()) || report.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLabel = filterLabel === "all" || report.label === filterLabel;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;

    return matchesSearch && matchesLabel && matchesStatus;
  });

  const handleExport = () => {
    exportReportsToExcel(filteredReports);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Laporan Masuk":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "Survei Lapangan":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "Masuk List Tunggu":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "Dalam Proses":
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case "Selesai":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Laporan Masuk":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Survei Lapangan":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Masuk List Tunggu":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Dalam Proses":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Selesai":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (label: string | null) => {
    switch (label) {
      case "Rendah":
        return "bg-gray-100 text-gray-700";
      case "Sedang":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Tinggi":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Sangat Tinggi":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const getPriorityIcon = (label: string | null) => {
    switch (label) {
      case "Rendah":
        return <span className="text-xs">🟢</span>;
      case "Sedang":
        return <span className="text-xs">🟡</span>;
      case "Tinggi":
        return <span className="text-xs">🟠</span>;
      case "Sangat Tinggi":
        return <span className="text-xs">🔴</span>;
      default:
        return <span className="text-xs">⚪</span>;
    }
  };

  const handleDelete = async (reportId: string) => {
    // 1. Konfirmasi dengan tampilan yang lebih "Galak" (Danger Mode)
    const result = await Swal.fire({
      title: "Hapus Laporan?",
      text: "Data ini akan hilang permanen dan tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Warna merah untuk hapus
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus Sekarang!",
      cancelButtonText: "Batal",
      reverseButtons: true, // Agar tombol 'Batal' di kiri dan 'Hapus' di kanan
    });

    // Jika admin menekan tombol Batal, langsung berhenti
    if (!result.isConfirmed) return;

    // 2. Tampilkan Loading saat proses hapus berjalan
    Swal.fire({
      title: "Sedang Menghapus...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(`https://backend-laporin.vercel.app/api/v1/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        // 3. Notifikasi Sukses
        await Swal.fire({
          title: "Terhapus!",
          text: "Laporan telah berhasil dihapus dari sistem.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // Refresh data (Bisa ganti fetchReports() kalau tidak mau reload satu halaman)
        window.location.reload();
      } else {
        Swal.fire("Gagal", data.message || "Gagal menghapus laporan", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error", "Terjadi kesalahan koneksi ke server", "error");
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "Laporan Masuk").length,
    survei: reports.filter((r) => r.status === "Survei Lapangan").length,
    list: reports.filter((r) => r.status === "Masuk List Tunggu").length,
    inProgress: reports.filter((r) => r.status === "Dalam Proses").length,
    completed: reports.filter((r) => r.status === "Selesai").length,
    totalSupport: reports.reduce((sum, r) => sum + (r.support_count || 0), 0),
    urgent: reports.filter((r) => r.label === "Sangat Tinggi").length,
  };

  const openDetailModal = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Modal Detail Laporan */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 sm:pb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Detail Laporan</h2>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">ID: {selectedReport.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReport(null);
                  }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>

              {/* Gallery */}
              {selectedReport.photo_list.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-1.5 sm:space-x-2">
                    <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Foto Bukti</span>
                  </h3>
                  <div className={`grid gap-2 sm:gap-3 ${selectedReport.photo_list.length === 1 ? "grid-cols-1" : selectedReport.photo_list.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {selectedReport.photo_list.map((url, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={url}
                          alt={`Bukti ${index + 1}`}
                          className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => window.open(url, "_blank")}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/10 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column */}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Deskripsi</label>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 max-h-40 sm:max-h-48 overflow-y-auto">
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">{selectedReport.deskripsi || "Tidak ada deskripsi"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Kategori</label>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm sm:text-base border border-blue-200 rounded-lg font-medium truncate">{selectedReport.category}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Lokasi</label>
                    <a
                      href={mapLink(selectedReport.latitude, selectedReport.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-900 text-white text-sm sm:text-base rounded-lg hover:bg-black transition-colors w-full sm:w-auto"
                    >
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="truncate">Buka di Google Maps</span>
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        {getStatusIcon(selectedReport.status)}
                        <span className={`px-2 py-1 rounded text-xs sm:text-sm font-medium ${getStatusColor(selectedReport.status)} border truncate`}>{selectedReport.status}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Prioritas</label>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        {getPriorityIcon(selectedReport.label)}
                        <span className={`px-2 py-1 rounded text-xs sm:text-sm font-medium ${getPriorityColor(selectedReport.label)} border truncate`}>{selectedReport.label || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Statistik</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Dukungan</p>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">{selectedReport.support_count || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Cluster</p>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">{selectedReport.cluster_total || 1}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal</label>
                    <div className="flex items-start sm:items-center space-x-1.5 sm:space-x-2">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">
                        {new Date(selectedReport.created_at).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-6 border-t ">
                    <button
                      onClick={() => handleDelete(selectedReport.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium border border-transparent hover:border-red-100"
                      title="Hapus Laporan"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus Laporan Ini
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Tandai sebagai Selesai</h3>
                    <p className="text-sm text-gray-500">Tambahkan bukti penyelesaian</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedReport(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pesan untuk Pelapor</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={4}
                    placeholder="Berikan penjelasan penyelesaian laporan..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Foto Bukti</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                    {feedbackPhoto ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{feedbackPhoto.name}</span>
                        <button onClick={() => setFeedbackPhoto(null)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setFeedbackPhoto(e.target.files?.[0] || null)} />
                        <div className="space-y-2">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto">
                            <ImageIcon className="w-5 h-5 text-blue-500" />
                          </div>
                          <p className="text-sm text-gray-600">Klik untuk upload foto</p>
                          <p className="text-xs text-gray-400">PNG, JPG, atau GIF (max 5MB)</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedReport(null);
                  }}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={!feedbackPhoto}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8">
          <div className="w-full lg:w-auto">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Admin Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">Kelola dan pantau semua laporan masyarakat</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export Excel</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Laporan</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.total}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Laporan Masuk</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div className="bg-yellow-500 rounded-full h-1.5 sm:h-2" style={{ width: `${(stats.pending / stats.total) * 100}%` }}></div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round((stats.pending / stats.total) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Survei Lapangan</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.survei}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div className="bg-yellow-500 rounded-full h-1.5 sm:h-2" style={{ width: `${(stats.survei / stats.total) * 100}%` }}></div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round((stats.survei / stats.total) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Masuk List Tunggu</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.list}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div className="bg-yellow-500 rounded-full h-1.5 sm:h-2" style={{ width: `${(stats.list / stats.total) * 100}%` }}></div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round((stats.list / stats.total) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Dalam Proses</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.inProgress}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div className="bg-blue-500 rounded-full h-1.5 sm:h-2" style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}></div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round((stats.inProgress / stats.total) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Selesai</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div className="bg-green-500 rounded-full h-1.5 sm:h-2" style={{ width: `${(stats.completed / stats.total) * 100}%` }}></div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round((stats.completed / stats.total) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "Laporan Masuk", "Survei Lapangan", "Masuk List Tunggu", "Dalam Proses", "Selesai"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status === "all" ? "all" : status)}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      filterStatus === (status === "all" ? "all" : status) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all" ? "Semua Status" : status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Prioritas:</span>
                <select
                  value={filterLabel}
                  onChange={(e) => setFilterLabel(e.target.value as any)}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-auto"
                >
                  <option value="all">Semua Prioritas</option>
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sangat Tinggi">Sangat Tinggi</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-700 flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Daftar Laporan</h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded whitespace-nowrap">{filteredReports.length} laporan</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] sm:min-w-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Laporan</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategori</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Prioritas</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Dukungan</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Cluster</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Peta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openDetailModal(report)}>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        {report.photo_list?.[0] && <img src={report.photo_list[0]} alt="Thumbnail" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 sm:line-clamp-1">{report.deskripsi || "Tidak ada deskripsi"}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mt-1 space-y-1 sm:space-y-0">
                            <span className="text-xs text-gray-500 flex items-center space-x-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span>
                                {new Date(report.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </span>
                            <span className="text-xs text-gray-500 font-mono hidden sm:inline">ID: {report.id.slice(0, 8)}...</span>
                            <span className="text-xs text-gray-500 font-mono sm:hidden">ID: {report.id.slice(0, 6)}...</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 sm:p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[120px]">{report.category}</span>
                    </td>

                    <td className="p-3 sm:p-4">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        {getPriorityIcon(report.label)}
                        <span className={`px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getPriorityColor(report.label)} border truncate max-w-[100px] sm:max-w-none`}>{report.label || "N/A"}</span>
                      </div>
                    </td>

                    <td className="p-3 sm:p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        {getStatusIcon(report.status)}
                        <select
                          value={report.status}
                          onChange={(e) => updateStatus(report.id, e.target.value)}
                          className={`text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border ${getStatusColor(report.status)} focus:ring-2 focus:ring-blue-500 outline-none w-full`}
                        >
                          <option value="Laporan Masuk">Laporan Masuk</option>
                          <option value="Survei Lapangan">Survei Lapangan</option>
                          <option value="Masuk List Tunggu">Masuk List Tunggu</option>
                          <option value="Dalam Proses">Dalam Proses</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </div>
                    </td>

                    <td className="p-3 sm:p-4">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                        <span className="font-bold text-gray-900 text-sm sm:text-base">{report.support_count || 0}</span>
                      </div>
                    </td>

                    <td className="p-3 sm:p-4">
                      <div className="text-center">
                        {report.cluster_total && report.cluster_total > 1 ? (
                          <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">{report.cluster_total} Cluster</span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 sm:p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <a
                          href={mapLink(report.latitude, report.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex items-center justify-center"
                          title="Lihat Lokasi"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Tidak ada laporan ditemukan</h3>
              <p className="text-gray-500 max-w-md mx-auto px-4 text-sm sm:text-base">{searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : "Semua laporan telah diproses"}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredReports.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-4 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-500">
              Menampilkan <span className="font-medium">1-{Math.min(10, filteredReports.length)}</span> dari <span className="font-medium">{filteredReports.length}</span> laporan
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button className="px-2 py-1.5 sm:px-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">Sebelumnya</button>
              <button className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700">1</button>
              <button className="px-2 py-1.5 sm:px-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50">2</button>
              <button className="px-2 py-1.5 sm:px-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50">3</button>
              <button className="px-2 py-1.5 sm:px-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 whitespace-nowrap">Selanjutnya</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
