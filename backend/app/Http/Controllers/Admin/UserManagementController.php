<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    // ── GET /api/admin/users ──────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = User::query()->latest();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name',  'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->get('role')) {
            $query->role($role);
        }

        $users = $query->with('roles')
                       ->select('id', 'name', 'email', 'is_active', 'created_at', 'last_login_at')
                       ->paginate(20);

        $users->through(function ($u) {
            $data = $u->toArray();
            $data['role'] = $u->getRoleNames()->first() ?? 'staff';
            return $data;
        });

        return response()->json($users);
    }

    // ── POST /api/admin/users ─────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'role'     => ['required', Rule::in(['super_admin', 'staff'])],
            'password' => 'required|min:8',
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'is_active' => true,
        ]);

        $user->assignRole($request->role);

        return response()->json([
            'message' => 'Pengguna berhasil dibuat.',
            'user'    => array_merge(
                $user->only('id', 'name', 'email', 'is_active', 'created_at'),
                ['role' => $request->role]
            ),
        ], 201);
    }

    // ── PUT /api/admin/users/{id} ─────────────────────────────────────────────
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'role'  => ['required', Rule::in(['super_admin', 'staff'])], // ← fix
        ]);

        if ($user->id === auth()->id() && $request->role !== 'super_admin') {
            return response()->json([
                'message' => 'Tidak dapat mengubah role akun Anda sendiri.'
            ], 403);
        }

        $user->update([
            'name'  => $request->name,
            'email' => $request->email,
        ]);

        $user->syncRoles([$request->role]);

        return response()->json([
            'message' => 'Pengguna berhasil diperbarui.',
            'user'    => array_merge(
                $user->only('id', 'name', 'email', 'is_active'),
                ['role' => $request->role]
            ),
        ]);
    }

    // ── PATCH /api/admin/users/{id}/password ─────────────────────────────────
    public function updatePassword(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password berhasil diperbarui.']);
    }

    // ── PATCH /api/admin/users/{id}/toggle ───────────────────────────────────
    public function toggle(string $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Tidak dapat menonaktifkan akun Anda sendiri.'
            ], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message'   => "Akun {$user->name} berhasil {$status}.",
            'is_active' => $user->is_active,
        ]);
    }

    /** @deprecated Gunakan store() */
    public function createStaff(Request $request)
    {
        $request->merge(['role' => 'staff']);
        return $this->store($request);
    }
}