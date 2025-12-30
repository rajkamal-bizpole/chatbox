import { useState } from "react";
import type { User, UserForm } from "../types/user.types";

export const useUserForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<UserForm>({
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

  const openAdd = () => {
    setEditUser(null);
    setForm({ username: "", email: "", phone: "", role: "user", password: "" });
    setErrors({ username: "", email: "", phone: "", password: "" });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      password: "",
    });
    setShowModal(true);
  };

  return {
    showModal,
    editUser,
    saving,
    form,
    errors,
    setForm,
    setErrors,
    setSaving,
    setShowModal,
    openAdd,
    openEdit,
  };
};
