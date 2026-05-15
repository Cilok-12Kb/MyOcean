# My_Ocean 🌊

Sistem Monitoring dan Deteksi Dini Banjir Rob berbasis web menggunakan:

* Backend: Laravel
* Frontend: React + Bootstrap
* Authentication: Laravel Sanctum
* Role Management: Spatie Laravel Permission

---

# 📌 Tentang Project

My_Ocean adalah platform monitoring banjir rob dan kondisi pesisir berbasis data realtime.

Project ini dirancang untuk:

* monitoring cuaca
* monitoring pasang surut laut
* deteksi dini banjir rob
* visualisasi data pesisir
* sistem warning realtime
* AI Assistant kelautan “Marin Minamo”

---

# 🏗️ Tech Stack

## Backend

* Laravel v12
* Sanctum Authentication
* Spatie Permission
* MySQL

## Frontend

* React + Vite
* Bootstrap 5
* React Router DOM
* Axios

---

# 📂 Struktur Project

```bash
My_Ocean/
│
├── backend/      # Laravel API
│
└── frontend/     # React Frontend
```

---

# ⚙️ Instalasi Project

## 1. Clone Repository

```bash
git clone <repository-url>
```

---

# 🚀 Backend Setup (Laravel)

Masuk folder backend:

```bash
cd backend
```

## Install Dependency

```bash
composer install
```

## Copy Environment

```bash
cp .env.example .env
```

## Generate Key

```bash
php artisan key:generate
```

## Setup Database

Buat database:

```bash
my_ocean
```

Lalu atur `.env`:

```env
DB_DATABASE=my_ocean
DB_USERNAME=root
DB_PASSWORD=
```

## Jalankan Migration

```bash
php artisan migrate
```

## Jalankan Server

```bash
php artisan serve
```

Backend berjalan di:

```text
http://127.0.0.1:8000
```

---

# 💻 Frontend Setup (React)

Masuk folder frontend:

```bash
cd frontend
```

## Install Dependency

```bash
npm install
```

## Jalankan Frontend

```bash
npm run dev
```

Frontend berjalan di:

```text
http://localhost:5173
```

---

# 🔐 Authentication System

Project menggunakan:

* Laravel Sanctum
* Token Authentication
* Role Based Access Control

Role:

* `super_admin`
* `staff`

---

# 👨‍💻 Admin Panel

Hidden Route:

```text
/ocean-control-center
```

Dashboard Admin:

```text
/ocean-dashboard
```

Fitur:

* Login
* Logout
* Role management
* Staff management
* Protected route

---

# 🌐 Public Pages

Saat ini tersedia:

| Route           | Keterangan              |
| --------------- | ----------------------- |
| `/`             | Dashboard utama         |
| `/pasang-surut` | Monitoring pasang surut |
| `/cuaca`        | Informasi cuaca         |
| `/peta`         | Visualisasi peta        |
| `/potensi-rob`  | Warning banjir rob      |
| `/marin-minamo` | AI Assistant            |

---

# 🤖 Marin Minamo AI

AI Assistant untuk:

* informasi cuaca
* kondisi laut
* warning banjir rob
* monitoring realtime

---

# 📡 Rencana Integrasi

* BMKG API
* Realtime monitoring
* Flood prediction
* Websocket realtime notification
* GIS / Map visualization
* AI recommendation system

---

# 📁 Struktur Frontend

```bash
src/
│
├── assets/
├── components/
├── pages/
│   ├── Public/
│   └── Admin/
│
├── routes/
└── services/
```

---

# 📁 Struktur Backend

```bash
app/
├── Http/
├── Models/
├── Services/
└── Providers/
```

---

# 🛡️ Security

* Sanctum token authentication
* Protected admin routes
* Role middleware
* Hidden admin panel route

---

# 👥 Team Development Rules

## Branch Naming

```bash
feature/nama-fitur
fix/nama-bug
hotfix/nama-hotfix
```

Contoh:

```bash
feature/public-dashboard
feature/bmkg-api
fix/login-error
```

---

# ✅ Commit Message Convention

```bash
feat:
fix:
style:
refactor:
docs:
```

Contoh:

```bash
feat: add public monitoring page
fix: resolve login token issue
docs: update README
```

---

# 📌 Catatan Development

* Jangan push file `.env`
* Gunakan branch sendiri
* Pull sebelum push
* Gunakan naming component PascalCase
* Gunakan route lowercase

---

# 📄 License

Internal Development Project

---

# 🌊 My_Ocean

Monitoring the ocean. Protecting the coast.
