"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner"; // Import toast dari sonner

export default function Camera({ onCapture }: { onCapture: (blob: Blob) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function openCamera() {
      try {
        // Mencoba kamera belakang terlebih dahulu
        const cam = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        localStream = cam;
        if (videoRef.current) {
          videoRef.current.srcObject = cam;
        }
      } catch (err) {
        console.error("Primary camera error:", err);

        // Fallback ke kamera apa saja jika 'environment' gagal
        try {
          const fallbackCam = await navigator.mediaDevices.getUserMedia({ video: true });
          localStream = fallbackCam;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackCam;
          }
        } catch {
          // Tidak perlu menuliskan (fallbackErr) jika tidak dipakai
          toast.error("Kamera Tidak Ditemukan", {
            description: "Pastikan izin akses kamera sudah diberikan di pengaturan browser.",
          });
        }
      }
    }

    openCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      toast.warning("Kamera belum siap");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
          toast.success("Foto berhasil diambil!");
        }
      }, "image/jpeg");
    }
  };

  return (
    <div className="space-y-3">
      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border bg-black shadow-inner" />
      <button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2.5 rounded-xl font-semibold transition-all active:scale-95">
        Ambil Foto
      </button>
    </div>
  );
}
