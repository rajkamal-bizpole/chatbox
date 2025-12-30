import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Phone } from "lucide-react";
import { usersApi } from "../api/users.api";
import type { User } from "../types/user.types";

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserModal({
  open,
  user,
  onClose,
  onSuccess,
}: Props) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});

  /* 🔥 THIS IS WHY EDIT WAS NOT OPENING */
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        password: "",
      });
    } else {
      setForm({
        username: "",
        email: "",
        phone: "",
        role: "user",
        password: "",
      });
    }
  }, [user, open]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);

    const payload: any = {
      username: form.username,
      email: form.email,
      phone: form.phone,
      role: form.role,
    };

    if (user) {
      await usersApi.update(user.id, payload);
    } else {
      payload.password = form.password;
      await usersApi.create(payload);
    }

    setSaving(false);
    onClose();
    onSuccess();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl w-full max-w-md p-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">
              {user ? "Edit User" : "Add User"}
            </h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* 🔁 SAME INPUTS AS BEFORE */}
          <input
            className="w-full mb-3 p-3 border rounded"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <input
            className="w-full mb-3 p-3 border rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <div className="relative mb-3">
            <Phone className="absolute left-3 top-3 text-gray-400" />
            <input
              className="w-full pl-10 p-3 border rounded"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </div>

          {!user && (
            <input
              type="password"
              className="w-full mb-3 p-3 border rounded"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          )}

          <select
            className="w-full mb-4 p-3 border rounded"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#e76458] text-white py-3 rounded"
          >
            {saving ? <Loader2 className="animate-spin mx-auto" /> : "Save"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
