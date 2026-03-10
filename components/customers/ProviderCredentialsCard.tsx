"use client";

import { Settings, Edit, RefreshCw } from "lucide-react";

interface ProviderCredentialsCardProps {
    providers?: any;
    providersLoading: boolean;
    onConfigure: () => void;
    channels: string[];
}

export default function ProviderCredentialsCard({ providers, providersLoading, onConfigure, channels }: ProviderCredentialsCardProps) {
    return (
        <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <Settings size={16} color="var(--brand-primary)" /> API Provider Credentials
                    {providersLoading && <RefreshCw size={12} className="animate-spin" style={{ color: "var(--text-dim)" }} />}
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={onConfigure}
                >
                    <Edit size={12} /> Configure
                </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: 13 }}>
                {channels.includes("whatsapp") && (
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

                {channels.includes("sms") && (
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
    );
}
