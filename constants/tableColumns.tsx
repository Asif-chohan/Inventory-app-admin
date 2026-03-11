import React from "react";
import Link from "next/link";
import {
    Eye, Edit, Trash2, Mail, Phone, Clock,
    CheckCircle, XCircle, Circle
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { timeAgo } from "@/lib/utils";

/**
 * CUSTOMER TABLE COLUMNS
 */
export const getCustomerColumns = (
    handleEditCustomerClick: (customer: any) => void,
    // handleDelete: (id: string) => void
) => [
        {
            header: "Customer",
            accessor: (c: any) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--brand-primary), var(--brand-dark))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}>
                        {c.name[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.email}</div>
                    </div>
                </div>
            ),
        },
        {
            header: "Phone",
            accessor: "phone",
            cellStyle: { fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" },
        },
        {
            header: "Plan",
            accessor: (c: any) => (
                <>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.plan_name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                        {c.monthly_limit === -1 ? "Unlimited" : `${c.monthly_limit.toLocaleString()} msgs`}
                    </div>
                </>
            ),
        },
        {
            header: "Channels",
            accessor: (c: any) => (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {c.channels.includes("whatsapp") && (
                        <span className="badge badge-success" style={{ fontSize: 10 }}>WA</span>
                    )}
                    {c.channels.includes("sms") && (
                        <span className="badge badge-info" style={{ fontSize: 10 }}>SMS</span>
                    )}
                </div>
            ),
        },
        {
            header: "Status",
            accessor: (c: any) => <StatusBadge status={c.status} />,
        },
        {
            header: "Joined",
            accessor: (c: any) => new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            cellStyle: { fontSize: 12, color: "var(--text-dim)" },
        },
        {
            header: "Actions",
            accessor: (c: any) => (
                <div style={{ display: "flex", gap: 4 }}>
                    <Link href={`/customers/${c.id}`} className="btn-icon" title="View Details">
                        <Eye size={14} />
                    </Link>
                    <button className="btn-icon" title="Edit Customer" onClick={() => handleEditCustomerClick(c)}>
                        <Edit size={14} />
                    </button>
                    {/* <button onClick={() => handleDelete(c.id)} className="btn-icon" title="Delete Customer" style={{ color: "var(--danger)" }}>
                        <Trash2 size={14} />
                    </button> */}
                </div>
            ),
        },
    ];

/**
 * LICENSE REQUEST TABLE COLUMNS
 */
export const getRequestColumns = (handlers: {
    onApprove: (req: any) => void;
    onReject: (req: any) => void;
    onView: (req: any) => void;
    onDelete: (id: string) => void;
    isDeleting: (id: string) => boolean;
    isRejecting: (id: string) => boolean;
    statusBadge: (status: string) => React.ReactNode;
    timeAgo: (date: string) => string;
}) => [
        {
            header: "#",
            accessor: (item: any, index?: number) => {
                return index !== undefined ? index + 1 : "";
            },
            cellStyle: { color: "var(--text-dim)", fontSize: 12 },
        },
        {
            header: "Contact",
            accessor: (req: any) => (
                <>
                    <div style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
                        <Mail size={11} /> {req.email}
                    </div>
                    <div style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", marginTop: 2 }}>
                        <Phone size={11} /> {req.contact_number}
                    </div>
                </>
            ),
        },
        {
            header: "Requested",
            accessor: (req: any) => (
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    {handlers.timeAgo(req.created_at)}
                </span>
            ),
        },
        {
            header: "Status",
            accessor: (req: any) => handlers.statusBadge(req.status),
        },
        {
            header: "Actions",
            accessor: (req: any) => (
                <div style={{ display: "flex", gap: 4 }}>
                    {req.status === "pending" && (
                        <>
                            <button className="btn btn-primary btn-sm" onClick={() => handlers.onApprove(req)}>
                                <CheckCircle size={12} /> Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handlers.onReject(req)}>
                                {handlers.isRejecting(req.id) ? (
                                    <Circle size={12} className="animate-spin" />
                                ) : (
                                    <XCircle size={12} />
                                )}
                            </button>
                        </>
                    )}
                    {/* <button className="btn-icon" onClick={() => handlers.onView(req)}>
                        <Eye size={14} />
                    </button> */}
                    <button className="btn-icon" style={{ color: "var(--danger)" }} onClick={() => handlers.onDelete(req.id)}>
                        {handlers.isDeleting(req.id) ? (
                            <Circle size={12} className="animate-spin" />
                        ) : (
                            <Trash2 size={14} />
                        )}
                    </button>
                </div>
            ),
        },
    ];

/**
 * LICENSE KEY TABLE COLUMNS (Customer Details)
 */
export const getLicenseKeyColumns = (onRevoke: (id: string) => void) => [
    { header: "Name", accessor: (key: any) => key.name || "Unnamed", cellStyle: { fontSize: 12 } },
    { header: "Key Prefix", accessor: (key: any) => <span className="key-mask" style={{ fontSize: 11 }}>{(key.key_prefix || key.keyPrefix)}••••</span> },
    {
        header: "Status",
        accessor: (key: any) => (
            <span className={`badge ${!key.revoked ? "badge-success" : "badge-muted"}`} style={{ fontSize: 10 }}>
                {key.revoked ? "Revoked" : "Active"}
            </span>
        )
    },
    {
        header: "",
        accessor: (key: any) => !key.revoked && (
            <button className="btn-icon" style={{ color: "var(--danger)" }} onClick={() => onRevoke(key.keyId || key.id)}>
                <XCircle size={12} />
            </button>
        )
    }
];

/**
 * ADMIN: LICENSE KEYS TABLE COLUMNS
 */
export const getAdminLicenseKeysColumns = (handlers: {
  onDelete: (id: string) => void;
  isDeleting: (id: string) => boolean;
}) => [
  {
    header: "#",
    accessor: (item: any, index?: number) => {
      return index !== undefined ? index + 1 : "";
    },
    cellStyle: { color: "var(--text-dim)", fontSize: 12 },
  },
  {
    header: "Key",
    accessor: (k: any) => (
      <div style={{ fontFamily: "monospace", fontSize: 13 }}>
        {k.key || k.key_string || k.key_value}
      </div>
    ),
  },
  {
    header: "Customer",
    accessor: (k: any) => (
      <div style={{ fontSize: 13 }}>
        <div style={{ fontWeight: 600 }}>{k.customer_name || "-"}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {k.customer_email || "-"}
        </div>
      </div>
    ),
  },
  {
    header: "Plan",
    accessor: (k: any) => k.plan || "-",
    cellStyle: { fontSize: 12 },
  },
  {
    header: "Used",
    accessor: (k: any) => (
      <span
        className={`badge ${k.is_used ? "badge-success" : "badge-muted"}`}
        style={{ fontSize: 11 }}
      >
        {k.is_used ? "Used" : "Unused"}
      </span>
    ),
  },
  {
    header: "Notes",
    accessor: (k: any) => (
      <div className="w-52 truncate" title={k.notes || "-"}>
        {k.notes ?? "-"}
      </div>
    ),
  },
  {
    header: "Created",
    accessor: (k: any) =>
      new Date(k.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    cellStyle: { fontSize: 12, color: "var(--text-dim)" },
  },
  {
    header: "Actions",
    accessor: (k: any) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button
          className="btn-icon"
          title="Delete"
          style={{ color: "var(--danger)" }}
          onClick={() => handlers.onDelete(k.id || k.keyId)}
        >
          {handlers.isDeleting(k.id || k.keyId) ? (
            <span
              className="animate-spin"
              style={{
                width: 12,
                height: 12,
                borderRadius: 99,
                display: "inline-block",
                border: "2px solid rgba(0,0,0,0.1)",
                borderTopColor: "var(--danger)",
              }}
            />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
    ),
  },
];

/**
 * MESSAGE HISTORY TABLE COLUMNS (Customer Details)
 */
export const getMessageHistoryColumns = () => [
    { header: "Time", accessor: (msg: any) => timeAgo(msg.created_at), cellStyle: { color: "var(--text-dim)", fontSize: 12 } },
    {
        header: "Channel",
        accessor: (msg: any) => (
            <span className={`badge ${msg.channel === "whatsapp" ? "badge-success" : "badge-info"}`} style={{ fontSize: 10 }}>
                {msg.channel}
            </span>
        )
    },
    { header: "Recipient", accessor: (msg: any) => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{msg.recipient}</span> },
    {
        header: "Status",
        accessor: (msg: any) => (
            <>
                {msg.status === "sent" && <span style={{ color: "var(--success)", fontSize: 12 }}>Sent</span>}
                {msg.status === "failed" && <span style={{ color: "var(--danger)", fontSize: 12 }}>Failed</span>}
                {msg.status === "queued" && <span style={{ color: "var(--warning)", fontSize: 12 }}>Queued</span>}
            </>
        )
    }
];
