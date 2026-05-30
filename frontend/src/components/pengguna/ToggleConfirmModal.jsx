// src/components/pengguna/ToggleConfirmModal.jsx
import { useState } from "react";
import { UserX, UserCheck, RefreshCw } from "lucide-react";

export default function ToggleConfirmModal({ user, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const isActive = user?.is_active;

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(user); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isActive ? "bg-red-100" : "bg-emerald-100"}`}>
          {isActive ? <UserX size={24} className="text-red-500" /> : <UserCheck size={24} className="text-emerald-500" />}
        </div>
        <h3 className="font-bold text-gray-800 mb-1">{isActive ? "Nonaktifkan Akun?" : "Aktifkan Akun?"}</h3>
        <p className="text-sm text-gray-500 mb-5">
          Akun <span className="font-semibold text-gray-700">{user?.name}</span> akan {isActive ? "dinonaktifkan dan tidak bisa login" : "diaktifkan kembali"}.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">Batal</button>
          <button onClick={handleConfirm} disabled={loading}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 ${isActive ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"} disabled:opacity-60`}>
            {loading && <RefreshCw size={13} className="animate-spin" />}
            {isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </div>
      </div>
    </div>
  );
}