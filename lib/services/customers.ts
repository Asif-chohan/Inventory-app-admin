import api from "@/lib/api";

export const listCustomers = async ({ page, limit }: { page?: number; limit?: number }): Promise<any> => {
    const res = await api.get(`/admin/customers`, {
        params: {
            page,
            limit,
        }
    });
    return res?.data;
};

export const getCustomer = async (id: string): Promise<any> => {
    const res = await api.get(`/admin/customers/${id}`);
    return res?.data;
};

export const deleteCustomer = async (id: string): Promise<any> => {
    const res = await api.delete(`/admin/customers/${id}`);
    return res?.data;
};

export const createCustomer = async (data: any): Promise<any> => {
    const res = await api.post(`/admin/customers`, data);
    return res?.data;
};

export const updateCustomer = async (id: string, data: any): Promise<any> => {
    const res = await api.put(`/admin/customers/${id}`, data);
    return res?.data;
};

export const updateCustomerStatus = async (id: string, status: string): Promise<any> => {
    const res = await api.put(`/admin/customers/${id}`, { status });
    return res?.data;
};

export const getCustomerUsage = async (id: string, month: string): Promise<any> => {
    const res = await api.get(`/admin/customers/${id}/usage`, { params: { month } });
    return res?.data;
};

export const getCustomerKeys = async (id: string): Promise<any> => {
    const res = await api.get(`/admin/customers/${id}/keys`);
    return res?.data;
};

export const getCustomerProviders = async (id: string): Promise<any> => {
    const res = await api.get(`/admin/customers/${id}/providers`);
    return res?.data;
};

export const getCustomerMessages = async (id: string, { page, limit, channel }: { page?: number; limit?: number; channel?: string }): Promise<any> => {
    const res = await api.get(`/admin/customers/${id}/messages`, {
        params: { page, limit, channel }
    });
    return res?.data;
};

export const revokeCustomerKey = async (keyId: string): Promise<any> => {
    const res = await api.post(`/admin/keys/${keyId}/revoke`);
    return res?.data;
};

export const generateCustomerKey = async (customerId: string, name: string): Promise<any> => {
    const res = await api.post(`/admin/customers/${customerId}/keys`, { name });
    return res?.data;
};

export const updateCustomerProviders = async (customerId: string, data: any): Promise<any> => {
    const res = await api.put(`/admin/customers/${customerId}/providers`, data);
    return res?.data;
};
