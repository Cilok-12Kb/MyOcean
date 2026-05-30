# My_Ocean 🌊

Sistem Monitoring dan Deteksi Dini Banjir Rob berbasis web.

---

## 📌 Tentang Project

My_Ocean adalah platform monitoring banjir rob dan kondisi pesisir berbasis data realtime.

Project ini dirancang untuk:

- Monitoring cuaca
- Monitoring pasang surut laut
- Deteksi dini banjir rob
- Visualisasi data pesisir
- Sistem warning realtime
- AI Assistant kelautan "Marin Minamo"

---

## 🏗️ Tech Stack

### Backend
- Laravel v12
- Sanctum Authentication
- Spatie Permission
- MySQL

### Frontend
- React + Vite
- Bootstrap 5
- React Router DOM
- Axios

---

## ⚙️ Instalasi Project

### 1. Clone Repository

```bash
git clone <repository-url>
```

---

## 🚀 Backend Setup (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

> Backend berjalan di `http://127.0.0.1:8000`

---

## 💻 Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

> Frontend berjalan di `http://localhost:5173`

---

## 🔐 Authentication System

- Laravel Sanctum Token Authentication
- Role Based Access Control (RBAC)

| Role | Akses |
|---|---|
| `super_admin` | Full access |
| `staff` | Partial access |

---

## 🌐 Public Pages

| Route | Keterangan |
|---|---|
| `/` | Dashboard utama |
| `/pasang-surut` | Monitoring pasang surut |
| `/cuaca` | Informasi cuaca |
| `/peta` | Visualisasi peta |
| `/potensi-rob` | Warning banjir rob |
| `/marin-minamo` | AI Assistant |

---

## 📂 Struktur Frontend

```
src/
├── assets/
├── components/
│   └── weather/
│       ├── LoadingScreen.jsx
│       ├── WeatherHeader.jsx
│       ├── WeatherMap.jsx
│       ├── WeatherPopup.jsx
│       └── WeatherSidebar.jsx
├── hooks/
│   └── useWeather.js
├── pages/
│   ├── Public/
│   │   ├── Cuaca.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MarinMinamo.jsx
│   │   ├── PasangSurut.jsx
│   │   ├── Peta.jsx
│   │   └── PotensiRob.jsx
│   └── Admin/
├── routes/
│   └── AppRoutes.jsx
├── services/
│   └── api.js
├── styles/
│   └── weather.css
└── utils/
    └── weatherIcons.js
```

---

## 📂 Struktur Backend

```
app/
├── Http/
├── Models/
├── Services/
└── Providers/
```

---

## ✅ Progress Saat Ini

### Halaman Public

| Halaman | Status | Keterangan |
|---|---|---|
| Dashboard | ✅ Selesai | Halaman utama publik |
| Cuaca | ✅ Selesai | Peta interaktif + data BMKG realtime |
| Pasang Surut | 🚧 On Progress | — |
| Peta | 🚧 On Progress | — |
| Potensi Rob | 🚧 On Progress | — |
| Marin Minamo | 🚧 On Progress | AI Assistant kelautan |

### Halaman Admin

| Fitur | Status |
|---|---|
| Login / Logout | ✅ Selesai |
| Dashboard Admin | ✅ Selesai |
| Role Management | ✅ Selesai |
| Staff Management | ✅ Selesai |
| Protected Route | ✅ Selesai |

### Integrasi & Infrastruktur

| Fitur | Status |
|---|---|
| BMKG API — Data Cuaca Semarang | ✅ Selesai |
| Peta Leaflet + Marker cuaca per kelurahan | ✅ Selesai |
| Prakiraan cuaca per jam (slider card) | ✅ Selesai |
| Auto-refresh data setiap 60 detik | ✅ Selesai |
| Filter kecamatan + search kelurahan | ✅ Selesai |
| Refactoring arsitektur komponen | ✅ Selesai |
| BMKG API — Pasang Surut | 🔜 Planned |
| Flood prediction / Deteksi Rob | 🔜 Planned |
| Websocket realtime notification | 🔜 Planned |
| GIS / Map visualization lanjutan | 🔜 Planned |
| AI Recommendation System | 🔜 Planned |

---

## 🤖 Marin Minamo AI

AI Assistant untuk:

- Informasi cuaca
- Kondisi laut
- Warning banjir rob
- Monitoring realtime

---

## 👥 Team Development Rules

### Branch Naming

```bash
feature/nama-fitur
fix/nama-bug
hotfix/nama-hotfix
```

### Commit Message Convention

```bash
feat:     # Fitur baru
fix:      # Perbaikan bug
style:    # Perubahan tampilan / formatting
refactor: # Refactoring kode
docs:     # Perubahan dokumentasi
```

---

## 📌 Catatan Development

- Jangan push file `.env`
- Gunakan branch sendiri
- Pull sebelum push
- Gunakan naming component PascalCase
- Gunakan route lowercase

---

## 📄 License

Internal Development Project

---

> 🌊 **My_Ocean** — Monitoring the ocean. Protecting the coast.