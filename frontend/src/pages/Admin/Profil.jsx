// src/pages/Admin/Profil.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Profil() {
  const navigate = useNavigate();
  const [mode, setMode]       = useState("view");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg]         = useState(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", jabatan: "",
  });
  const [passForm, setPassForm] = useState({
    current_password: "", new_password: "", confirm_password: "",
  });
  const [showPass, setShowPass] = useState({
    current: false, new: false, confirm: false,
  });

  // Fetch profil dari backend saat mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/admin/profile");
        const u = res.data;
        setForm({ name: u.name, email: u.email, phone: u.phone ?? "", jabatan: u.jabatan ?? "" });
        // Update localStorage juga
        localStorage.setItem("name",    u.name);
        localStorage.setItem("email",   u.email);
        localStorage.setItem("phone",   u.phone    ?? "");
        localStorage.setItem("jabatan", u.jabatan  ?? "");
        localStorage.setItem("role",    u.role);
      } catch {
        // 401 ditangani interceptor
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const initials = form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.put("/admin/profile", form);
      const u = res.data.user;
      localStorage.setItem("name",    u.name);
      localStorage.setItem("email",   u.email);
      localStorage.setItem("phone",   u.phone    ?? "");
      localStorage.setItem("jabatan", u.jabatan  ?? "");
      setMsg({ type: "success", text: "Profil berhasil diperbarui." });
      setMode("view");
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message ?? "Gagal menyimpan profil." });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm_password) {
      setMsg({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.put("/admin/profile/password", {
        current_password:      passForm.current_password,
        new_password:          passForm.new_password,
        new_password_confirmation: passForm.confirm_password, // Laravel rule: confirmed
      });
      // Token baru dari backend, update localStorage
      if (res.data.token) localStorage.setItem("token", res.data.token);
      setMsg({ type: "success", text: "Password berhasil diubah. Silakan login ulang." });
      setPassForm({ current_password: "", new_password: "", confirm_password: "" });
      setShowPass({ current: false, new: false, confirm: false });
      setMode("view");
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message ?? "Gagal mengubah password." });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMsg(null);
    setShowPass({ current: false, new: false, confirm: false });
  };

  if (fetching) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <i className="ti ti-loader-2" style={{ fontSize: 32, color: "#0284c7", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={p.page}>
      <div style={p.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={p.backBtn} onClick={() => navigate("/ocean-dashboard")}>
            <i className="ti ti-arrow-left" style={{ fontSize: 16 }} />
          </button>
          <div>
            <div style={p.pageTitle}>Profil Saya</div>
            <div style={p.pageMeta}>Kelola informasi akun Anda</div>
          </div>
        </div>
      </div>

      <div style={p.content}>
        {msg && (
          <div style={{ ...p.alert, background: msg.type === "success" ? "#f0fdf4" : "#fef2f2", borderColor: msg.type === "success" ? "#bbf7d0" : "#fecaca", color: msg.type === "success" ? "#166534" : "#991b1b" }}>
            <i className={`ti ${msg.type === "success" ? "ti-circle-check" : "ti-alert-circle"}`} style={{ fontSize: 16 }} />
            {msg.text}
          </div>
        )}

        <div style={p.grid}>
          {/* Sidebar kiri */}
          <div style={p.avatarCard}>
            <div style={p.avatarBig}>{initials}</div>
            <div style={p.avatarName}>{form.name}</div>
            <div style={p.avatarRole}>{localStorage.getItem("role") || "Administrator"}</div>
            <div style={p.avatarMeta}>
              <i className="ti ti-mail" style={{ fontSize: 14, color: "#0284c7" }} />
              <span style={{ fontSize: 12, color: "#475569" }}>{form.email || "-"}</span>
            </div>
            {form.phone && (
              <div style={p.avatarMeta}>
                <i className="ti ti-phone" style={{ fontSize: 14, color: "#16a34a" }} />
                <span style={{ fontSize: 12, color: "#475569" }}>{form.phone}</span>
              </div>
            )}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              <button
                style={{ ...p.tabBtn, ...(mode === "edit" ? p.tabBtnActive : {}) }}
                onClick={() => switchMode("edit")}
              >
                <i className="ti ti-edit" style={{ fontSize: 15 }} /> Edit Profil
              </button>
              <button
                style={{ ...p.tabBtn, ...(mode === "password" ? p.tabBtnActive : {}) }}
                onClick={() => switchMode("password")}
              >
                <i className="ti ti-lock" style={{ fontSize: 15 }} /> Ganti Password
              </button>
            </div>
          </div>

          {/* Konten kanan */}
          <div style={p.formCard}>
            {mode === "view" && (
              <>
                <div style={p.formTitle}>Informasi Akun</div>
                <InfoRow label="Nama Lengkap" value={form.name}   icon="ti-user" />
                <InfoRow label="Email"        value={form.email}  icon="ti-mail" />
                <InfoRow label="No. HP"       value={form.phone   || "-"} icon="ti-phone" />
                <InfoRow label="Jabatan"      value={form.jabatan || "-"} icon="ti-id-badge" />
                <InfoRow label="Role"         value={localStorage.getItem("role") || "Administrator"} icon="ti-shield" />
              </>
            )}

            {mode === "edit" && (
              <>
                <div style={p.formTitle}>Edit Profil</div>
                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <FormField label="Nama Lengkap" icon="ti-user" required>
                    <input style={p.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" required />
                  </FormField>
                  <FormField label="Email" icon="ti-mail" required>
                    <input style={p.input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@domain.com" required />
                  </FormField>
                  <FormField label="No. HP" icon="ti-phone">
                    <input style={p.input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62 8xx xxxx xxxx" />
                  </FormField>
                  <FormField label="Jabatan" icon="ti-id-badge">
                    <input style={p.input} value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} placeholder="Jabatan / posisi" />
                  </FormField>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button type="submit" style={p.btnPrimary} disabled={loading}>
                      <i className={`ti ${loading ? "ti-loader-2" : "ti-check"}`} style={{ fontSize: 15, animation: loading ? "spin 1s linear infinite" : "none" }} />
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button type="button" style={p.btnSecondary} onClick={() => switchMode("view")}>Batal</button>
                  </div>
                </form>
              </>
            )}

            {mode === "password" && (
              <>
                <div style={p.formTitle}>Ganti Password</div>
                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <FormField label="Password Saat Ini" icon="ti-lock" required>
                    <PasswordInput
                      value={passForm.current_password}
                      onChange={(e) => setPassForm({ ...passForm, current_password: e.target.value })}
                      placeholder="••••••••"
                      show={showPass.current}
                      onToggle={() => setShowPass({ ...showPass, current: !showPass.current })}
                    />
                  </FormField>
                  <FormField label="Password Baru" icon="ti-lock-plus" required>
                    <PasswordInput
                      value={passForm.new_password}
                      onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
                      placeholder="Min. 8 karakter"
                      show={showPass.new}
                      onToggle={() => setShowPass({ ...showPass, new: !showPass.new })}
                    />
                  </FormField>
                  <FormField label="Konfirmasi Password Baru" icon="ti-lock-check" required>
                    <PasswordInput
                      value={passForm.confirm_password}
                      onChange={(e) => setPassForm({ ...passForm, confirm_password: e.target.value })}
                      placeholder="Ulangi password baru"
                      show={showPass.confirm}
                      onToggle={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                    />
                  </FormField>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button type="submit" style={p.btnPrimary} disabled={loading}>
                      <i className={`ti ${loading ? "ti-loader-2" : "ti-lock-check"}`} style={{ fontSize: 15, animation: loading ? "spin 1s linear infinite" : "none" }} />
                      {loading ? "Mengubah..." : "Ubah Password"}
                    </button>
                    <button type="button" style={p.btnSecondary} onClick={() => switchMode("view")}>Batal</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Komponen PasswordInput dengan toggle mata ──────────────────────────────
function PasswordInput({ value, onChange, placeholder, show, onToggle }) {
  return (
    <div style={{ position: "relative" }}>
      <input
        style={{ ...p.input, paddingRight: 38 }}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        minLength={8}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer",
          color: show ? "#0284c7" : "#94a3b8",
          padding: 2, display: "flex", alignItems: "center",
          transition: "color 0.15s",
        }}
      >
        <i className={`ti ${show ? "ti-eye-off" : "ti-eye"}`} style={{ fontSize: 16 }} />
      </button>
    </div>
  );
}

// ── Komponen InfoRow ───────────────────────────────────────────────────────
function InfoRow({ label, value, icon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 13, color: "#94a3b8" }} />
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 500, paddingLeft: 19 }}>{value}</span>
    </div>
  );
}

// ── Komponen FormField ─────────────────────────────────────────────────────
function FormField({ label, icon, children, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, color: "#475569", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 13, color: "#0284c7" }} />
        {label}{required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const p = {
  page: { minHeight: "100vh", background: "#f8fafc" },
  topbar: { background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "14px 28px", display: "flex", alignItems: "center" },
  pageTitle: { fontSize: 16, fontWeight: 700, color: "#0c4a6e" },
  pageMeta: { fontSize: 12, color: "#64748b", marginTop: 1 },
  backBtn: { width: 34, height: 34, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" },
  content: { padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 },
  alert: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, border: "1px solid", fontSize: 13, fontWeight: 500 },
  grid: { display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" },
  avatarCard: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  avatarBig: { width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #0284c7, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#ffffff", marginBottom: 4 },
  avatarName: { fontSize: 15, fontWeight: 700, color: "#0f172a", textAlign: "center" },
  avatarRole: { fontSize: 11, color: "#0284c7", fontWeight: 600, background: "#e0f2fe", padding: "2px 10px", borderRadius: 20, marginBottom: 4 },
  avatarMeta: { display: "flex", alignItems: "center", gap: 6, marginTop: 2 },
  tabBtn: { display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 500 },
  tabBtnActive: { background: "#e0f2fe", borderColor: "#bae6fd", color: "#0284c7" },
  formCard: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px" },
  formTitle: { fontSize: 15, fontWeight: 700, color: "#0c4a6e", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" },
  input: { padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a", background: "#f8fafc", outline: "none", width: "100%", boxSizing: "border-box" },
  btnPrimary: { display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #0284c7, #0369a1)", color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnSecondary: { padding: "9px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 13, fontWeight: 500, cursor: "pointer" },
};