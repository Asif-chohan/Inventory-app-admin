"use client";

import { UsageData } from "@/lib/types";
import { MessageSquare, RefreshCw } from "lucide-react";

interface UsageStatsCardProps {
    usage?: UsageData;
    usageLoading: boolean;
    selectedMonth: string;
    onMonthChange: (direction: 'prev' | 'next') => void;
    channels: string[];
}

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

export default function UsageStatsCard({ usage, usageLoading, selectedMonth, onMonthChange, channels }: UsageStatsCardProps) {
    return (
        <div className="card" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <MessageSquare size={18} color="var(--brand-primary)" /> Current Month Usage — {usage?.month || selectedMonth}
                    {usageLoading && <RefreshCw size={12} className="animate-spin" style={{ color: "var(--text-dim)" }} />}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onMonthChange('prev')}>← Previous</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onMonthChange('next')}>Next →</button>
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
                        {channels.includes("whatsapp") && (
                            <ProgressBar used={usage.byChannel.whatsapp || 0} limit={usage.limit} label="WhatsApp Consumption" />
                        )}
                        {channels.includes("sms") && (
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
    );
}
