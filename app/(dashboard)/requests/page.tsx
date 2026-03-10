"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Table from "@/components/ui/Table";
import {
  Search, CheckCircle, XCircle, Clock, X, Circle
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QUERY_KEYS from "@/constants/queryKeys";
import { deleteRequest, listRequests, updateRequestStatus } from "@/lib/services/requests";
import { RequestStatus } from "@/lib/enums";

interface LicenseRequest {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  customerName: string;
  email: string;
  contact_number: string;
}

type Status = "all" | "pending" | "approved" | "rejected";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const PLANS = [
  { name: "Starter", limit: 200, price: "PKR 500/mo" },
  { name: "Business", limit: 1000, price: "PKR 1,200/mo" },
  { name: "Pro", limit: 5000, price: "PKR 2,500/mo" },
  { name: "Enterprise", limit: -1, price: "Custom" },
];

import { getRequestColumns } from "@/constants/tableColumns";
import AddCustomerModal from "@/components/ui/AddCustomerModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

const initialDefaultValues = { email: "", phone: "" };

export default function RequestsPage() {
  const [filter, setFilter] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [approveModal, setApproveModal] = useState<LicenseRequest | null>(null);
  const [rejectModal, setRejectModal] = useState<LicenseRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState(initialDefaultValues);
  const [page, setPage] = useState(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.LIST_REQUESTS, page],
    queryFn: () => listRequests({page, limit: 10}),
    refetchOnWindowFocus: true,
  });

  const updateRequestStatusMutation = useMutation({
    mutationKey: [QUERY_KEYS.UPDATE_REQUEST_STATUS],
    mutationFn: ({ status, id }: { status: string; id: string }) =>
      updateRequestStatus({ status, id }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LIST_REQUESTS],
      })
      if(data?.data?.status === RequestStatus.APPROVED) {
        setDefaultValues(initialDefaultValues);
        setIsModalOpen(false);
      }
    }
  });

  const deleteRequestMutation = useMutation({
    mutationKey: [QUERY_KEYS.DELETE_REQUEST],
    mutationFn: ({ id }: { id: string }) => deleteRequest({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LIST_REQUESTS],
      });
    },
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOT_OPENED_REQUESTS_COUNT],
      });
    }
  }, [isSuccess])

  const requestsData = data?.data || [];

  const filtered = requestsData?.items?.filter((r: any) => {
    const matchesStatus = filter === "all" || r.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      r?.customerName?.toLowerCase().includes(q) ||
      r?.email?.toLowerCase().includes(q) ||
      r?.contact_number?.includes(q);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: requestsData?.current || 0,
    pending: requestsData?.items?.filter((r: { status: string }) => r.status === RequestStatus.PENDING).length,
    approved: requestsData?.items?.filter((r: { status: string }) => r.status === RequestStatus.APPROVED).length,
    rejected: requestsData?.items?.filter((r: { status: string }) => r.status === RequestStatus.REJECTED).length,
  };

  const pagination = {
    current: requestsData.current,
    total: requestsData.total,
    currentPage: page,
    totalPages: Math.ceil(requestsData.total / 10),
    hasNext: requestsData.hasNext,
    hasPrev: requestsData.hasPrev,
  };

  const handleApprove = async () => {
    if(updateRequestStatusMutation.isPending) return;
    await updateRequestStatusMutation.mutateAsync({ status: RequestStatus.APPROVED, id: approveModal?.id || "" });
    setApproveModal(null);
    // set
    // setIsModalOpen(false);
  };

  const handleReject = async () => {
    if (!rejectModal || updateRequestStatusMutation.isPending) return;
    await updateRequestStatusMutation.mutateAsync({ status: RequestStatus.REJECTED, id: rejectModal.id });
    setRejectModal(null);
    setRejectReason("");
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case RequestStatus.PENDING:
        return <span className="badge badge-warning"><Clock size={9} /> Pending</span>;
      case RequestStatus.APPROVED:
        return <span className="badge badge-success"><CheckCircle size={9} /> Approved</span>;
      default:
        return <span className="badge badge-danger"><XCircle size={9} /> Rejected</span>;
    }
  };

  const isRejecting = updateRequestStatusMutation.isPending && rejectModal;

  const columns = getRequestColumns({
    onApprove: (req) => {
      setApproveModal(req);
      setDefaultValues({email: req.email, phone: req.contact_number});
      setIsModalOpen(true);
    },
    onReject: (req) => setRejectModal(req),
    onView: () => {},
    onDelete: (id) => setIsConfirmModalOpen(id),
    isDeleting: (id) => deleteRequestMutation.isPending && deleteRequestMutation.variables?.id === id,
    isRejecting: (id) => updateRequestStatusMutation.isPending && rejectModal?.id === id,
    statusBadge,
    timeAgo
  });

  const handleCancel = () => setIsConfirmModalOpen(null);
  const handleConfirm = async () => {
    if (!!isConfirmModalOpen) {
      await deleteRequestMutation.mutateAsync({ id: isConfirmModalOpen });
      handleCancel();
    }
  }

  return (
    <div>
      <Header
        title="License Requests"
        subtitle="Review and process incoming access requests"
      />

      <div style={{ padding: "1.5rem" }}>
        {/* Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div className="input-group" style={{ width: 280 }}>
            <Search size={14} className="input-icon" />
            <input
              className="input input-with-icon"
              placeholder="Search by email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="tabs">
            {(["all", "pending", "approved", "rejected"] as Status[]).map(
              (s) => (
                <button
                  key={s}
                  className={`tab ${filter === s ? "active" : ""}`}
                  onClick={() => setFilter(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
                  <span style={{ opacity: 0.7 }}>({counts[s]})</span>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Reusable Table Component */}
        <Table
          columns={columns as any}
          data={filtered || []}
          isLoading={isLoading}
          emptyMessage="No requests found"
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div
            className="modal"
            style={{ maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                Reject Request
              </div>
              <button className="btn-icon" onClick={() => setRejectModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: "1rem",
                }}
              >
                Are you sure you want to reject the request from{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {rejectModal.customerName}
                </strong>
                ?
              </p>
              <label className="form-label">Rejection Reason (Optional)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setRejectModal(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleReject}>
                {isRejecting ? (
                  <Circle size={12} className="animate-spin" />
                ) : (
                  <XCircle size={13} />
                )}{" "}
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setDefaultValues(initialDefaultValues);
          setIsModalOpen(false);
        }}
        onSuccess={() => {
          handleApprove();
        }}
        defaultValues={defaultValues}
      />
      <ConfirmModal
        isOpen={!!isConfirmModalOpen}
        title="Confirm Action"
        description="Are you sure you want to perform this action?"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={deleteRequestMutation.isPending}
      />
    </div>
  );
}
