"use client";

import { useState } from "react";
import { Copy, X, Key, Shield, AlertCircle, CheckCircle } from "lucide-react";

interface KeyGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
    customerName: string;
}

export default function KeyGenerationModal({ isOpen, onClose, customerId, customerName }: KeyGenerationModalProps) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${apiBase}/admin/customers/${customerId}/keys`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({ name }),
            });
            const result = await response.json();
            if (result.success) {
                setGeneratedKey(result.data.clientKey);
            } else {
                setError(result.message || "Failed to generate key");
            }
        } catch (err) {
            setError("Could not connect to the server.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedKey) {
            navigator.clipboard.writeText(generatedKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setName("");
        setGeneratedKey(null);
        setError("");
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div
                className="modal animate-fade-in"
                style={{ maxWidth: 450, padding: 0, overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    padding: "1.5rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--bg-card)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: "8px",
                            background: "rgba(37, 211, 102, 0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <Key size={18} color="var(--brand-primary)" />
                        </div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>Generate License Key</h3>
                    </div>
                    <button onClick={handleClose} className="btn-icon">
                        <X size={18} />
                    </button>
                </div>

                {!generatedKey ? (
                    <form onSubmit={handleGenerate} style={{ padding: "1.5rem" }}>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                                Generating a new production key for <strong>{customerName}</strong>.
                                This key will allow the client application to authenticate with our services.
                            </p>
                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: 8, display: "block" }}>Key Name / Description</label>
                                <input
                                    className="input"
                                    placeholder="e.g. Production - Desktop App"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <span style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6, display: "block" }}>
                                    Helpful for identifying where this key is being used.
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius-sm)",
                                color: "var(--danger)", fontSize: 12, display: "flex", alignItems: "center", gap: 8,
                                marginBottom: "1.25rem"
                            }}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <div style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "0.75rem",
                            marginTop: "0.5rem",
                            paddingTop: "1.25rem",
                            borderTop: "1px solid var(--border)"
                        }}>
                            <button type="button" onClick={handleClose} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
                                {loading ? "Generating..." : "Generate Key"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{ padding: "1.5rem" }}>
                        <div style={{
                            padding: "1rem", background: "rgba(34, 197, 94, 0.05)",
                            border: "1px solid rgba(34, 197, 94, 0.15)", borderRadius: "var(--radius-md)",
                            marginBottom: "1.5rem"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--success)", fontWeight: 700, marginBottom: "0.5rem" }}>
                                <CheckCircle size={18} /> Key Generated Successfully
                            </div>
                            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
                                Below is the secret key. Copy it now!
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ marginBottom: 8, display: "block" }}>Secret Key</label>
                            <div style={{
                                display: "flex", gap: 8, padding: "1rem",
                                background: "var(--bg-primary)", border: "1px solid var(--border)",
                                borderRadius: "var(--radius-sm)", fontFamily: "monospace", fontSize: 14,
                                position: "relative", fontWeight: 600, color: "var(--text-primary)"
                            }}>
                                <span style={{ wordBreak: "break-all", flex: 1, paddingRight: 40 }}>{generatedKey}</span>
                                <button
                                    onClick={handleCopy}
                                    className="btn-icon"
                                    style={{
                                        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                                        background: copied ? "var(--success)" : "var(--brand-primary)",
                                        color: "#fff", padding: 6, borderRadius: 6
                                    }}
                                    title="Copy to clipboard"
                                >
                                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        <div style={{
                            padding: "1rem", background: "rgba(245, 158, 11, 0.08)",
                            border: "1px dashed rgba(245, 158, 11, 0.25)", borderRadius: "var(--radius-md)",
                            marginBottom: "1.5rem", marginTop: "1rem"
                        }}>
                            <div style={{ display: "flex", gap: 10, color: "#92400e" }}>
                                <Shield size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Security Warning</div>
                                    <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, color: "#a16207" }}>
                                        Save this key now! For security reasons, <strong>we cannot show this key to you again</strong> once you close this window.
                                        If you lose it, you will need to generate a new one.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            marginTop: "0.5rem",
                            paddingTop: "1.25rem",
                            borderTop: "1px solid var(--border)"
                        }}>
                            <button onClick={handleClose} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                                I have saved the key securely
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
