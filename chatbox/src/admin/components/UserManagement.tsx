import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Plus, Search, Users, X, Loader2, Phone, Calendar, Clock } from "lucide-react";
import http from '../../api/http';

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  created_at: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await http.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = () => {
    const newErrors = {
      username: "",
      email: "",
      phone: "",
      password: "",
    };

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }

    if (form.phone && !/^\d{10}$/.test(cleanPhoneNumber(form.phone))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!editUser && !form.password) {
      newErrors.password = "Password is required";
    } else if (!editUser && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  // Clean phone number to only digits
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  // Format phone number for display (123) 456-7890
  const formatPhoneForDisplay = (phone: string): string => {
    const cleaned = cleanPhoneNumber(phone);
    if (cleaned.length === 10) {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return phone; // Return original if not 10 digits
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove all non-digits
    const digitsOnly = input.replace(/\D/g, '');
    
    // Format as user types
    let formatted = '';
    if (digitsOnly.length > 0) {
      formatted = '(' + digitsOnly.substring(0, 3);
    }
    if (digitsOnly.length > 3) {
      formatted += ') ' + digitsOnly.substring(3, 6);
    }
    if (digitsOnly.length > 6) {
      formatted += '-' + digitsOnly.substring(6, 10);
    }
    
    setForm({ ...form, phone: formatted });
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({
      username: user.username,
      email: user.email,
      phone: user.phone ? formatPhoneForDisplay(user.phone) : "",
      role: user.role,
      password: "",
    });
    setErrors({ username: "", email: "", phone: "", password: "" });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ username: "", email: "", phone: "", role: "user", password: "" });
    setErrors({ username: "", email: "", phone: "", password: "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload: any = {
        username: form.username,
        email: form.email,
        role: form.role,
      };

      // Clean phone number before saving (remove formatting, keep only digits)
      if (form.phone.trim()) {
        payload.phone = cleanPhoneNumber(form.phone);
      } else {
        payload.phone = ""; // Or null, depending on your backend
      }

      if (editUser) {
        await http.put(`/api/admin/users/${editUser.id}`, payload);
      } else {
        payload.password = form.password;
        await http.post("/api/admin/users", payload);
      }

      fetchUsers();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save user:", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await http.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.phone && cleanPhoneNumber(user.phone).includes(cleanPhoneNumber(search)));
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800 border-purple-200";
      case "user": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Users className="text-[#e76458]" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
            </div>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-3 bg-[#e76458] hover:bg-[#d4594e] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            <Plus size={20} /> 
            Add User
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <Users className="text-purple-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regular Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {users.filter(u => u.role === 'user').length}
                </p>
              </div>
              <Users className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Phone</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {users.filter(u => u.phone && u.phone.trim() !== '').length}
                </p>
              </div>
              <Phone className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        {/* FILTERS AND SEARCH */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20 transition-all duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <select
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20 transition-all duration-200 bg-white"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-[#e76458]" size={32} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-400" size={48} />
                <p className="text-gray-500 mt-4 text-lg">No users found</p>
                <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-6 font-semibold text-gray-700">User</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Contact</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Role</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Created</th>
                      <th className="text-right p-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredUsers.map((user) => {
                        const { date, time } = formatDateTime(user.created_at);
                        return (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150"
                          >
                            <td className="p-6">
                              <div className="font-medium text-gray-900">{user.username}</div>
                            </td>
                            <td className="p-6">
                              <div className="text-gray-600">{user.email}</div>
                              {user.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                  <Phone size={14} />
                                  {formatPhoneForDisplay(user.phone)}
                                </div>
                              )}
                            </td>
                            <td className="p-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-6">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar size={14} />
                                  {date}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Clock size={12} />
                                  {time}
                                </div>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEdit(user)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200 font-medium"
                                >
                                  <Edit size={16} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">
                  {editUser ? "Edit User" : "Add New User"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    className={`w-full p-3 rounded-xl border ${
                      errors.username ? 'border-red-300' : 'border-gray-200'
                    } focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20 transition-all duration-200`}
                    placeholder="Enter username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                  {errors.username && (
                    <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    className={`w-full p-3 rounded-xl border ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    } focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20 transition-all duration-200`}
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.phone ? 'border-red-300' : 'border-gray-200'
                      } focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20 transition-all duration-200`}
                      placeholder="(123) 456-7890"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {form.phone ? `Will be saved as: ${cleanPhoneNumber(form.phone)}` : '10-digit number without formatting'}
                  </p>
                </div>

                {!editUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      className={`w-full p-3 rounded-xl border ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      } focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20 transition-all duration-200`}
                      placeholder="Enter password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20 transition-all duration-200"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e76458] hover:bg-[#d4594e] text-white transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {saving ? "Saving..." : "Save User"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}