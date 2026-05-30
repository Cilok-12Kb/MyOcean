// src/components/pengguna/RoleBadge.jsx
export const ROLES      = ["super_admin", "staff"];
export const ROLE_LABEL = { super_admin: "Super Admin", staff: "Staff" };
export const ROLE_COLOR = {
  super_admin: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  staff:       { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500"   },
};

export default function RoleBadge({ role }) {
  const c = ROLE_COLOR[role] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {ROLE_LABEL[role] || role}
    </span>
  );
}