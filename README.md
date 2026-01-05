# 📱 LaporinAja - Geo-Spatial Reporting Frontend

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

**LaporinAja** is a modern web-based public reporting platform that emphasizes location accuracy. It combines high-performance UI with advanced browser features like Geolocation and EXIF metadata extraction to provide a seamless "Report-to-Action" experience.

## ✨ Highlights

- **Interactive Map Dashboard**: Visualize report clusters and individual incidents in real-time using Leaflet.js.
- **Smart Upload Validation**: 
  - Automatically extracts GPS coordinates from photo metadata (EXIF).
  - Cross-verifies coordinates to ensure spatial integrity.
- **Direct Camera Capture**: In-app camera integration with mandatory real-time GPS locking for instant on-site reporting.
- **Admin Workflow Integration**: Dedicated dashboard for admins to process clusters, update statuses, and provide photo-evidence feedback.
- **Modern UX/UI**: Responsive design with elegant notifications using SweetAlert2 and React Hot Toast.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Maps**: Leaflet.js & OpenStreetMap
- **State & Logic**: Custom React Hooks for Geolocation and File Processing
- **Feedback UI**: SweetAlert2



## 📂 Folder Structure

```text
src/
├── app/            # Next.js App Router (Pages & Layouts)
├── components/     # UI Components (Map, Camera, Modals, Cards)
├── hooks/          # Geolocation & Device API hooks
├── lib/            # EXIF Reader & Utility functions
└── types/          # TypeScript Type Definitions
```
🚀 Getting Started
1. Clone the repository
```bash
git clone [https://github.com/Yusufsw1/Laporin-Aja-.git](https://github.com/Yusufsw1/Laporin-Aja-.git)
cd Laporin-Aja-
```
2. Install dependencies
```bash
npm install
```
3. Setup Environment Variables
```
Create a .env.local file:

Cuplikan kode

NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```
4. Run Development Server
```Bash

npm run dev
```
💡 Innovation Focus
This frontend is designed to solve the "Fake Reporting" problem. By implementing Spatial Verification, the app ensures that no report can be submitted without a valid coordinate. It bridges the gap between binary file data (EXIF) and real-time Geolocation APIs, creating a trustworthy reporting ecosystem.


🤝 Contact
Yusuf - GitHub Profile

Live Project: https://laporin-aja.vercel.app/
