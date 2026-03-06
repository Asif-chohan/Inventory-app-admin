"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
    return (
        <header
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.9rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(12px)",
                position: "sticky",
                top: 0,
                zIndex: 20,
            }}
        >
            <div>
                <h1 className="page-title" style={{ fontSize: "1.15rem" }}>{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {/* Search */}
                <div className="input-group" style={{ width: 220 }}>
                    <Search size={14} className="input-icon" />
                    <input
                        className="input input-with-icon"
                        placeholder="Quick search..."
                        style={{ height: 34, fontSize: 12 }}
                    />
                </div>

                {/* Notifications */}
                <button className="btn-icon" style={{ position: "relative" }}>
                    <Bell size={16} />
                    <span
                        style={{
                            position: "absolute",
                            top: 2, right: 2,
                            width: 7, height: 7,
                            background: "var(--danger)",
                            borderRadius: "50%",
                            border: "1.5px solid var(--bg-primary)",
                        }}
                    />
                </button>

                {actions}
            </div>
        </header>
    );
}
