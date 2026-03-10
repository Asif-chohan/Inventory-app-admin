"use client";

import { MessageSquare, RefreshCw } from "lucide-react";
import Table from "@/components/ui/Table";

interface MessageHistoryCardProps {
    messages: any[];
    messagesLoading: boolean;
    msgFilter: string;
    onFilterChange: (filter: string) => void;
}

import { getMessageHistoryColumns } from "@/constants/tableColumns";

export default function MessageHistoryCard({ messages, messagesLoading, msgFilter, onFilterChange }: MessageHistoryCardProps) {
    const columns = getMessageHistoryColumns();

    return (
        <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <MessageSquare size={16} color="var(--brand-primary)" /> Recent Dispatch Logs
                    {messagesLoading && <RefreshCw size={12} className="animate-spin" style={{ color: "var(--text-dim)" }} />}
                </div>
                <div className="tabs">
                    {["all", "whatsapp", "sms"].map((f) => (
                        <button key={f} className={`tab ${msgFilter === f ? "active" : ""}`} onClick={() => onFilterChange(f)}>
                            {f === "all" ? "All" : f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            <Table
                columns={columns as any}
                data={messages}
                isLoading={messagesLoading}
                emptyMessage="No recent messages found"
                tableStyle={{ border: "none" }}
            />
        </div>
    );
}
