"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Inbox,
    Users,
    CreditCard,
    BarChart3,
    Settings,
    MessageCircle,
    LogOut,
    ChevronRight,
} from "lucide-react";

const NAV = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Requests", href: "/requests", icon: Inbox, badge: 2 },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "Plans", href: "/plans", icon: CreditCard },
    { label: "Usage", href: "/usage", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            style={{
                width: 240,
                flexShrink: 0,
                background: "var(--bg-sidebar)",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                position: "sticky",
                top: 0,
            }}
        >
            {/* Logo */}
            <div
                style={{
                    padding: "1.2rem 1rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #25D366, #128C7E)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 4px 12px rgba(37,211,102,0.3)",
                    }}
                >
                    <MessageCircle size={20} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", lineHeight: 1.2 }}>
                        WA Admin
                    </div>
                    <div style={{ fontSize: 10, color: "var(--brand-primary)", fontWeight: 600, letterSpacing: "0.05em" }}>
                        PANEL
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
                <div className="section-label" style={{ marginBottom: "0.5rem" }}>Main Menu</div>
                {NAV.map(({ label, href, icon: Icon, badge }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`nav-item ${isActive ? "active" : ""}`}
                            style={{ marginBottom: 2 }}
                        >
                            <Icon size={16} strokeWidth={2} />
                            <span style={{ flex: 1 }}>{label}</span>
                            {badge && (
                                <span
                                    style={{
                                        background: "var(--danger)",
                                        color: "#fff",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "0.1rem 0.45rem",
                                        borderRadius: 99,
                                    }}
                                >
                                    {badge}
                                </span>
                            )}
                            {isActive && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div
                style={{
                    borderTop: "1px solid var(--border)",
                    padding: "0.75rem 0.5rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "var(--radius-sm)",
                        marginBottom: "0.25rem",
                    }}
                >
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--brand-primary), var(--brand-dark))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#0f172a",
                            flexShrink: 0,
                        }}
                    >
                        A
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            Admin User
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            admin@inventory.pk
                        </div>
                    </div>
                </div>
                <Link href="/login" className="nav-item" style={{ color: "var(--danger)" }}>
                    <LogOut size={14} />
                    <span>Sign Out</span>
                </Link>
            </div>
        </aside>
    );
}
