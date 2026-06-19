import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SuperAdminRoute } from "../components/SuperAdminRoute";

import Dashboard from "../pages/Public/Dashboard";
import PasangSurut from "../pages/Public/PasangSurut";
import Cuaca from "../pages/Public/Cuaca";
import Peta from "../pages/Public/Peta";
import PotensiRob from "../pages/Public/PotensiRob";
import MarinMinamo from "../pages/Public/MarinMinamo";

import Login from "../pages/Admin/Login";
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminProfil from "../pages/Admin/Profil";
import AdminLayout from "../layouts/AdminLayout";
import EndminCuaca from "../pages/Admin/Cuaca";
import Pengguna from "../pages/Admin/Pengguna";
import PasangSurutAdmin from "../pages/Admin/PasangSurutAdmin";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/Pasang-Surut" element={<PasangSurut />} />
        <Route path="/Cuaca" element={<Cuaca />} />
        <Route path="/Peta" element={<Peta />} />
        <Route path="/Potensi-Rob" element={<PotensiRob />} />
        <Route path="/marin-minamo" element={<MarinMinamo />} />

        {/* ADMIN LOGIN */}
        <Route path="/MyOcean-Endmin" element={<Login />} />

        {/* ADMIN PANEL */}
        <Route path="/ocean-dashboard" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profil" element={<AdminProfil />} />
          <Route path="Cuaca" element={<EndminCuaca />} />
          <Route path="Pasang-Surut" element={<PasangSurutAdmin />} />
          <Route
            path="/ocean-dashboard/pengguna"
            element={
              <SuperAdminRoute>
                <Pengguna />
              </SuperAdminRoute>
            }
          />
          {/* tambah halaman lain di sini nanti */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}