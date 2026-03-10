"use client";

import Header from "@/components/layout/Header";
import { User, Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div>
            <Header title="Settings" subtitle="Manage your admin profile settings" />

            <div style={{ padding: "1.5rem", display: "flex", justifyContent: "center" }}>
                <div style={{ flex: 1, maxWidth: 640 }}>
                    {/* Profile */}
                    <div className="card">
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                            <User size={16} color="var(--brand-primary)" /> Admin Profile
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: "50%",
                                background: "linear-gradient(135deg, var(--brand-primary), var(--brand-dark))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 26, fontWeight: 800, color: "#0f172a",
                            }}>A</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>Admin User</div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>admin@inventory.pk</div>
                                <span className="badge badge-success" style={{ fontSize: 10, marginTop: 4 }}>Super Admin</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            <div>
                                <label className="form-label">Display Name</label>
                                <input className="input" defaultValue="Admin User" />
                            </div>
                            <div>
                                <label className="form-label">Email</label>
                                <input className="input" defaultValue="admin@inventory.pk" type="email" />
                            </div>
                            <hr className="divider" />
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-muted)" }}>Change Password</div>
                            <div>
                                <label className="form-label">Current Password</label>
                                <input className="input" type="password" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="form-label">New Password</label>
                                <input className="input" type="password" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="form-label">Confirm New Password</label>
                                <input className="input" type="password" placeholder="••••••••" />
                            </div>
                            <button className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                                <Save size={13} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
