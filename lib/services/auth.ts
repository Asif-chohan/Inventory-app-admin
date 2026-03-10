import api from "../api";

export const getProfile = async (): Promise<any> => {
  const res = await api.get(`/auth/me`);
  return res?.data;
};

export const updatePassword = async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }): Promise<any> => {
  const res = await api.put(`/auth/update-password`, {
    currentPassword,
    newPassword,
  });
  return res?.data;
};

export const updateName = async ({ name }: { name: string }): Promise<any> => {
  const res = await api.put(`/auth/update-name`, { name });
  return res?.data;
};

export const updateEmail = async ({ email }: { email: string }): Promise<any> => {
  const res = await api.put(`/auth/update-email`, { email });
  return res?.data;
};

export const login = async ({ email, password }: { email: string; password: string }): Promise<any> => {
  const res = await api.post(`/auth/login`, { email, password });
  return res?.data;
};

export const addAdmin = async ({ email, password, name }: { email: string; password: string; name: string }): Promise<any> => {
  const res = await api.post(`/auth/register`, { email, password, name });
  return res?.data;
};