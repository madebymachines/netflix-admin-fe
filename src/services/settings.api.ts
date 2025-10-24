import api from "@/lib/axios";

export interface RegistrationSettings {
  isRegistrationOpen: boolean;
  registrationLimit: number;
}

export const getRegistrationSettings = async (): Promise<RegistrationSettings> => {
  const response = await api.get("/admin/settings/registration");
  return response.data;
};

export const updateRegistrationSettings = async (data: RegistrationSettings): Promise<void> => {
  await api.put("/admin/settings/registration", data);
};
