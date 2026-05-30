// src/hooks/useUsers.js
import { useState, useEffect, useCallback } from "react";
import { getUsers, createUser, updateUser, updateUserPassword, toggleUserStatus } from "../services/api";

export default function useUsers() {
  const [users,    setUsers]    = useState([]);
  const [fetching, setFetching] = useState(true);
  const [toast,    setToast]    = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchUsers = useCallback(async () => {
    setFetching(true);
    try {
      const res  = await getUsers();
      const list = res.data?.data ?? res.data ?? [];
      setUsers(list);
    } catch {
      showToast("Gagal memuat data pengguna", "error");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAdd = useCallback(async (form) => {
    try {
      await createUser(form);
      showToast("Pengguna berhasil ditambahkan");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menambah pengguna", "error");
      throw err;
    }
  }, [fetchUsers]);

  const handleEdit = useCallback(async (id, form) => {
    try {
      await updateUser(id, form);
      showToast("Pengguna berhasil diperbarui");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui pengguna", "error");
      throw err;
    }
  }, [fetchUsers]);

  const handlePassword = useCallback(async (id, form) => {
    try {
      await updateUserPassword(id, form);
      showToast("Password berhasil diperbarui");
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui password", "error");
      throw err;
    }
  }, []);

  const handleToggle = useCallback(async (user) => {
    try {
      await toggleUserStatus(user.id);
      showToast(`Akun ${user.name} ${user.is_active ? "dinonaktifkan" : "diaktifkan"}`);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal mengubah status akun", "error");
    }
  }, [fetchUsers]);

  const refresh = useCallback(async () => {
    await fetchUsers();
    showToast("Data pengguna diperbarui");
  }, [fetchUsers]);

  return {
    users, fetching, toast, setToast,
    handleAdd, handleEdit, handlePassword, handleToggle, refresh,
  };
}