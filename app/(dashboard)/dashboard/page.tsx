"use client";

import Header from "@/components/layout/Header";
import { mockCustomers, mockRequests, mockMessages, mockDailyMessages, mockNotifTypes, mockUsageData } from "@/lib/mockData";
import {
    Users, Inbox, MessageSquare, TrendingUp,
    CheckCircle, XCircle, Eye, Clock
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend,
} from "recharts";

const activeCustomers = mockCustomers.filter((c) => c.status === "active");
const pendingRequests = mockRequests.filter((r) => r.status === "pending");
// Total messages from usage API (GET /api/admin/customers/:id/usage)
const totalMessages = Object.values(mockUsageData).reduce((sum, u) => sum + u.used, 0);

const statCards = [
    {
        label: "Pending Requests",
        value: pendingRequests.length,
        icon: Inbox,
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
        desc: "Awaiting review",
    },
    {
        label: "Active Customers",
        value: activeCustomers.length,
        icon: CheckCircle,
        color: "#22c55e",
        bg: "rgba(34,197,94,0.1)",
        desc: "Licensed & active",
    },
    {
        label: "Messages This Month",
        value: totalMessages.toLocaleString(),
        icon: MessageSquare,
        color: "#25D366",
        bg: "rgba(37,211,102,0.1)",
        desc: "Across all channels",
    },
    {
        label: "Total Customers",
        value: mockCustomers.length,
        icon: Users,
        color: "#3b82f6",
        bg: "rgba(59,130,246,0.1)",
        desc: "All subscribers",
    },
];

// Top customers by usage: derived from usage API data
const topCustomers = mockCustomers
    .map((c) => ({ name: c.name, messages: mockUsageData[c.id]?.used ?? 0 }))
    .sort((a, b) => b.messages - a.messages)
    .slice(0, 5);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 0.75rem",
                fontSize: 12,
            }}>
                <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
                {payload.map((p: any) => (
                    <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
                        {p.name}: {p.value}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
    return (
        <div>
            <Header
                title="Dashboard"
                subtitle="Welcome back — here's what's happening today"
            />

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                    {statCards.map((card) => (
                        <div key={card.label} className="stat-card animate-fade-in">
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                                        {card.label}
                                    </div>
                                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                                        {card.value}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: "0.35rem" }}>
                                        {card.desc}
                                    </div>
                                </div>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: card.bg,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <card.icon size={20} color={card.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                    {/* Line Chart */}
                    <div className="card">
                        <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>Messages Per Day</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Last 30 days activity</div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem", fontSize: 11 }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#25D366" }}>
                                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#25D366", display: "inline-block" }} />
                                    WhatsApp
                                </span>
                                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#3b82f6" }}>
                                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
                                    SMS
                                </span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={mockDailyMessages}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: "var(--text-dim)" }}
                                    tickFormatter={(d) => d.slice(5)}
                                    interval={4}
                                />
                                <YAxis tick={{ fontSize: 10, fill: "var(--text-dim)" }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="whatsapp" stroke="#25D366" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="sms" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Donut Chart */}
                    <div className="card">
                        <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Notification Types</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Distribution this month</div>
                        </div>
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={mockNotifTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={2}>
                                    {mockNotifTypes.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val) => [`${val} msgs`, ""]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                            {mockNotifTypes.map((t) => (
                                <div key={t.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color, display: "inline-block", flexShrink: 0 }} />
                                        <span style={{ color: "var(--text-muted)" }}>{t.name}</span>
                                    </span>
                                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bar Chart + Recent Requests */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {/* Top Customers Bar */}
                    <div className="card">
                        <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Top Customers by Usage</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Messages sent this month</div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={topCustomers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-dim)" }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={90} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="messages" fill="#25D366" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Recent Requests */}
                    <div className="card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Requests</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Pending license applications</div>
                            </div>
                            <a href="/requests" style={{ fontSize: 12, color: "var(--brand-primary)", textDecoration: "none", fontWeight: 500 }}>
                                View all →
                            </a>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                            {pendingRequests.slice(0, 4).map((req) => (
                                <div
                                    key={req.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                        padding: "0.6rem 0.75rem",
                                        background: "var(--bg-primary)",
                                        borderRadius: "var(--radius-sm)",
                                        border: "1px solid var(--border)",
                                    }}
                                >
                                    <div style={{
                                        width: 32, height: 32, borderRadius: "50%",
                                        background: "rgba(245,158,11,0.15)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                        fontSize: 13, fontWeight: 700, color: "#fbbf24",
                                    }}>
                                        {req.customerName[0]}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {req.customerName}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{req.email}</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-dim)", whiteSpace: "nowrap" }}>
                                        <Clock size={10} />
                                        {timeAgo(req.createdAt)}
                                    </div>
                                </div>
                            ))}
                            {pendingRequests.length === 0 && (
                                <div className="empty-state" style={{ padding: "1.5rem" }}>
                                    <CheckCircle size={32} style={{ margin: "0 auto 0.5rem", color: "var(--success)", display: "block" }} />
                                    <div>All clear! No pending requests.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Messages */}
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Messages</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Last 10 messages across all customers</div>
                        </div>
                        <a href="/usage" style={{ fontSize: 12, color: "var(--brand-primary)", textDecoration: "none", fontWeight: 500 }}>
                            View analytics →
                        </a>
                    </div>
                    <div className="table-container" style={{ border: "none" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Type</th>
                                    <th>Channel</th>
                                    <th>Recipient</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockMessages.map((msg) => (
                                    <tr key={msg.id}>
                                        <td style={{ fontWeight: 500 }}>{msg.customerName}</td>
                                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                                            {msg.type.replace(/_/g, " ")}
                                        </td>
                                        <td>
                                            <span className={`badge ${msg.channel === "whatsapp" ? "badge-success" : "badge-info"}`}>
                                                {msg.channel}
                                            </span>
                                        </td>
                                        <td style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>
                                            {msg.recipient}
                                        </td>
                                        <td>
                                            {msg.status === "sent" && (
                                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--success)" }}>
                                                    <CheckCircle size={12} /> Sent
                                                </span>
                                            )}
                                            {msg.status === "failed" && (
                                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--danger)" }}>
                                                    <XCircle size={12} /> Failed
                                                </span>
                                            )}
                                            {msg.status === "queued" && (
                                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--warning)" }}>
                                                    <Clock size={12} /> Queued
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ color: "var(--text-dim)", fontSize: 12 }}>{timeAgo(msg.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
