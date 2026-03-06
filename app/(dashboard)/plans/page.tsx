"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { mockPlans } from "@/lib/mockData";
import { Edit, Power, Plus, X, MessageSquare, CheckCircle } from "lucide-react";

const PLAN_COLORS: Record<string, { bg: string; color: string; emoji: string }> = {
    Starter: { bg: "rgba(34,197,94,0.08)", color: "#4ade80", emoji: "🌱" },
    Business: { bg: "rgba(59,130,246,0.08)", color: "#60a5fa", emoji: "💼" },
    Pro: { bg: "rgba(139,92,246,0.08)", color: "#a78bfa", emoji: "🚀" },
    Enterprise: { bg: "rgba(245,158,11,0.08)", color: "#fbbf24", emoji: "🏢" },
};

type Plan = typeof mockPlans[0];

function PlanModal({ plan, onClose }: { plan: Partial<Plan> | null; onClose: () => void }) {
    const [form, setForm] = useState({
        name: plan?.name || "",
        description: plan?.description || "",
        priceMonthly: plan?.priceMonthly || 0,
        priceYearly: plan?.priceYearly || 0,
        monthlyLimit: plan?.monthlyLimit || 500,
        channels: { whatsapp: plan?.channels?.includes("whatsapp") ?? true, sms: plan?.channels?.includes("sms") ?? false },
        isActive: plan?.isActive ?? true,
    });

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{plan?.id ? "Edit Plan" : "Create New Plan"}</div>
                    <button className="btn-icon" onClick={onClose}><X size={16} /></button>
                </div>
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label className="form-label">Plan Name</label>
                        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Business" />
                    </div>
                    <div>
                        <label className="form-label">Description</label>
                        <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div>
                            <label className="form-label">Monthly Price (PKR)</label>
                            <input className="input" type="number" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: +e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label">Yearly Price (PKR)</label>
                            <input className="input" type="number" value={form.priceYearly} onChange={(e) => setForm({ ...form, priceYearly: +e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Messages Per Month (-1 = Unlimited)</label>
                        <input className="input" type="number" value={form.monthlyLimit} onChange={(e) => setForm({ ...form, monthlyLimit: +e.target.value })} />
                    </div>
                    <div>
                        <label className="form-label">Channels</label>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            {(["whatsapp", "sms"] as const).map((ch) => (
                                <label key={ch} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: 13 }}>
                                    <input type="checkbox" className="checkbox" checked={form.channels[ch]} onChange={(e) => setForm({ ...form, channels: { ...form.channels, [ch]: e.target.checked } })} />
                                    <span>{ch.toUpperCase()}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <button
                            className={`toggle ${form.isActive ? "on" : ""}`}
                            onClick={() => setForm({ ...form, isActive: !form.isActive })}
                        />
                        <span style={{ fontSize: 13 }}>Plan is {form.isActive ? "Active" : "Inactive"}</span>
                    </div>
                </div>
                <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={onClose}>
                        <CheckCircle size={13} /> {plan?.id ? "Save Changes" : "Create Plan"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PlansPage() {
    const [plans, setPlans] = useState(mockPlans);
    const [editModal, setEditModal] = useState<Plan | null | "new">(null);

    return (
        <div>
            <Header
                title="Plans Management"
                subtitle="Define and manage subscription tiers for customers"
                actions={
                    <button className="btn btn-primary btn-sm" onClick={() => setEditModal("new")}>
                        <Plus size={13} /> New Plan
                    </button>
                }
            />

            <div style={{ padding: "1.5rem" }}>
                {/* Summary stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    {plans.map((plan) => {
                        const col = PLAN_COLORS[plan.name] || PLAN_COLORS.Starter;
                        return (
                            <div key={plan.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", background: col.bg, border: `1px solid ${col.color}30`, borderRadius: "var(--radius)" }}>
                                <span style={{ fontSize: 20 }}>{col.emoji}</span>
                                <div>
                                    <div style={{ fontSize: 11, color: col.color, fontWeight: 700 }}>{plan.name}</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{plan.activeUsers}</div>
                                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>active users</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Plan Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                    {plans.map((plan) => {
                        const col = PLAN_COLORS[plan.name] || PLAN_COLORS.Starter;
                        return (
                            <div
                                key={plan.id}
                                className="card"
                                style={{
                                    borderTop: `3px solid ${col.color}`,
                                    position: "relative",
                                    overflow: "visible",
                                }}
                            >
                                {!plan.isActive && (
                                    <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem" }}>
                                        <span className="badge badge-muted" style={{ fontSize: 10 }}>Inactive</span>
                                    </div>
                                )}

                                <div style={{ marginBottom: "1rem" }}>
                                    <div style={{ fontSize: 22, marginBottom: "0.3rem" }}>{col.emoji}</div>
                                    <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>{plan.name}</div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{plan.description}</div>
                                </div>

                                <div style={{ marginBottom: "1rem" }}>
                                    <div style={{ fontSize: 26, fontWeight: 800, color: col.color }}>
                                        {plan.priceMonthly === 0 ? "Custom" : `PKR ${plan.priceMonthly.toLocaleString()}`}
                                        {plan.priceMonthly > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-dim)" }}> /mo</span>}
                                    </div>
                                    {plan.priceYearly > 0 && (
                                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                                            PKR {plan.priceYearly.toLocaleString()} /year
                                        </div>
                                    )}
                                </div>

                                <hr className="divider" />

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: 12, marginBottom: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <MessageSquare size={12} color={col.color} />
                                        <span>{plan.monthlyLimit === -1 ? "Unlimited messages" : `${plan.monthlyLimit.toLocaleString()} messages/month`}</span>
                                    </div>
                                    {plan.channels.map((ch) => (
                                        <div key={ch} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <CheckCircle size={12} color={col.color} />
                                            <span>{ch === "whatsapp" ? "WhatsApp" : "SMS"}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                                        <span style={{ color: "var(--text-dim)" }}>{plan.activeUsers} active user{plan.activeUsers !== 1 ? "s" : ""}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setEditModal(plan)}>
                                        <Edit size={12} /> Edit
                                    </button>
                                    <button className="btn btn-secondary btn-sm">
                                        <Power size={12} /> {plan.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {editModal && (
                <PlanModal
                    plan={editModal === "new" ? {} : editModal}
                    onClose={() => setEditModal(null)}
                />
            )}
        </div>
    );
}
