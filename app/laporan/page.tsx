"use client";

import { useState, useRef } from "react";
import Camera from "@/app/component/dashboard/Camera";
import { readEXIF } from "@/utils/EXIF";
import Navbar from "../component/dashboard/Navbar";
import { useAuth } from "../hooks/useAuth";
import { Camera as CameraIcon, Upload, X, MapPin, Send, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Image from "next/image";

interface GPSLocation {
  lat: number;
  lon: number;
}

export default function HomePage() {
  useAuth();
  const [showCamera, setShowCamera] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [gps, setGPS] = useState<GPSLocation | null>(null);
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLocation = (): Promise<GPSLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation tidak didukung"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const handleCameraCapture = async (blob: Blob) => {
    // Jika sudah ada GPS, kita tidak perlu ambil lokasi lagi, cukup simpan fotonya
    if (gps) {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      setImages((prev) => [...prev, file]);
      setPreviews((prev) => [...prev, URL.createObjectURL(file)]);
      setShowCamera(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const loc = await getLocation();
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });

      setGPS(loc);
      setImages((prev) => [...prev, file]);
      setPreviews((prev) => [...prev, URL.createObjectURL(file)]);
      setShowCamera(false);
      toast.success("Lokasi berhasil dikunci!");
    } catch (error) {
      console.log(error);

      Swal.fire("Gagal Mengambil Lokasi", "Pastikan GPS aktif.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    const newImages = [...images, ...selectedFiles];

    if (newImages.length > 4) {
      Swal.fire("Maksimal 4 foto", "", "warning");
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
      return;
    }

    // JIKA GPS SUDAH ADA (dari kamera atau upload sebelumnya),
    // langsung simpan foto tanpa cek EXIF lagi.
    if (gps) {
      setImages(newImages);
      setPreviews((prev) => [...prev, ...newPreviews]);
      return;
    }

    // JIKA GPS KOSONG, baru ambil dari file pertama yang diupload
    try {
      const exif = await readEXIF(selectedFiles[0]);

      if (exif && Math.abs(exif.lat) <= 90) {
        const correctedLat = exif.lat > 0 && exif.lat < 10 ? -exif.lat : exif.lat;
        setGPS({ lat: correctedLat, lon: exif.lon });

        setImages(newImages);
        setPreviews((prev) => [...prev, ...newPreviews]);
        toast.success("Lokasi terdeteksi dari foto pertama!");
      } else {
        Swal.fire({
          title: "Foto Tidak Memiliki Lokasi",
          text: "Foto pertama harus memiliki data lokasi. Silakan ambil foto langsung atau gunakan foto yang memiliki GPS.",
          icon: "error",
        });
        newPreviews.forEach((url) => URL.revokeObjectURL(url));
      }
    } catch (error) {
      console.error("Location error:", error);
      Swal.fire("Error", "Gagal membaca data foto.", "error");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (images.length === 0) return Swal.fire("Oops!", "Foto wajib diunggah", "warning");
    if (!desc.trim()) return Swal.fire("Oops!", "Deskripsi wajib diisi", "warning");
    if (!category) return Swal.fire("Kategori wajib dipilih");

    const rawUserData = localStorage.getItem("userData");
    if (!rawUserData) {
      Swal.fire("Sesi habis, silakan login kembali");
      return;
    }

    const user = JSON.parse(rawUserData);
    const userId = user.id;

    setIsSubmitting(true);

    const formData = new FormData();
    images.forEach((file) => {
      formData.append("images", file);
    });
    formData.append("description", desc);
    formData.append("category", category);
    if (gps) {
      formData.append("latitude", String(gps.lat));
      formData.append("longitude", String(gps.lon));
    }
    formData.append("user_id", userId);

    try {
      const res = await fetch("https://backend-laporin.vercel.app/api/v1/reports/create", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: "Laporan kamu telah kami terima dan akan segera diproses.",
          icon: "success",
          confirmButtonColor: "#10b981", // Warna hijau emerald
        });
        // Reset form
        setImages([]);
        setPreviews([]);
        setGPS(null);
        setDesc("");
        setCategory("");
      } else {
        Swal.fire("Gagal mengirim laporan");
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Gagal terhubung ke server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Camera Modal - Small */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="relative bg-black rounded-xl overflow-hidden">
              <button onClick={() => setShowCamera(false)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
                <X className="w-5 h-5" />
              </button>
              <Camera onCapture={handleCameraCapture} />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Buat Laporan Baru</h1>
          <p className="text-gray-600 mt-1">Sampaikan masalah di lingkungan Anda</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          {/* Upload Photos */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Foto Bukti</h2>
              <span className="text-sm text-gray-500">{images.length}/4</span>
            </div>

            {/* Photo Grid */}
            {previews.length > 0 ? (
              <div className="mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {previews.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      {/* Mengganti <img> dengan <Image /> */}
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill // Menggunakan fill karena parent-nya sudah punya class 'aspect-square'
                        className="object-cover rounded-lg border border-gray-200"
                        unoptimized // WAJIB untuk URL Blob/Preview agar tidak error
                      />

                      <button
                        type="button" // Biasakan tambah type="button" agar tidak trigger submit form
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Belum ada foto</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={() => setShowCamera(true)} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                <CameraIcon className="w-5 h-5" />
                <span>Ambil Foto</span>
              </button>

              <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-white border border-blue-600 text-blue-600 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                <Upload className="w-5 h-5" />
                <span>Unggah</span>
              </button>

              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleUploadFile} />
            </div>
          </div>

          {/* Location Info */}
          {gps && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Lokasi terdeteksi: {gps.lat.toFixed(4)}, {gps.lon.toFixed(4)}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Laporan</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Jelaskan masalah secara detail..."
              className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white">
              <option value="">Pilih kategori</option>
              <option value="sampah">🗑️ Sampah</option>
              <option value="jalan_rusak">🚧 Jalan Rusak</option>
              <option value="banjir">🌊 Banjir</option>
              <option value="lainnya">❓ Lainnya</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !images.length || !desc.trim() || !category}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Kirim Laporan</span>
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> Pastikan foto jelas dan deskripsi lengkap agar laporan dapat ditangani dengan cepat.
          </p>
        </div>
      </div>
    </div>
  );
}
