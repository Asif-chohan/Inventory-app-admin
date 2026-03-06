"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        setLoading(true);

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            // 1. Call your real backend (Assuming it's on localhost:3000)
            const response = await fetch(`${apiBase}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();
            console.log("the result is ", result)
            if (response.ok && result.success) {
                // 2. Extract token and user info from result.data
                const { token, role } = result.data;

                // 3. Store the token for future authenticated requests
                localStorage.setItem("auth_token", token);
                localStorage.setItem("user_role", role);

                // 4. Redirect to dashboard
                router.push("/dashboard");
            } else {
                // 5. Handle errors from backend (e.g. "Incorrect email or password")
                setError(result.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Could not connect to the server. Is the backend running?");
            console.error("Login Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--bg-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background glow blobs */}
            <div style={{
                position: "absolute",
                top: -200, left: -200,
                width: 500, height: 500,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(37,211,102,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute",
                bottom: -200, right: -200,
                width: 500, height: 500,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* Card */}
            <div
                className="animate-fade-in"
                style={{
                    width: "100%",
                    maxWidth: 400,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "2.5rem 2rem",
                    boxShadow: "var(--shadow-lg)",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 18,
                            background: "linear-gradient(135deg, #25D366, #128C7E)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1rem",
                            boxShadow: "0 8px 24px rgba(37,211,102,0.35)",
                        }}
                    >
                        <MessageCircle size={32} color="#fff" strokeWidth={2.5} />
                    </div>
                    <h1
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            color: "var(--text-primary)",
                            marginBottom: "0.3rem",
                        }}
                    >
                        WhatsApp Admin Panel
                    </h1>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        Sign in to manage licenses & customers
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.65rem 0.85rem",
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            borderRadius: "var(--radius-sm)",
                            marginBottom: "1.25rem",
                            fontSize: 13,
                            color: "#f87171",
                        }}
                    >
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                    {/* Email */}
                    <div>
                        <label className="form-label">Email Address</label>
                        <div className="input-group">
                            <Mail size={14} className="input-icon" />
                            <input
                                id="login-email"
                                type="email"
                                className="input input-with-icon"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="form-label">Password</label>
                        <div className="input-group">
                            <Lock size={14} className="input-icon" />
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                className="input input-with-icon"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingRight: "2.5rem" }}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--text-dim)",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: 0,
                                }}
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        id="login-submit"
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: "100%", justifyContent: "center", padding: "0.7rem", marginTop: "0.25rem", fontSize: 14 }}
                    >
                        {loading ? (
                            <>
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: 14,
                                        height: 14,
                                        border: "2px solid rgba(255,255,255,0.3)",
                                        borderTopColor: "#fff",
                                        borderRadius: "50%",
                                    }}
                                    className="animate-spin"
                                />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div
                    style={{
                        marginTop: "2rem",
                        paddingTop: "1.25rem",
                        borderTop: "1px solid var(--border)",
                        textAlign: "center",
                        fontSize: 13,
                        color: "var(--text-dim)",
                    }}
                >
                    <div style={{ marginBottom: "0.75rem" }}>
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            style={{
                                color: "var(--brand-primary)",
                                fontWeight: 600,
                                textDecoration: "none"
                            }}
                        >
                            Create one
                        </Link>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                        Inventory Manager &copy; 2026 &mdash; Admin Panel v1.1
                    </div>
                </div>
            </div>
        </div>
    );
}
