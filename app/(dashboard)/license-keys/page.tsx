"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Table from "@/components/ui/Table";
import { Search, Trash2, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QUERY_KEYS from "@/constants/queryKeys";
import { listLicenseKeys, deleteLicenseKey } from "@/lib/services/licenseKeys";
import { getAdminLicenseKeysColumns } from "@/constants/tableColumns";
import AddLicenseKeyModal from "@/components/ui/AddLicenseKeyModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

type Filter = "all" | "used" | "unused";
export default function LicenseKeysPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: [QUERY_KEYS.LIST_LICENSE_KEYS, page],
    queryFn: () => listLicenseKeys({ page, limit: 10 }),
    refetchOnWindowFocus: true,
  });

  const deleteMutation = useMutation({
    mutationKey: [QUERY_KEYS.DELETE_LICENSE_KEY],
    mutationFn: (id: string) => deleteLicenseKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIST_LICENSE_KEYS] }),
  });

  const licenseData = data?.data || { items: [], current: 0, total: 0, hasNext: false, hasPrev: false };

  const items: any[] = licenseData.items || [];

  const filtered = items.filter((k: any) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || (k.key || "").toLowerCase().includes(q) || (k.customer_name || "").toLowerCase().includes(q) || (k.customer_email || "").toLowerCase().includes(q);
    const matchesFilter = filter === "all" || (filter === "used" ? !!k.is_used : !k.is_used);
    return matchesSearch && matchesFilter;
  });

  const pagination = {
    current: licenseData.current,
    total: licenseData.total,
    currentPage: page,
    totalPages: Math.max(1, Math.ceil((licenseData.total || 0) / 10)),
    hasNext: licenseData.hasNext,
    hasPrev: licenseData.hasPrev,
  };

  const counts = {
    all: licenseData.current || 0,
    unused: items?.filter((k: { is_used: boolean }) => !k.is_used).length,
    used: items?.filter((k: { is_used: boolean }) => k.is_used).length,
  };

  useEffect(() => {
    if (isSuccess) {
      // nothing special for now
    }
  }, [isSuccess]);

  const columns = getAdminLicenseKeysColumns({
    onDelete: (id: string) => setConfirmDelete(id),
    isDeleting: (id: string) => deleteMutation.isPending && deleteMutation.variables === id,
  });

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    await deleteMutation.mutateAsync(confirmDelete);
    setConfirmDelete(null);
  };

  return (
    <div>
      <Header
        title="License Keys"
        subtitle="Manage and generate license keys"
      />

      <div style={{ padding: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div className="input-group" style={{ width: 320 }}>
            <Search size={14} className="input-icon" />
            <input
              className="input input-with-icon"
              placeholder="Search key, customer or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="tabs">
            {(["all", "unused", "used"] as Filter[]).map(
              (s) => (
                <button
                  key={s}
                  className={`tab ${filter === s ? "active" : ""}`}
                  onClick={() => setFilter(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  <span style={{ opacity: 0.7 }}>({counts[s]})</span>
                </button>
              ),
            )}
          </div>

          <div style={{ marginLeft: "auto" }}>
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={14} /> <span style={{ marginLeft: 6 }}>Add Key</span>
            </button>
          </div>
        </div>

        <Table
          columns={columns as any}
          data={filtered}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage="No license keys found"
        />
      </div>

      <AddLicenseKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          /* query invalidation handled */
        }}
      />

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete License Key"
        description="Are you sure you want to delete this license key?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
