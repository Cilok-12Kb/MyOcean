// src/pages/Admin/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/ocean-control-center/login", form);
      const { token, user } = res.data;

      // Simpan semua data user ke localStorage
      localStorage.setItem("token",   token);
      localStorage.setItem("role",    user.role);
      localStorage.setItem("name",    user.name);
      localStorage.setItem("email",   user.email);
      localStorage.setItem("phone",   user.phone    ?? "");
      localStorage.setItem("jabatan", user.jabatan  ?? "");
      localStorage.setItem("user_id", user.id);

      navigate("/ocean-dashboard");
    } catch (err) {
      setError(err.response?.data?.message ?? "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <i className="ti ti-waves" style={{ fontSize: 22, color: "#fff" }} />
          </div>
          <div>
            <div style={s.brandTitle}>MY_OCEAN</div>
            <div style={s.brandSub}>Admin Panel</div>
          </div>
        </div>

        <h2 style={s.heading}>Masuk ke Dashboard</h2>
        <p style={s.sub}>Gunakan akun admin yang telah terdaftar</p>

        {error && (
          <div style={s.errorBox}>
            <i className="ti ti-alert-circle" style={{ fontSize: 15 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={s.field}>
            <label style={s.label}>
              <i className="ti ti-mail" style={{ fontSize: 13, color: "#0284c7" }} /> Email
            </label>
            <input
              style={s.input}
              type="email"
              placeholder="admin@myocean.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>
              <i className="ti ti-lock" style={{ fontSize: 13, color: "#0284c7" }} /> Password
            </label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? (
              <>
                <i className="ti ti-loader-2" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} />
                Memproses...
              </>
            ) : (
              <>
                <i className="ti ti-login" style={{ fontSize: 16 }} />
                Masuk
              </>
            )}
          </button>
        </form>

        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #0c4a6e 0%, #0f172a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { background: "#ffffff", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 28 },
  brandIcon: { width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #0284c7, #0369a1)", display: "flex", alignItems: "center", justifyContent: "center" },
  brandTitle: { fontSize: 16, fontWeight: 700, color: "#0c4a6e" },
  brandSub: { fontSize: 11, color: "#94a3b8" },
  heading: { fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 },
  sub: { fontSize: 13, color: "#64748b", marginBottom: 20 },
  errorBox: { display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: 8 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "#475569", display: "flex", alignItems: "center", gap: 5 },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", background: "#f8fafc" },
  btn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #0284c7, #0369a1)", color: "#ffffff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 },
};