// src/pages/Admin/Pengguna.jsx
import { useState } from "react";
import { Shield, Plus, Search, Edit2, Lock, ToggleLeft, ToggleRight, ChevronDown, Users, UserCheck, UserX, RefreshCw } from "lucide-react";
import useUsers from "../../hooks/useUsers";
import RoleBadge, { ROLES, ROLE_LABEL } from "../../components/pengguna/RoleBadge";
import Toast from "../../components/pengguna/Toast";
import UserModal from "../../components/pengguna/UserModal";
import PasswordModal from "../../components/pengguna/PasswordModal";
import ToggleConfirmModal from "../../components/pengguna/ToggleConfirmModal";
import EndminTopbar from "../../components/EndminTopbar";

export default function Pengguna() {
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal,      setModal]      = useState(null);

  const {
    users, fetching, toast, setToast,
    handleAdd, handleEdit, handlePassword, handleToggle, refresh,
  } = useUsers();

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalActive   = users.filter(u => u.is_active).length;
  const totalInactive = users.filter(u => !u.is_active).length;

  return (
    <div className="p-6 min-h-screen bg-gray-50/40">
      {/* Topbar */}
      <EndminTopbar />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" style={{ paddingTop: "80px" }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield size={20} className="text-purple-600" />
            <h1 className="text-xl font-bold text-gray-800">Manajemen Pengguna</h1>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">Super Admin</span>
          </div>
          <p className="text-sm text-gray-500 ml-7">Kelola akun, role, dan status pengguna sistem</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} disabled={fetching}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-60">
            <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
            Refresh
          </button>
          <button onClick={() => setModal({ type: "add" })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-all">
            <Plus size={15} />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Pengguna", value: users.length,  icon: Users,     color: "blue"    },
          { label: "Aktif",          value: totalActive,   icon: UserCheck, color: "emerald" },
          { label: "Nonaktif",       value: totalInactive, icon: UserX,     color: "red"     },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-50`}>
              <Icon size={18} className={`text-${color}-500`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 leading-none">{fetching ? "—" : value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email pengguna..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        </div>
        <div className="relative">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="pl-3.5 pr-8 py-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
            <option value="all">Semua Role</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pengguna</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Login Terakhir</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Dibuat</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fetching ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-400">
                  <RefreshCw size={24} className="mx-auto mb-2 text-gray-300 animate-spin" />
                  Memuat data...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-400">
                  <Users size={32} className="mx-auto mb-2 text-gray-200" />
                  Tidak ada pengguna ditemukan
                </td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50/60 transition-colors ${!user.is_active ? "opacity-60" : ""}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-snug">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {user.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 hidden md:table-cell">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString("id-ID") : "-"}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 hidden lg:table-cell">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setModal({ type: "edit", user })} title="Edit pengguna"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setModal({ type: "password", user })} title="Ganti password"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                        <Lock size={14} />
                      </button>
                      <button onClick={() => setModal({ type: "toggle", user })} title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                        className={`p-1.5 rounded-lg transition-all ${user.is_active ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>
                        {user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Menampilkan <span className="font-semibold text-gray-600">{filtered.length}</span> dari <span className="font-semibold text-gray-600">{users.length}</span> pengguna
          </p>
          <p className="text-xs text-gray-300">Hanya dapat diakses Super Admin</p>
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "add" && (
        <UserModal mode="add" user={null} onClose={() => setModal(null)}
          onSave={async (form) => { await handleAdd(form); setModal(null); }} />
      )}
      {modal?.type === "edit" && (
        <UserModal mode="edit" user={modal.user} onClose={() => setModal(null)}
          onSave={async (form) => { await handleEdit(modal.user.id, form); setModal(null); }} />
      )}
      {modal?.type === "password" && (
        <PasswordModal user={modal.user} onClose={() => setModal(null)}
          onSave={async (form) => { await handlePassword(modal.user.id, form); setModal(null); }} />
      )}
      {modal?.type === "toggle" && (
        <ToggleConfirmModal user={modal.user} onClose={() => setModal(null)}
          onConfirm={async (user) => { await handleToggle(user); setModal(null); }} />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}