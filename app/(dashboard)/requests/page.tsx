"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { mockRequests } from "@/lib/mockData";
import {
    Search, CheckCircle, XCircle, Eye, Trash2, Clock,
    User, Building2, Mail, Phone, MapPin, MessageSquare,
    Key, ChevronRight, X, Inbox,
    Circle,
    RefreshCw
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

export default function RequestsPage() {
    const [filter, setFilter] = useState<Status>("all");
    const [search, setSearch] = useState("");
    const [approveModal, setApproveModal] = useState<LicenseRequest | null>(null);
    const [viewDrawer, setViewDrawer] = useState<LicenseRequest | null>(null);
    const [rejectModal, setRejectModal] = useState<LicenseRequest | null>(null);
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
    const [channels, setChannels] = useState({ whatsapp: true, sms: false });
    const [phoneNumberId, setPhoneNumberId] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [approving, setApproving] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const queryClient = useQueryClient();
    const { data, isSuccess, isLoading } = useQuery({
      queryKey: [QUERY_KEYS.LIST_REQUESTS],
      queryFn: () => listRequests({}),
      refetchOnWindowFocus: true,
    });

    const updateRequestStatusMutation = useMutation({
      mutationKey: [QUERY_KEYS.UPDATE_REQUEST_STATUS],
      mutationFn: ({ status, id }: { status: string; id: string }) =>
        updateRequestStatus({ status, id }),
      onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.LIST_REQUESTS],
        })
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

    useEffect(()=>{
        if(isSuccess){
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.GET_NOT_OPENED_REQUESTS_COUNT],
            });
        }
    },[isSuccess])

    const requestsData = data?.data || [];

    console.log(data?.data);

    const filtered = requestsData?.items?.filter((r:any) => {
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
      pending: requestsData?.items?.filter((r: {status: string}) => r.status === RequestStatus.PENDING).length,
      approved: requestsData?.items?.filter((r: {status: string}) => r.status === RequestStatus.APPROVED).length,
      rejected: requestsData?.items?.filter((r: {status: string}) => r.status === RequestStatus.REJECTED).length,
    };

    const handleApprove = async () => {
        if (!approveModal) return;
        setApproving(true);
        await new Promise((r) => setTimeout(r, 1500));
        // POST /api/admin/customers body:
        // { name, email, phone, plan_name, monthly_limit, channels: string[], status }
        // Then POST /api/admin/customers/:id/keys → { keyId, clientKey: "inv_..." }
        // Then PUT /api/admin/customers/:id/providers → { whatsapp: { metaPhoneNumberId } }
        // setRequests((prev) =>
        //     prev.map((r) =>
        //         r.id === approveModal.id
        //             ? {
        //                 ...r,
        //                 status: RequestStatus.APPROVED,
        //                 approvedAt: new Date().toISOString(),
        //                 planName: selectedPlan.name,
        //                 // Real key looks like: inv_92b176697c7ffd93...
        //                 licenseKey: `inv_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
        //                 backendCustomerId: `cust_${Math.floor(Math.random() * 1000)}`
        //             }
        //             : r
        //     )
        // );
        setApproving(false);
        setApproveModal(null);
        setStep(1);
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

    const isRejecting = updateRequestStatusMutation.isPending && rejectModal

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

          {/* Table */}
          <div className="table-container">
            <table
              style={{
                opacity: isLoading ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  {/* <th>Customer</th> */}
                  <th>Contact</th>
                  {/* <th>Location</th> */}
                  <th>Requested</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((req: any, i: number) => (
                  <tr key={req.id}>
                    <td style={{ color: "var(--text-dim)", fontSize: 12 }}>
                      {i + 1}
                    </td>
                    {/* <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {req.customerName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {req.email}
                      </div>
                    </td> */}
                    <td>
                      <div
                        style={{
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "var(--text-muted)",
                        }}
                      >
                        <Mail size={11} /> {req.email}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        <Phone size={11} /> {req.contact_number}
                      </div>
                    </td>
                    {/* <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Remote
                    </td> */}
                    <td style={{ fontSize: 12, color: "var(--text-dim)" }}>
                      {timeAgo(req.created_at)}
                    </td>
                    <td>{statusBadge(req.status)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {req.status === "pending" && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setApproveModal(req);
                                setStep(1);
                                setSelectedPlan(PLANS[1]);
                              }}
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setRejectModal(req)}
                            >
                              {isRejecting ? (
                                <Circle size={12} className="animate-spin" />
                              ) : (
                                <XCircle size={12} />
                              )}
                            </button>
                          </>
                        )}
                        <button
                          className="btn-icon"
                          onClick={() => setViewDrawer(req)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ color: "var(--danger)" }}
                          onClick={() =>
                            deleteRequestMutation.mutate({ id: req.id })
                          }
                        >
                          {deleteRequestMutation.isPending &&
                          deleteRequestMutation.variables?.id === req.id ? (
                            <Circle size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {isLoading ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center gap-4 py-8!" >
                        <RefreshCw
                          size={24}
                          className="animate-spin"
                          style={{
                            color: "var(--brand-primary)",
                            opacity: 0.5,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ) : filtered?.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <Inbox size={32} />
                        <div>No requests found</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approve Modal */}
        {approveModal && (
          <div className="modal-overlay" onClick={() => setApproveModal(null)}>
            <div
              className="modal modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    Approve License Request
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {approveModal.customerName} — {approveModal.email}
                  </div>
                </div>
                <button
                  className="btn-icon"
                  onClick={() => setApproveModal(null)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Steps */}
              <div
                style={{
                  padding: "1rem 1.5rem",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                {["Review", "Plan", "WhatsApp setup", "Approve"].map((s, i) => (
                  <div
                    key={s}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background:
                          step > i + 1
                            ? "var(--brand-primary)"
                            : step === i + 1
                              ? "var(--brand-primary)"
                              : "var(--bg-hover)",
                        color:
                          step > i + 1 || step === i + 1
                            ? "#0f172a"
                            : "var(--text-dim)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {step > i + 1 ? "✓" : i + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color:
                          step === i + 1
                            ? "var(--text-primary)"
                            : "var(--text-dim)",
                      }}
                    >
                      {s}
                    </span>
                    {i < 3 && (
                      <ChevronRight
                        size={12}
                        style={{
                          color: "var(--text-dim)",
                          marginLeft: "0.25rem",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step content */}
              <div style={{ padding: "1.5rem" }}>
                {step === 1 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    {[
                      //   {
                      //     icon: User,
                      //     label: "Full Name",
                      //     val: approveModal.customerName,
                      //   },
                      { icon: Mail, label: "Email", val: approveModal.email },
                      {
                        icon: Phone,
                        label: "Phone",
                        val: approveModal.contact_number,
                      },
                    ].map(({ icon: Icon, label, val }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          gap: "0.6rem",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: "rgba(37,211,102,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={13} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--text-dim)",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              fontWeight: 600,
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "var(--text-primary)",
                              marginTop: 1,
                            }}
                          >
                            {val}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label className="form-label">Select Plan</label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.5rem",
                        }}
                      >
                        {PLANS.map((plan) => (
                          <button
                            key={plan.name}
                            onClick={() => setSelectedPlan(plan)}
                            style={{
                              padding: "0.75rem",
                              borderRadius: "var(--radius-sm)",
                              border: `2px solid ${selectedPlan.name === plan.name ? "var(--brand-primary)" : "var(--border)"}`,
                              background:
                                selectedPlan.name === plan.name
                                  ? "rgba(37,211,102,0.08)"
                                  : "var(--bg-primary)",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.15s",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: "var(--text-primary)",
                              }}
                            >
                              {plan.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                                marginTop: 2,
                              }}
                            >
                              {plan.limit === -1
                                ? "Unlimited"
                                : plan.limit.toLocaleString()}{" "}
                              msgs / mo
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--brand-primary)",
                                marginTop: 2,
                                fontWeight: 600,
                              }}
                            >
                              {plan.price}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Channels</label>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        {["whatsapp", "sms"].map((ch) => (
                          <label
                            key={ch}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              cursor: "pointer",
                              fontSize: 13,
                            }}
                          >
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={channels[ch as keyof typeof channels]}
                              onChange={(e) =>
                                setChannels((prev) => ({
                                  ...prev,
                                  [ch]: e.target.checked,
                                }))
                              }
                            />
                            <span>{ch.toUpperCase()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.75rem",
                        background: "rgba(37,211,102,0.08)",
                        border: "1px solid rgba(37,211,102,0.2)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 12,
                        color: "var(--brand-dark)",
                      }}
                    >
                      ℹ️ <strong>Admin Action:</strong> Configure the customer's
                      WhatsApp ID. The global developer token (from Settings)
                      will be used. The customer does not need to handle this.
                    </div>
                    <div>
                      <label className="form-label">
                        WhatsApp Phone Number ID
                      </label>
                      <input
                        className="input"
                        placeholder="e.g. 123456789012345"
                        value={phoneNumberId}
                        onChange={(e) => setPhoneNumberId(e.target.value)}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-dim)",
                          marginTop: 4,
                        }}
                      >
                        The ID of the phone number assigned to this business in
                        your Meta App.
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div style={{ textAlign: "center", padding: "1rem 0" }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "rgba(37,211,102,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                      }}
                    >
                      <Key size={28} color="var(--brand-primary)" />
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Ready to Approve
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        marginBottom: "1.5rem",
                      }}
                    >
                      This will create the customer record, generate a license
                      key, and send it via email.
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                        textAlign: "left",
                        fontSize: 12,
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div className="card" style={{ padding: "0.75rem" }}>
                        <div
                          style={{ color: "var(--text-dim)", marginBottom: 4 }}
                        >
                          Customer
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {approveModal.customerName}
                        </div>
                        <div style={{ color: "var(--text-muted)" }}>
                          {approveModal.email}
                        </div>
                        <div
                          style={{
                            color: "var(--text-dim)",
                            marginTop: 2,
                            fontFamily: "monospace",
                            fontSize: 11,
                          }}
                        >
                          {approveModal.contact_number}
                        </div>
                      </div>
                      <div className="card" style={{ padding: "0.75rem" }}>
                        {/* plan_name + monthly_limit + channels = API fields */}
                        <div
                          style={{ color: "var(--text-dim)", marginBottom: 4 }}
                        >
                          Plan (API fields)
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {selectedPlan.name}
                        </div>
                        <div style={{ color: "var(--text-muted)" }}>
                          monthly_limit:{" "}
                          {selectedPlan.limit === -1
                            ? "-1 (unlimited)"
                            : selectedPlan.limit.toLocaleString()}
                        </div>
                        <div
                          style={{ color: "var(--text-muted)", marginTop: 2 }}
                        >
                          channels: [
                          {Object.entries(channels)
                            .filter(([, v]) => v)
                            .map(([k]) => k)
                            .join(", ")}
                          ]
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer nav */}
              <div
                style={{
                  padding: "1rem 1.5rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    step > 1 ? setStep(step - 1) : setApproveModal(null)
                  }
                >
                  {step > 1 ? "← Back" : "Cancel"}
                </button>
                {step < 4 ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep(step + 1)}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleApprove}
                    disabled={approving}
                  >
                    {approving ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          className="animate-spin"
                          style={{
                            display: "inline-block",
                            width: 12,
                            height: 12,
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                          }}
                        />
                        Generating Key...
                      </span>
                    ) : (
                      <>
                        <Key size={13} /> Generate Key & Approve
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Drawer */}
        {viewDrawer && (
          <div className="modal-overlay" onClick={() => setViewDrawer(null)}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: 380,
                background: "var(--bg-card)",
                borderLeft: "1px solid var(--border)",
                overflowY: "auto",
                animation: "slideIn 0.2s ease-out",
                zIndex: 60,
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  Request Details
                </div>
                <button
                  className="btn-icon"
                  onClick={() => setViewDrawer(null)}
                >
                  <X size={16} />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {[
                  // { label: "Full Name", val: viewDrawer.customerName },
                  { label: "Email", val: viewDrawer.email },
                  { label: "Phone", val: viewDrawer.contact_number },
                  { label: "Status", val: viewDrawer.status, badge: true },
                  { label: "Requested", val: timeAgo(viewDrawer.created_at) },
                  // ...(viewDrawer.status === "approved" ? [
                  //     { label: "Plan", val: viewDrawer.planName || "—" },
                  //     { label: "License Key", val: viewDrawer.licenseKey || "—", mono: true },
                  //     { label: "Approved", val: viewDrawer.approvedAt ? timeAgo(viewDrawer.approvedAt) : "—" },
                  // ] : []),
                ].map(({ label, val, badge }) => (
                  <div
                    key={label}
                    style={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--text-dim)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {label}
                    </span>
                    {badge ? (
                      statusBadge(val)
                    ) : (
                      <span
                        style={{ fontSize: 13, color: "var(--text-primary)" }}
                      >
                        {val}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
                <button
                  className="btn-icon"
                  onClick={() => setRejectModal(null)}
                >
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
                <label className="form-label">
                  Rejection Reason (Optional)
                </label>
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
      </div>
    );
}
