"use client";

import { useState, use, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import AddCustomerModal from "@/components/ui/AddCustomerModal";
import { mockMessages, mockUsageData } from "@/lib/mockData";
import {
    Mail, Phone, Calendar,
    Shield, MessageSquare, Key, CheckCircle, XCircle,
    Bell, Settings, Copy, RefreshCw,
    ChevronLeft, Clock, Edit, PauseCircle, Trash2, AlertCircle
} from "lucide-react";
import KeyGenerationModal from "@/components/ui/KeyGenerationModal";
import ManageProvidersModal, { ProvidersData } from "@/components/ui/ManageProvidersModal";

function ProgressBar({ used, limit, label }: { used: number; limit: number; label: string }) {
    const pct = limit === -1 ? 0 : Math.min(Math.round((used / limit) * 100), 100);
    const cls = pct >= 91 ? "progress-red" : pct >= 71 ? "progress-yellow" : "progress-green";
    return (
        <div style={{ marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", fontSize: 12 }}>
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span style={{ color: pct >= 91 ? "var(--danger)" : pct >= 71 ? "var(--warning)" : "var(--success)", fontWeight: 600 }}>
                    {used.toLocaleString()} / {limit === -1 ? "∞" : limit.toLocaleString()} ({pct}%)
                </span>
            </div>
            <div className="progress-bar">
                <div className={`progress-fill ${cls}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

// Matches api_keys table: id, name, key_prefix, revoked, last_used_at, created_at


const mockNotifs = [
    { label: "Daily Sales Summary", enabled: true, detail: "9:00 PM daily" },
    { label: "Weekly Sales Summary", enabled: false, detail: "" },
    { label: "Refund / Void Alerts", enabled: true, detail: "Instant" },
    { label: "High-Value Sale Alerts", enabled: true, detail: "Threshold: PKR 10,000" },
    { label: "Discount Alerts", enabled: false, detail: "" },
];

type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    plan_name: string;
    monthly_limit: number;
    channels: string[];
    created_at: string;
};

type UsageData = {
    month: string;
    limit: number;
    used: number;
    byChannel: Record<string, number>;
    byStatus: {
        queued: number;
        sent: number;
        failed: number;
    };
};

type LicenseKey = {
    id: string;
    keyId?: string;
    name: string;
    key_prefix?: string;
    keyPrefix?: string;
    revoked: boolean;
    last_used_at: string | null;
    created_at: string;
};

type Message = {
    id: string;
    customer_id: string;
    channel: string;
    recipient: string;
    payload: any;
    status: string;
    error_message?: string;
    created_at: string;
};

type MessagesResponse = {
    items: Message[];
    page: number;
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
};

export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = use(params);
    const router = useRouter();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [msgFilter, setMsgFilter] = useState("all");
    const [showToken, setShowToken] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
    const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false);

    // Keys state
    const [keys, setKeys] = useState<LicenseKey[]>([]);
    const [keysLoading, setKeysLoading] = useState(false);

    // Providers state
    const [providers, setProviders] = useState<ProvidersData | null>(null);
    const [providersLoading, setProvidersLoading] = useState(false);

    // Usage state
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [usageLoading, setUsageLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    // Messages historical state
    const [messagesData, setMessagesData] = useState<MessagesResponse | null>(null);
    const [messagesLoading, setMessagesLoading] = useState(false);

    const fetchCustomer = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${apiBase}/admin/customers/${customerId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                }
            });
            const result = await response.json();
            if (result.success) {
                setCustomer(result.data);
            } else {
                setError(result.message || "Customer not found");
            }
        } catch (err) {
            setError("Could not connect to the server.");
            console.error("Customer Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [customerId, apiBase]);

    const fetchUsage = useCallback(async () => {
        if (!customerId) return;
        setUsageLoading(true);
        try {
            const response = await fetch(`${apiBase}/admin/customers/${customerId}/usage?month=${selectedMonth}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                }
            });
            const result = await response.json();
            if (result.success) {
                setUsage(result.data);
            }
        } catch (err) {
            console.error("Usage Fetch Error:", err);
        } finally {
            setUsageLoading(false);
        }
    }, [customerId, selectedMonth, apiBase]);

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    const fetchKeys = useCallback(async () => {
        if (!customerId) return;
        setKeysLoading(true);
        try {
            const response = await fetch(`${apiBase}/admin/customers/${customerId}/keys`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                }
            });
            const result = await response.json();
            console.log("Keys API Result for customer", customerId, ":", result);
            if (result.success) {
                setKeys(result.data);
            }
        } catch (err) {
            console.error("Keys Fetch Error:", err);
        } finally {
            setKeysLoading(false);
        }
    }, [customerId, apiBase]);

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    const fetchProviders = useCallback(async () => {
        if (!customerId) return;
        setProvidersLoading(true);
        try {
            const response = await fetch(`${apiBase}/admin/customers/${customerId}/providers`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                }
            });
            const result = await response.json();
            if (result.success) {
                setProviders(result.data);
            }
        } catch (err) {
            console.error("Providers Fetch Error:", err);
        } finally {
            setProvidersLoading(false);
        }
    }, [customerId, apiBase]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const fetchMessages = useCallback(async () => {
        if (!customerId) return;
        setMessagesLoading(true);
        try {
            let url = `${apiBase}/admin/customers/${customerId}/messages?page=1&limit=5`;
            if (msgFilter !== "all") {
                url += `&channel=${msgFilter}`;
            }
            const response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                }
            });
            const result = await response.json();
            if (result.success) {
                setMessagesData(result.data);
            }
        } catch (err) {
            console.error("Messages Fetch Error:", err);
        } finally {
            setMessagesLoading(false);
        }
    }, [customerId, apiBase, msgFilter]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleMonthChange = (direction: 'prev' | 'next') => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1);
        if (direction === 'prev') {
            date.setMonth(date.getMonth() - 1);
        } else {
            date.setMonth(date.getMonth() + 1);
        }
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!customer) return;
        setUpdating(true);
        try {
            const response = await fetch(`${apiBase}/admin/customers/${customerId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const result = await response.json();
            if (result.success) {
                setCustomer(result.data);
            }
        } catch (err) {
            console.error("Update Error:", err);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;
        try {
            const response = await fetch(`${apiBase}/admin/customers/${customerId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                }
            });
            const result = await response.json();
            if (result.success) {
                router.push("/customers");
            }
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    const handleRevokeKey = async (keyId: string) => {
        if (!keyId) {
            console.error("No keyId provided to revoke");
            return;
        }
        if (!confirm("Are you sure you want to revoke this key? This action cannot be undone and will immediately stop any application using this key.")) return;
        try {
            const response = await fetch(`${apiBase}/admin/keys/${keyId}/revoke`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                }
            });
            const result = await response.json();
            if (result.success) {
                fetchKeys();
            }
        } catch (err) {
            console.error("Revoke Error:", err);
        }
    };

    const statusIcon = (status: string) => {
        if (status === "active") return <span className="badge badge-success"><CheckCircle size={9} /> Active</span>;
        if (status === "inactive") return <span className="badge badge-danger"><XCircle size={9} /> Inactive</span>;
        return <span className="badge badge-warning"><PauseCircle size={9} /> Paused</span>;
    };

    if (loading) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
                <RefreshCw size={32} className="animate-spin" style={{ color: "var(--brand-primary)" }} />
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", background: "var(--bg-primary)", minHeight: "100vh" }}>
                <AlertCircle size={48} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Customer Not Found</h2>
                <p style={{ color: "var(--text-dim)", marginBottom: "1.5rem" }}>{error || "The customer you are looking for does not exist."}</p>
                <Link href="/customers" className="btn btn-primary">
                    <ChevronLeft size={16} /> Back to Customers
                </Link>
            </div>
        );
    }

    return (
        <div>
            <AddCustomerModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={(updated) => {
                    setCustomer(updated);
                    setIsEditModalOpen(false);
                }}
                customerToEdit={customer}
            />

            <KeyGenerationModal
                isOpen={isKeyModalOpen}
                onClose={() => {
                    setIsKeyModalOpen(false);
                    fetchKeys();
                }}
                customerId={customerId}
                customerName={customer.name}
            />

            <ManageProvidersModal
                isOpen={isProvidersModalOpen}
                onClose={() => setIsProvidersModalOpen(false)}
                customerId={customerId}
                customerName={customer.name}
                initialData={providers || undefined}
                onSuccess={() => fetchProviders()}
                allowedChannels={customer.channels}
            />

            <Header
                title={customer.name}
                subtitle={customer.email}
                actions={
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link href="/customers" className="btn btn-secondary btn-sm">
                            <ChevronLeft size={13} /> Back
                        </Link>
                    </div>
                }
            />

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                {/* Row 1: Basic Information & Plan */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                                    <div>{statusIcon(customer.status)}</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <Edit size={12} /> Edit
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={handleDelete}
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
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
                                {statusIcon(customer.status)}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleUpdateStatus(customer.status === "active" ? "paused" : "active")}>
                                <PauseCircle size={12} /> {customer.status === "active" ? "Suspend" : "Activate"}
                            </button>
                            <button className="btn btn-primary btn-sm" disabled><Edit size={12} /> Change Plan</button>
                        </div>
                    </div>
                </div>

                {/* Row 2: Usage Statistics */}
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                            <MessageSquare size={18} color="var(--brand-primary)" /> Current Month Usage — {usage?.month || selectedMonth}
                            {usageLoading && <RefreshCw size={12} className="animate-spin" style={{ color: "var(--text-dim)" }} />}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleMonthChange('prev')}>← Previous</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleMonthChange('next')}>Next →</button>
                        </div>
                    </div>

                    {usage ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                            <div>
                                <ProgressBar used={usage.used} limit={usage.limit} label="Overall Progress" />
                                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: 12 }}>
                                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(34, 197, 94, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(34, 197, 94, 0.1)" }}>
                                        <div style={{ color: "var(--text-dim)", marginBottom: 4 }}>Sent</div>
                                        <div style={{ color: "var(--success)", fontWeight: 700, fontSize: 16 }}>{usage.byStatus.sent}</div>
                                    </div>
                                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(245, 158, 11, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
                                        <div style={{ color: "var(--text-dim)", marginBottom: 4 }}>Queued</div>
                                        <div style={{ color: "var(--warning)", fontWeight: 700, fontSize: 16 }}>{usage.byStatus.queued}</div>
                                    </div>
                                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(239, 68, 68, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(239, 68, 68, 0.1)" }}>
                                        <div style={{ color: "var(--text-dim)", marginBottom: 4 }}>Failed</div>
                                        <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: 16 }}>{usage.byStatus.failed}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {customer.channels.includes("whatsapp") && (
                                    <ProgressBar used={usage.byChannel.whatsapp || 0} limit={usage.limit} label="WhatsApp Consumption" />
                                )}
                                {customer.channels.includes("sms") && (
                                    <ProgressBar used={usage.byChannel.sms || 0} limit={usage.limit} label="SMS Consumption" />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-dim)", fontSize: 13, background: "var(--bg-primary)", borderRadius: "var(--radius-md)" }}>
                            {usageLoading ? "Synchronizing usage data..." : "No usage activity recorded for this period."}
                        </div>
                    )}
                </div>

                {/* Row 3: Configuration & Access */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {/* Section 6 - Provider Credentials */}
                    <div className="card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                <Settings size={16} color="var(--brand-primary)" /> API Provider Credentials
                                {providersLoading && <RefreshCw size={12} className="animate-spin" style={{ color: "var(--text-dim)" }} />}
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setIsProvidersModalOpen(true)}
                            >
                                <Edit size={12} /> Configure
                            </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: 13 }}>
                            {/* Filtered display based on allowed channels */}
                            {customer.channels.includes("whatsapp") && (
                                <>
                                    {providers?.whatsapp ? (
                                        <div style={{ padding: "0.6rem 0.75rem", background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.15)", borderRadius: "var(--radius-sm)" }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>WhatsApp Configuration</div>
                                            {[
                                                { label: "Phone ID", val: providers.whatsapp.metaPhoneNumberId },
                                                { label: "Token", val: providers.whatsapp.metaAccessToken }
                                            ].map(({ label, val }) => (
                                                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                                    <span style={{ color: "var(--text-dim)", fontSize: 11 }}>{label}</span>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                        <span className="key-mask" style={{ fontSize: 11 }}>{val && val !== "masked" ? (val.substring(0, 8)) : val}••••</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ padding: "0.75rem", textAlign: "center", color: "var(--text-dim)", fontSize: 11, background: "rgba(37,211,102,0.03)", border: "1px dashed rgba(37,211,102,0.2)", borderRadius: "var(--radius-sm)" }}>
                                            WhatsApp settings pending
                                        </div>
                                    )}
                                </>
                            )}

                            {customer.channels.includes("sms") && (
                                <>
                                    {providers?.sms ? (
                                        <div style={{ padding: "0.6rem 0.75rem", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "var(--radius-sm)" }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>SMS Configuration ({providers.sms.provider})</div>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <span style={{ color: "var(--text-dim)", fontSize: 11 }}>Account SID</span>
                                                <span className="key-mask" style={{ fontSize: 11 }}>{providers.sms.accountSid?.substring(0, 8)}••••</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: "0.75rem", textAlign: "center", color: "var(--text-dim)", fontSize: 11, background: "rgba(59,130,246,0.03)", border: "1px dashed rgba(59,130,246,0.2)", borderRadius: "var(--radius-sm)" }}>
                                            SMS settings pending
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Section 3 - License Keys */}
                    <div className="card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                <Key size={16} color="var(--brand-primary)" /> Active License Keys
                                {keysLoading && <RefreshCw size={12} className="animate-spin" style={{ color: "var(--text-dim)" }} />}
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setIsKeyModalOpen(true)}
                                disabled={customer.channels.length > 0 && !providers?.whatsapp && !providers?.sms}
                                title={(!providers?.whatsapp && !providers?.sms) ? "Setup providers first" : ""}
                            >
                                <Key size={12} /> Generate Key
                            </button>
                        </div>
                        <div className="table-container" style={{ borderRadius: "var(--radius-sm)", maxHeight: 150, overflowY: "auto" }}>
                            <table style={{ opacity: keysLoading ? 0.6 : 1 }}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Key Prefix</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keys.map((key, idx) => (
                                        <tr key={key.keyId || key.id || `license-key-${idx}`}>
                                            <td style={{ fontSize: 12 }}>{key.name || "Unnamed"}</td>
                                            <td>
                                                <span className="key-mask" style={{ fontSize: 11 }}>{(key.key_prefix || key.keyPrefix)}••••</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${!key.revoked ? "badge-success" : "badge-muted"}`} style={{ fontSize: 10 }}>
                                                    {key.revoked ? "Revoked" : "Active"}
                                                </span>
                                            </td>
                                            <td>
                                                {!key.revoked && (
                                                    <button className="btn-icon" style={{ color: "var(--danger)" }} onClick={() => handleRevokeKey(key.keyId || key.id)}>
                                                        <XCircle size={12} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {keys.length === 0 && !keysLoading && (
                                        <tr key="empty-keys">
                                            <td colSpan={4} style={{ textAlign: "center", padding: "1rem", color: "var(--text-dim)", fontSize: 11 }}>
                                                No keys issued yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Additional Stats & History */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                    {/* Section 5 - Notification Preferences */}
                    {/* <div className="card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                <Bell size={16} color="var(--brand-primary)" /> Alert Sync Status
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {mockNotifs.map((n) => (
                                <div key={n.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.4rem 0.6rem", borderRadius: "var(--radius-sm)", background: "var(--bg-primary)", fontSize: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                        <span>{n.enabled ? "✅" : "❌"}</span>
                                        <span style={{ fontWeight: 500 }}>{n.label}</span>
                                    </div>
                                    <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{n.detail}</span>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    {/* Section 7 - Message History */}
                    <div className="card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                <MessageSquare size={16} color="var(--brand-primary)" /> Recent Dispatch Logs
                                {messagesLoading && <RefreshCw size={12} className="animate-spin" style={{ color: "var(--text-dim)" }} />}
                            </div>
                            <div className="tabs">
                                {["all", "whatsapp", "sms"].map((f) => (
                                    <button key={f} className={`tab ${msgFilter === f ? "active" : ""}`} onClick={() => setMsgFilter(f)}>
                                        {f === "all" ? "All" : f.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="table-container" style={{ border: "none" }}>
                            <table style={{ fontSize: 12, opacity: messagesLoading ? 0.6 : 1 }}>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Channel</th>
                                        <th>Recipient</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messagesData?.items.map((msg) => (
                                        <tr key={msg.id}>
                                            <td style={{ color: "var(--text-dim)" }}>{timeAgo(msg.created_at)}</td>
                                            <td><span className={`badge ${msg.channel === "whatsapp" ? "badge-success" : "badge-info"}`}>{msg.channel}</span></td>
                                            <td style={{ fontFamily: "monospace" }}>{msg.recipient}</td>
                                            <td>
                                                {msg.status === "sent" && <span style={{ color: "var(--success)" }}>Sent</span>}
                                                {msg.status === "failed" && <span style={{ color: "var(--danger)" }}>Failed</span>}
                                                {msg.status === "queued" && <span style={{ color: "var(--warning)" }}>Queued</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!messagesData || messagesData.items.length === 0) && !messagesLoading && (
                                        <tr key="empty-messages">
                                            <td colSpan={4}>
                                                <div className="empty-state" style={{ padding: "1.5rem", textAlign: 'center', color: 'var(--text-dim)' }}>
                                                    No recent messages found
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
