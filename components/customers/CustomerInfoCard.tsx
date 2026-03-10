"use client";

import { Customer } from "@/lib/types";
import { Mail, Phone, Calendar, Shield, Edit, Trash2, PauseCircle } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

interface CustomerInfoCardProps {
    customer: Customer;
    onEdit: () => void;
    onDelete?: () => void;
    onStatusUpdate: (newStatus: string) => void;
}

export default function CustomerInfoCard({ customer, onEdit, onDelete, onStatusUpdate }: CustomerInfoCardProps) {

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            {/* Section 1 - Customer Info */}
            <div className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--brand-primary), var(--brand-dark))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, fontWeight: 800, color: "#0f172a",
                        }}>
                            {customer.name[0]}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{customer.name}</div>
                            <div><StatusBadge status={customer.status} /></div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={onEdit}
                        >
                            <Edit size={12} /> Edit
                        </button>
                        {/* <button
                            className="btn btn-danger btn-sm"
                            onClick={onDelete}
                        >
                            <Trash2 size={12} /> Delete
                        </button> */}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {[
                        { icon: Mail, val: customer.email },
                        { icon: Phone, val: customer.phone },
                        { icon: Calendar, val: `Joined: ${new Date(customer.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` },
                    ].map(({ icon: Icon, val }) => (
                        <div key={val} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: 13 }}>
                            <Icon size={14} color="var(--text-dim)" />
                            <span style={{ color: "var(--text-muted)" }}>{val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 2 - Plan */}
            <div className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                        <Shield size={16} color="var(--brand-primary)" /> Subscription & Plan
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: 13, marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-dim)" }}>Plan</span>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{customer.plan_name}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-dim)" }}>Monthly Limit</span>
                        <span style={{ fontWeight: 600 }}>{customer.monthly_limit === -1 ? "Unlimited" : `${customer.monthly_limit.toLocaleString()} messages`}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-dim)" }}>Channels</span>
                        <div style={{ display: "flex", gap: 4 }}>
                            {customer.channels.includes("whatsapp") && <span className="badge badge-success" style={{ fontSize: 10 }}>WhatsApp</span>}
                            {customer.channels.includes("sms") ? <span className="badge badge-info" style={{ fontSize: 10 }}>SMS</span> : <span className="badge badge-muted" style={{ fontSize: 10 }}>SMS ✗</span>}
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-dim)" }}>Status</span>
                        <StatusBadge status={customer.status} />
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onStatusUpdate(customer.status === "active" ? "paused" : "active")}>
                        <PauseCircle size={12} /> {customer.status === "active" ? "Suspend" : "Activate"}
                    </button>
                    <button className="btn btn-primary btn-sm" disabled><Edit size={12} /> Change Plan</button>
                </div>
            </div>
        </div>
    );
}
