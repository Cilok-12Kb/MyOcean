// src/components/pengguna/PasswordModal.jsx
import { useState } from "react";
import { Lock, X, Eye, EyeOff, RefreshCw } from "lucide-react";

export default function PasswordModal({ user, onClose, onSave }) {
  const [form, setForm]     = useState({ password: "", password_confirmation: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    const e = {};
    if (!form.password) e.password = "Password wajib diisi";
    else if (form.password.length < 8) e.password = "Password minimal 8 karakter";
    if (form.password !== form.password_confirmation) e.password_confirmation = "Konfirmasi tidak cocok";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try { await onSave(form); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-amber-500" />
            <h2 className="font-bold text-gray-800">Ganti Password</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500">Ganti password untuk <span className="font-semibold text-gray-700">{user?.name}</span></p>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password Baru</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${errors.password ? "border-red-400" : "border-gray-200"}`} />
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Konfirmasi Password</label>
            <input type="password" value={form.password_confirmation} onChange={e => set("password_confirmation", e.target.value)} placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${errors.password_confirmation ? "border-red-400" : "border-gray-200"}`} />
            {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Batal</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 flex items-center gap-2">
            {loading && <RefreshCw size={13} className="animate-spin" />}
            Simpan Password
          </button>
        </div>
      </div>
    </div>
  );
}