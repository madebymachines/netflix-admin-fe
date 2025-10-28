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

export const getWinnerRecipients = async (): Promise<string[]> => {
  const response = await api.get("/admin/settings/winner-recipients");
  return response.data.emails;
};

export const updateWinnerRecipients = async (emails: string[]): Promise<void> => {
  await api.put("/admin/settings/winner-recipients", { emails });
};
