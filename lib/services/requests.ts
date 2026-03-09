import api from "@/lib/api";

export const fetchNotOpenedRequestsCount = async (): Promise<number> => {
  const res = await api.get(`/admin/requests/not-opened-count`);
  const raw = res?.data;
  const count =
    raw?.newRequests ?? raw?.count ?? raw?.data?.newRequests ?? raw?.data?.count ?? 0;
  return Number(count ?? 0);
};

export const listRequests = async ({ page, limit, status }: { page?: number; limit?: number; status?: string }): Promise<any> => {
  const res = await api.get(`/admin/requests`, {
    params: {
      page,
      limit,
      status,
    }
  });
  return res?.data;
};

export const updateRequestStatus = async ({ status, id }: { status: string; id: string }): Promise<any> => {
  const res = await api.patch(`/admin/requests/${id}`, { status });
  return res?.data;
};

export const deleteRequest = async ({ id }: { id: string }): Promise<any> => {
  const res = await api.delete(`/admin/requests/${id}`);
  return res?.data;
};