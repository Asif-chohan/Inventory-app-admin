"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { mockCustomers, mockMessages, mockDailyMessages, mockNotifTypes, mockUsageData } from "@/lib/mockData";
import {
    MessageSquare, CheckCircle, XCircle, Clock,
    TrendingUp, Download
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";

// Aggregate totals from usage API (GET /api/admin/customers/:id/usage)
const totalWA = Object.values(mockUsageData).reduce((s, u) => s + (u.byChannel.whatsapp ?? 0), 0);
const totalSMS = Object.values(mockUsageData).reduce((s, u) => s + (u.byChannel.sms ?? 0), 0);
const totalAll = totalWA + totalSMS;
const totalFailed = mockMessages.filter((m) => m.status === "failed").length;

// Top customers: join customer list + usage API data
const topCustomers = mockCustomers
    .map((c) => {
        const u = mockUsageData[c.id];
        return { name: c.name, messages: u?.used ?? 0, plan: c.plan_name };
    })
    .sort((a, b) => b.messages - a.messages);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.75rem", fontSize: 12 }}>
                <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
                {payload.map((p: any) => (
                    <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
                ))}
            </div>
        );
    }
    return null;
};

const RANGES = ["Last 7 days", "Last 30 days", "This month", "Last month"];

function pctColor(pct: number) {
    if (pct >= 91) return "var(--danger)";
    if (pct >= 71) return "var(--warning)";
    return "var(--success)";
}

export default function UsagePage() {
    const [range, setRange] = useState("Last 30 days");

    return (
        <div>
            <Header
                title="Usage & Analytics"
                subtitle="System-wide message consumption and trends"
                actions={
                    <button className="btn btn-secondary btn-sm">
                        <Download size={13} /> Export CSV
                    </button>
                }
            />

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* Date range */}
                <div className="tabs" style={{ alignSelf: "flex-start" }}>
                    {RANGES.map((r) => (
                        <button key={r} className={`tab ${range === r ? "active" : ""}`} onClick={() => setRange(r)}>
                            {r}
                        </button>
                    ))}
                </div>

                {/* Top Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                    {[
                        { label: "Total Messages", value: totalAll.toLocaleString(), icon: MessageSquare, color: "#25D366", bg: "rgba(37,211,102,0.1)" },
                        { label: "WhatsApp", value: totalWA.toLocaleString(), icon: CheckCircle, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                        { label: "SMS", value: totalSMS.toLocaleString(), icon: TrendingUp, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
                        { label: "Failed", value: totalFailed.toLocaleString(), icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
                    ].map((s) => (
                        <div key={s.label} className="stat-card">
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>{s.label}</div>
                                    <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{s.value}</div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>This month</div>
                                </div>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <s.icon size={18} color={s.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                    {/* Line Chart */}
                    <div className="card">
                        <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Messages Per Day</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{range} — WhatsApp & SMS</div>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={mockDailyMessages}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-dim)" }} tickFormatter={(d) => d.slice(5)} interval={4} />
                                <YAxis tick={{ fontSize: 10, fill: "var(--text-dim)" }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="whatsapp" stroke="#25D366" strokeWidth={2.5} dot={false} name="WhatsApp" />
                                <Line type="monotone" dataKey="sms" stroke="#3b82f6" strokeWidth={2} dot={false} name="SMS" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Donut */}
                    <div className="card">
                        <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Message Types</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Notification breakdown</div>
                        </div>
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={mockNotifTypes} cx="50%" cy="50%" innerRadius={48} outerRadius={70} dataKey="value" paddingAngle={2}>
                                    {mockNotifTypes.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip formatter={(v) => [`${v} msgs`]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                            {mockNotifTypes.map((t) => (
                                <div key={t.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)" }}>
                                        <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color, display: "inline-block" }} />{t.name}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>{t.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="card">
                    <div style={{ marginBottom: "1rem" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Top Customers by Usage</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Messages sent this month — click a bar to view customer detail</div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={topCustomers}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                            <YAxis tick={{ fontSize: 10, fill: "var(--text-dim)" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="messages" fill="#25D366" radius={[4, 4, 0, 0]} name="Messages" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Usage Table */}
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Per-Customer Usage</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Customers near their limit are highlighted</div>
                        </div>
                        <button className="btn btn-secondary btn-sm"><Download size={12} /> Export</button>
                    </div>
                    <div className="table-container" style={{ border: "none" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Plan</th>
                                    <th>Used</th>
                                    <th>Limit</th>
                                    <th>Remaining</th>
                                    <th>%</th>
                                    <th>WhatsApp</th>
                                    <th>SMS</th>
                                    <th>Usage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockCustomers.map((c) => {
                                    // Usage from GET /api/admin/customers/:id/usage?month=YYYY-MM
                                    const u = mockUsageData[c.id];
                                    const used = u?.used ?? 0;
                                    const limit = u?.limit ?? c.monthly_limit;
                                    const pct = limit === -1 ? 0 : Math.min(Math.round((used / limit) * 100), 100);
                                    const remaining = limit === -1 ? "∞" : (limit - used).toLocaleString();
                                    const cls = pct >= 91 ? "progress-red" : pct >= 71 ? "progress-yellow" : "progress-green";
                                    const rowBg = pct >= 91 ? "rgba(239,68,68,0.05)" : pct >= 71 ? "rgba(245,158,11,0.05)" : "";
                                    return (
                                        <tr key={c.id} style={{ background: rowBg }}>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.email}</div>
                                            </td>
                                            <td style={{ fontSize: 12 }}>{c.plan_name}</td>
                                            <td style={{ fontWeight: 600 }}>{used.toLocaleString()}</td>
                                            <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                                                {limit === -1 ? "∞" : limit.toLocaleString()}
                                            </td>
                                            <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{remaining}</td>
                                            <td>
                                                <span style={{ fontWeight: 700, fontSize: 13, color: pctColor(pct) }}>
                                                    {pct}%
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 12 }}>{(u?.byChannel.whatsapp ?? 0).toLocaleString()}</td>
                                            <td style={{ fontSize: 12 }}>{(u?.byChannel.sms ?? 0).toLocaleString()}</td>
                                            <td style={{ minWidth: 100 }}>
                                                <div className="progress-bar">
                                                    <div className={`progress-fill ${cls}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
