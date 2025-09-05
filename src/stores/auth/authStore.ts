import { create } from "zustand";
import { z } from "zod";
import api from "@/lib/axios";

const adminSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

export type AdminProfile = z.infer<typeof adminSchema>;

interface AuthState {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>; // Diubah menjadi async
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (data) => {
    const response = await api.post("/admin/login", data);
    const { admin } = response.data;
    const parsedAdmin = adminSchema.parse(admin);
    set({ admin: parsedAdmin, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      // Panggil API logout untuk menghapus cookie di sisi server
      await api.post("/admin/logout");
    } catch (error) {
      console.error("Logout API call failed, clearing state locally.", error);
    } finally {
      // Selalu bersihkan state di frontend, terlepas dari hasil API call
      set({ admin: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    if (!get().isLoading) {
      return;
    }
    try {
      const response = await api.get("/admin/me");
      const parsedAdmin = adminSchema.parse(response.data.admin);
      set({ admin: parsedAdmin, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ admin: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
