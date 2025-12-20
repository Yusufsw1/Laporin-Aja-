import ExifReader from "exifreader";

interface GPSResult {
  lat: number;
  lon: number;
}

export async function readEXIF(file: File): Promise<GPSResult | null> {
  const buffer = await file.arrayBuffer();
  const tags = ExifReader.load(buffer);

  // Pastikan tags GPS Latitude dan Longitude benar-benar ada dan memiliki 'description'
  if (!tags.GPSLatitude || typeof tags.GPSLatitude.description !== "number" || !tags.GPSLongitude || typeof tags.GPSLongitude.description !== "number") {
    // Jika salah satu tag tidak ada atau bukan angka, kembalikan null
    return null;
  }

  const lat = tags.GPSLatitude.description;
  const lon = tags.GPSLongitude.description;

  // TAMBAHKAN LOG INI UNTUK DEBUGGING:
  console.log(`[readEXIF]: Latitude Mentah: ${lat}, Longitude Mentah: ${lon}`);

  // Jika log menunjukkan lat dan lon SAMA, berarti EXIF FOTO ANDA RUSAK.
  if (lat === lon) {
    console.warn("Peringatan: GPS Latitude dan Longitude memiliki nilai yang sama. Data EXIF mungkin rusak.");
    // Anda bisa memilih untuk mengembalikan null, atau tetap mengembalikan nilai (berisiko).
    // Untuk tujuan debugging, biarkan dulu, dan kita akan memperbaikinya di handleUploadFile.
  }

  return { lat, lon };
}

// Anda TIDAK PERLU lagi fungsi dmsToDecimal jika menggunakan cara ini!
// Hapus atau abaikan dmsToDecimal.

export function dmsToDecimal(dms: number[], ref: string): number {
  const [deg, min, sec] = dms;
  let dec = deg + min / 60 + sec / 3600; // Hitungan Nilai Absolut (Positif)

  // SOUTH & WEST = NEGATIVE
  if (ref === "S" || ref === "W") {
    // PENENTUAN TANDA
    dec = -dec;
  }

  return dec;
}

export function isValidGPS(lat: number, lon: number) {
  return typeof lat === "number" && typeof lon === "number" && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}
