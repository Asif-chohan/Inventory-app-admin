"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import {
    User, Server, Mail, FileText, Webhook, MessageCircle,
    Eye, EyeOff, CheckCircle, RefreshCw, Save, Key,
} from "lucide-react";

const TABS = [
    { id: "profile", label: "Admin Profile", icon: User },
    { id: "backend", label: "Backend Connection", icon: Server },
    { id: "provider", label: "WhatsApp Provider", icon: MessageCircle },
    { id: "email", label: "Email Config", icon: Mail },
    { id: "templates", label: "Email Templates", icon: FileText },
    { id: "webhook", label: "Request Source", icon: Webhook },
];

const APPROVAL_TEMPLATE = `Hello {{customerName}},

Your access request has been approved! 🎉

Your License Key: {{licenseKey}}
Plan: {{planName}} ({{monthlyLimit}} messages/month)
Channels: {{channels}}

How to activate:
1. Open Inventory Manager app
2. Settings → WhatsApp Notifications
3. Enter the key and click "Activate"

Thank you!
{{adminSignature}}`;

const REJECTION_TEMPLATE = `Hello {{customerName}},

We reviewed your request but are unable to approve it at this time.

Reason: {{rejectionReason}}

Contact us at {{supportEmail}} for more info.`;

const RENEWAL_TEMPLATE = `Hello {{customerName}},

Your {{planName}} plan expires on {{expiryDate}}.

To continue uninterrupted service, please contact us.`;

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [showToken, setShowToken] = useState(false);
    const [showSmtp, setShowSmtp] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
    const [emailProvider, setEmailProvider] = useState<"resend" | "smtp">("resend");
    const [approvalTemplate, setApprovalTemplate] = useState(APPROVAL_TEMPLATE);
    const [rejectionTemplate, setRejectionTemplate] = useState(REJECTION_TEMPLATE);
    const [renewalTemplate, setRenewalTemplate] = useState(RENEWAL_TEMPLATE);

    const testConnection = async () => {
        setConnectionStatus("testing");
        await new Promise((r) => setTimeout(r, 1500));
        setConnectionStatus("ok");
    };

    return (
        <div>
            <Header title="Settings" subtitle="Manage admin profile, backend, and email configuration" />

            <div style={{ padding: "1.5rem", display: "flex", gap: "1.25rem" }}>

                {/* Sidebar Tabs */}
                <div style={{ width: 200, flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                className={`nav-item ${activeTab === id ? "active" : ""}`}
                                onClick={() => setActiveTab(id)}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, maxWidth: 640 }}>

                    {/* Profile */}
                    {activeTab === "profile" && (
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
                    )}

                    {/* Backend */}
                    {activeTab === "backend" && (
                        <div className="card">
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                                <Server size={16} color="var(--brand-primary)" /> Backend Connection
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div>
                                    <label className="form-label">Backend API Base URL</label>
                                    <input className="input" defaultValue="https://your-inventory-be.com" placeholder="https://api.example.com" />
                                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                                        Set via <code style={{ background: "var(--bg-hover)", padding: "0 4px", borderRadius: 3 }}>BACKEND_URL</code> environment variable in production.
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Connection Status</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <button className="btn btn-secondary btn-sm" onClick={testConnection} disabled={connectionStatus === "testing"}>
                                            {connectionStatus === "testing" ? (
                                                <><span className="animate-spin" style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "var(--text-primary)", borderRadius: "50%" }} />Testing...</>
                                            ) : (
                                                <><RefreshCw size={12} /> Test Connection</>
                                            )}
                                        </button>
                                        {connectionStatus === "ok" && (
                                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--success)", fontWeight: 600 }}>
                                                <CheckCircle size={14} /> Connected
                                            </span>
                                        )}
                                        {connectionStatus === "error" && (
                                            <span style={{ fontSize: 13, color: "var(--danger)" }}>❌ Connection failed</span>
                                        )}
                                    </div>
                                </div>
                                <button className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                                    <Save size={13} /> Save URL
                                </button>
                            </div>
                        </div>
                    )}

                    {/* WhatsApp Provider (Global) */}
                    {activeTab === "provider" && (
                        <div className="card">
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                                <MessageCircle size={16} color="var(--brand-primary)" /> Global WhatsApp Provider Config
                            </div>
                            <div style={{ padding: "0.75rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--brand-dark)", marginBottom: "1.5rem" }}>
                                ℹ️ You are using your own Meta Developer account for all customers. Customers do not need to provide their own tokens.
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div>
                                    <label className="form-label">Meta System User Access Token</label>
                                    <div className="input-group">
                                        <input className="input" type={showToken ? "text" : "password"} defaultValue="EAAGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style={{ paddingRight: "2.5rem" }} />
                                        <button className="btn-icon" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }} onClick={() => setShowToken(!showToken)}>
                                            {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
                                        </button>
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                                        Permanent token for the Meta App that handles all customer messages.
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Meta App ID</label>
                                    <input className="input" defaultValue="987654321098765" />
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                                        <Save size={13} /> Save Provider Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    {activeTab === "email" && (
                        <div className="card">
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                                <Mail size={16} color="var(--brand-primary)" /> Email Configuration
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                                {(["resend", "smtp"] as const).map((p) => (
                                    <button
                                        key={p}
                                        className={`tab ${emailProvider === p ? "active" : ""}`}
                                        onClick={() => setEmailProvider(p)}
                                        style={{ background: emailProvider === p ? "var(--brand-primary)" : "var(--bg-hover)", color: emailProvider === p ? "#0f172a" : "var(--text-muted)", border: "none", padding: "0.45rem 1rem", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                                    >
                                        {p === "resend" ? "Resend (Recommended)" : "SMTP"}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                                {emailProvider === "resend" ? (
                                    <div>
                                        <label className="form-label">Resend API Key</label>
                                        <div className="input-group">
                                            <input className="input" type={showToken ? "text" : "password"} defaultValue="re_xxxxxxxxxxxx" style={{ paddingRight: "2.5rem" }} />
                                            <button className="btn-icon" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }} onClick={() => setShowToken(!showToken)}>
                                                {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                            <div><label className="form-label">SMTP Host</label><input className="input" defaultValue="smtp.gmail.com" /></div>
                                            <div><label className="form-label">SMTP Port</label><input className="input" type="number" defaultValue={587} /></div>
                                        </div>
                                        <div><label className="form-label">Username</label><input className="input" placeholder="yourapp@gmail.com" /></div>
                                        <div>
                                            <label className="form-label">Password</label>
                                            <div className="input-group">
                                                <input className="input" type={showSmtp ? "text" : "password"} placeholder="App password" style={{ paddingRight: "2.5rem" }} />
                                                <button className="btn-icon" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }} onClick={() => setShowSmtp(!showSmtp)}>
                                                    {showSmtp ? <EyeOff size={13} /> : <Eye size={13} />}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div><label className="form-label">From Address</label><input className="input" defaultValue="WhatsApp Admin <admin@inventory.pk>" /></div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button className="btn btn-secondary btn-sm">📧 Send Test Email</button>
                                    <button className="btn btn-primary btn-sm"><Save size={12} /> Save Config</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email Templates */}
                    {activeTab === "templates" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {[
                                { label: "Approval Email", subject: "Your WhatsApp Notifications Access Key 🎉", value: approvalTemplate, setter: setApprovalTemplate },
                                { label: "Rejection Email", subject: "Update on Your WhatsApp Access Request", value: rejectionTemplate, setter: setRejectionTemplate },
                                { label: "Renewal Reminder", subject: "Your WhatsApp Subscription Expires Soon ⚠️", value: renewalTemplate, setter: setRenewalTemplate },
                            ].map(({ label, subject, value, setter }) => (
                                <div key={label} className="card">
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: "1rem" }}>{label}</div>
                                    <div style={{ marginBottom: "0.75rem" }}>
                                        <label className="form-label">Subject</label>
                                        <input className="input" defaultValue={subject} />
                                    </div>
                                    <div>
                                        <label className="form-label">Body (supports {`{{variables}}`})</label>
                                        <textarea
                                            className="input"
                                            rows={7}
                                            value={value}
                                            onChange={(e) => setter(e.target.value)}
                                            style={{ resize: "vertical", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}
                                        />
                                    </div>
                                    <button className="btn btn-secondary btn-sm" style={{ marginTop: "0.75rem", alignSelf: "flex-start" }}>
                                        <Save size={12} /> Save Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Webhook */}
                    {activeTab === "webhook" && (
                        <div className="card">
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                                <Webhook size={16} color="var(--brand-primary)" /> Request Source Configuration
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div style={{ padding: "0.75rem", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "#1e40af" }}>
                                    Configure where "Request Access" submissions from the desktop app are stored and forwarded.
                                </div>
                                <div>
                                    <label className="form-label">Incoming Request Endpoint (share with desktop app)</label>
                                    <div className="input-group">
                                        <input className="input" value="https://your-admin.vercel.app/api/requests" readOnly style={{ paddingRight: "5rem" }} />
                                        <button className="btn btn-secondary btn-sm" style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }}>Copy</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Forward to Webhook URL (Zapier / Make.com)</label>
                                    <input className="input" placeholder="https://hooks.zapier.com/..." />
                                </div>
                                <div>
                                    <label className="form-label">Storage Backend</label>
                                    <select className="input" style={{ width: "auto" }}>
                                        <option>Vercel KV</option>
                                        <option>Supabase</option>
                                        <option>Local JSON (dev only)</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                                    <Save size={13} /> Save Config
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
