import api from "@/lib/api";

export const listLicenseKeys = async ({ page, limit }: { page?: number; limit?: number }): Promise<any> => {
  const res = await api.get(`/admin/license-keys`, {
    params: { page, limit },
  });
  return res?.data;
};

export const createLicenseKey = async (data: any): Promise<any> => {
  const res = await api.post(`/admin/license-keys`, data);
  return res?.data;
};

export const deleteLicenseKey = async (id: string): Promise<any> => {
  const res = await api.delete(`/admin/license-keys/${id}`);
  return res?.data;
};

export default {
  listLicenseKeys,
  createLicenseKey,
  deleteLicenseKey,
};
