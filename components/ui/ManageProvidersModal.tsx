"use client";

import { useState, useEffect } from "react";
import { X, Settings, AlertCircle, Smartphone, MessageCircle, Eye, EyeOff, Save, Loader2 } from "lucide-react";

interface ManageProvidersModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
    customerName: string;
    initialData?: ProvidersData;
    onSuccess: () => void;
    allowedChannels?: string[];
}

export interface ProvidersData {
    whatsapp?: {
        metaPhoneNumberId: string;
        metaWabaId: string;
        metaAccessToken: string;
        templates?: {
            salesSummary?: {
                name: string;
                language: string;
            };
        };
    } | null;
    sms?: {
        provider: string;
        accountSid: string;
        authToken: string;
        fromNumber: string;
    } | null;
}

interface ProvidersDataInternal {
    whatsapp: {
        metaPhoneNumberId: string;
        metaWabaId: string;
        metaAccessToken: string;
        templates: {
            salesSummary: {
                name: string;
                language: string;
            };
        };
    };
    sms: {
        provider: string;
        accountSid: string;
        authToken: string;
        fromNumber: string;
    };
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCustomerProviders } from "@/lib/services/customers";
import QUERY_KEYS from "@/constants/queryKeys";

export default function ManageProvidersModal({ isOpen, onClose, customerId, customerName, initialData, onSuccess, allowedChannels = ["whatsapp", "sms"] }: ManageProvidersModalProps) {
    const [activeTab, setActiveTab] = useState<"whatsapp" | "sms">("whatsapp");
    const [error, setError] = useState("");
    const [showToken, setShowToken] = useState({ whatsapp: false, sms: false });

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: any) => updateCustomerProviders(customerId, data),
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CUSTOMER_PROVIDERS, customerId] });
                onSuccess();
                onClose();
            } else {
                setError(result.message || "Failed to update providers");
            }
        },
        onError: (err) => {
            setError("Could not connect to the server.");
            console.error(err);
        }
    });

    useEffect(() => {
        if (allowedChannels.length > 0 && !allowedChannels.includes(activeTab)) {
            setActiveTab(allowedChannels[0] as "whatsapp" | "sms");
        }
    }, [allowedChannels, activeTab]);

    const getDefaults = (): ProvidersDataInternal => ({
        whatsapp: {
            metaPhoneNumberId: "",
            metaWabaId: "",
            metaAccessToken: "",
            templates: {
                salesSummary: {
                    name: "sales_summary_report",
                    language: "en_US",
                },
            },
        },
        sms: {
            provider: "twilio",
            accountSid: "",
            authToken: "",
            fromNumber: "",
        },
    });

    const mergeData = (data?: ProvidersData): ProvidersDataInternal => {
        const defaults = getDefaults();
        if (!data) return defaults;

        return {
            whatsapp: data.whatsapp ? {
                ...defaults.whatsapp,
                ...data.whatsapp,
                templates: data.whatsapp.templates ? {
                    salesSummary: {
                        ...defaults.whatsapp.templates.salesSummary,
                        ...(data.whatsapp.templates.salesSummary || {})
                    }
                } : defaults.whatsapp.templates
            } : defaults.whatsapp,
            sms: data.sms ? {
                ...defaults.sms,
                ...data.sms
            } : defaults.sms
        };
    };

    const [formData, setFormData] = useState<ProvidersDataInternal>(() => mergeData(initialData));

    useEffect(() => {
        if (isOpen) {
            setFormData(mergeData(initialData));
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setError("");
        mutation.mutate(formData);
    };

    const loading = mutation.isPending;

    const updateWhatsApp = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            whatsapp: { ...prev.whatsapp, [field]: value }
        }));
    };

    const updateTemplate = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            whatsapp: {
                ...prev.whatsapp,
                templates: {
                    ...prev.whatsapp.templates,
                    salesSummary: {
                        ...prev.whatsapp.templates.salesSummary,
                        [field]: value
                    }
                }
            }
        }));
    };

    const updateSMS = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            sms: { ...prev.sms, [field]: value }
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal animate-fade-in"
                style={{ maxWidth: 600, padding: 0, overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: "1.25rem 1.5rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--bg-card)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: "10px",
                            background: "rgba(59, 130, 246, 0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <Settings size={20} color="var(--brand-primary)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>Provider Credentials</h3>
                            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Configuring API access for <strong>{customerName}</strong></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs - only show if both channels are enabled */}
                {allowedChannels.length > 1 && (
                    <div style={{ display: "flex", background: "var(--bg-primary)", padding: "0.5rem 1.5rem 0", borderBottom: "1px solid var(--border)" }}>
                        {allowedChannels.includes("whatsapp") && (
                            <button
                                onClick={() => setActiveTab("whatsapp")}
                                style={{
                                    padding: "0.75rem 1.25rem",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: activeTab === "whatsapp" ? "var(--brand-primary)" : "var(--text-dim)",
                                    borderBottom: `2px solid ${activeTab === "whatsapp" ? "var(--brand-primary)" : "transparent"}`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    transition: "all 0.2s"
                                }}
                            >
                                <MessageCircle size={16} /> WhatsApp (Meta)
                            </button>
                        )}
                        {allowedChannels.includes("sms") && (
                            <button
                                onClick={() => setActiveTab("sms")}
                                style={{
                                    padding: "0.75rem 1.25rem",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: activeTab === "sms" ? "#3b82f6" : "var(--text-dim)",
                                    borderBottom: `2px solid ${activeTab === "sms" ? "#3b82f6" : "transparent"}`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    transition: "all 0.2s"
                                }}
                            >
                                <Smartphone size={16} /> SMS (Twilio)
                            </button>
                        )}
                    </div>
                )}

                <div style={{ padding: "1.5rem", maxHeight: "60vh", overflowY: "auto" }}>
                    {error && (
                        <div style={{
                            padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius-sm)",
                            color: "var(--danger)", fontSize: 12, display: "flex", alignItems: "center", gap: 8,
                            marginBottom: "1.5rem"
                        }}>
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    {activeTab === "whatsapp" ? (
                        <div className="animate-fade-in">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                                <div className="form-group">
                                    <label className="form-label">Phone Number ID</label>
                                    <input
                                        className="input"
                                        placeholder="e.g. 104829302193"
                                        value={formData.whatsapp.metaPhoneNumberId}
                                        onChange={(e) => updateWhatsApp("metaPhoneNumberId", e.target.value)}
                                    />
                                    <span style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, display: "block" }}>Found in Meta App Settings</span>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">WABA ID</label>
                                    <input
                                        className="input"
                                        placeholder="e.g. 293847562019"
                                        value={formData.whatsapp.metaWabaId}
                                        onChange={(e) => updateWhatsApp("metaWabaId", e.target.value)}
                                    />
                                    <span style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, display: "block" }}>WhatsApp Business Account ID</span>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                                <label className="form-label">Meta Access Token</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showToken.whatsapp ? "text" : "password"}
                                        className="input"
                                        style={{ paddingRight: "2.5rem" }}
                                        placeholder="EAAG..."
                                        value={formData.whatsapp.metaAccessToken}
                                        onChange={(e) => updateWhatsApp("metaAccessToken", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowToken(prev => ({ ...prev, whatsapp: !prev.whatsapp }))}
                                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }}
                                    >
                                        {showToken.whatsapp ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <span style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, display: "block" }}>System User Access Token with whatsapp_business_messaging permission</span>
                            </div>

                            <div style={{ padding: "1rem", background: "var(--bg-primary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)", marginBottom: "0.75rem" }}>Default Template</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                                    <div className="form-group">
                                        <label className="form-label">Template Name</label>
                                        <input
                                            className="input"
                                            placeholder="e.g. daily_sales_report"
                                            value={formData.whatsapp.templates.salesSummary.name}
                                            onChange={(e) => updateTemplate("name", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Language</label>
                                        <input
                                            className="input"
                                            placeholder="e.g. en_US"
                                            value={formData.whatsapp.templates.salesSummary.language}
                                            onChange={(e) => updateTemplate("language", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                <label className="form-label">Provider</label>
                                <select
                                    className="input"
                                    value={formData.sms.provider}
                                    onChange={(e) => updateSMS("provider", e.target.value)}
                                >
                                    <option value="twilio">Twilio</option>
                                    <option value="vonage">Vonage</option>
                                    <option value="plivo">Plivo</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                <label className="form-label">Account SID</label>
                                <input
                                    className="input"
                                    placeholder="AC..."
                                    value={formData.sms.accountSid}
                                    onChange={(e) => updateSMS("accountSid", e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                <label className="form-label">Auth Token</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showToken.sms ? "text" : "password"}
                                        className="input"
                                        style={{ paddingRight: "2.5rem" }}
                                        placeholder="Auth Token"
                                        value={formData.sms.authToken}
                                        onChange={(e) => updateSMS("authToken", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowToken(prev => ({ ...prev, sms: !prev.sms }))}
                                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }}
                                    >
                                        {showToken.sms ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">From Phone Number</label>
                                <input
                                    className="input"
                                    placeholder="+1234567890"
                                    value={formData.sms.fromNumber}
                                    onChange={(e) => updateSMS("fromNumber", e.target.value)}
                                />
                                <span style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, display: "block" }}>Phone number purchased in Twilio Console</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: "1.25rem 1.5rem",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                    background: "var(--bg-card)"
                }}>
                    <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>Cancel</button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={loading}
                        style={{ minWidth: 120 }}
                    >
                        {loading ? (
                            <><Loader2 size={16} className="animate-spin" style={{ marginRight: 8 }} /> Saving...</>
                        ) : (
                            <><Save size={16} style={{ marginRight: 8 }} /> Save Changes</>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal {
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    width: 100%;
                    border: 1px solid var(--border);
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                }
                .input {
                    width: 100%;
                    padding: 0.6rem 0.75rem;
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-sm);
                    color: var(--text-primary);
                    font-size: 13px;
                }
                .input:focus {
                    outline: none;
                    border-color: var(--brand-primary);
                    box-shadow: 0 0 0 2px rgba(37, 211, 102, 0.2);
                }
                .btn {
                    padding: 0.6rem 1rem;
                    border-radius: var(--radius-sm);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .btn-primary {
                    background: var(--brand-primary);
                    color: #fff;
                    border: none;
                }
                .btn-secondary {
                    background: transparent;
                    color: var(--text-dim);
                    border: 1px solid var(--border);
                }
                .btn-icon {
                    background: transparent;
                    border: none;
                    color: var(--text-dim);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 4px;
                }
                .btn-icon:hover {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
