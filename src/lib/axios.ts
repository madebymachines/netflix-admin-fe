import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1",
  withCredentials: true,
});

// Flag untuk mencegah loop refresh token
let isRefreshing = false;
// Antrian untuk request yang gagal
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(api);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Cek jika error 401 dan bukan dari request refresh-token itu sendiri
    if (error.response?.status === 401 && originalRequest && originalRequest.url !== "/admin/refresh-tokens") {
      if (isRefreshing) {
        // Jika sudah ada proses refresh, masukkan request ini ke antrian
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        await api.post("/admin/refresh-tokens");
        // Jika berhasil, proses antrian dan ulangi request original
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        // Jika refresh gagal, logout dan tolak semua request di antrian
        processQueue(refreshError as AxiosError);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
