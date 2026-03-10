"use client";

import Header from "@/components/layout/Header";
import QUERY_KEYS from "@/constants/queryKeys";
import { getProfile, updateName, updatePassword, updateEmail } from "@/lib/services/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Save, RefreshCw, Key, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
    const queryClient = useQueryClient();

    const { data: profile, isLoading } = useQuery<any, unknown>({
      queryKey: [QUERY_KEYS.GET_PROFILE],
      queryFn: getProfile,
      refetchOnWindowFocus: false,
      select: (data) => data?.data || null,
    });

    // local controlled inputs
    const [name, setName] = useState(profile?.name || "");
    const [email, setEmail] = useState(profile?.email || "");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // keep inputs in sync when profile loads/changes
    useEffect(() => {
      if (!isLoading && profile) {
        setName(profile.name || "");
        setEmail(profile.email || "");
      }
    }, [isLoading, profile]);


    const nameMutation = useMutation({
       mutationFn: (payload: { name: string }) => updateName(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_PROFILE] });
        toast.success("Your changes has been saved!");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to save changes!");
      },
    });


    const passwordMutation = useMutation({
       mutationFn: (payload: { currentPassword: string; newPassword: string }) => updatePassword(payload),
      onSuccess: () => {
        // no profile change, but clear inputs and invalidate
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        queryClient.invalidateQueries({queryKey: [QUERY_KEYS.GET_PROFILE]});
        toast.success("Your password changed successfully!");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to change password! Try again later.");
      },
    });

    return (
      <div>
        <Header
          title="Settings"
          subtitle="Manage your admin profile settings"
        />

        <div
          style={{
            padding: "1.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ flex: 1, maxWidth: 640 }}>
            {/* Profile */}
            <div className="card">
              {isLoading ? (
                <div className="py-10! flex items-center justify-center">
                  <RefreshCw
                    size={24}
                    className="animate-spin"
                    style={{ color: "var(--brand-primary)", opacity: 0.5 }}
                  />
                </div>
              ) : (
                <>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      marginBottom: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <User size={16} color="var(--brand-primary)" /> Admin
                    Profile
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, var(--brand-primary), var(--brand-dark))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 26,
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {(profile?.name || "").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>
                        {profile?.name}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {profile?.email}
                      </div>
                      <span
                        className="badge badge-success"
                        style={{ fontSize: 10, marginTop: 4 }}
                      >
                        {profile?.role}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.85rem",
                    }}
                  >
                    <div>
                      <label className="form-label">Display Name</label>
                      <input
                        className="input"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setNameError("");
                        }}
                      />
                      {nameError && (
                        <div
                          style={{
                            color: "#ef4444",
                            fontSize: 12,
                            marginTop: 6,
                          }}
                        >
                          {nameError}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Email</label>
                      <input
                        className="input"
                        value={email}
                        type="email"
                        disabled
                      />
                      <button
                        className="btn btn-primary mt-4!"
                        style={{ marginTop: 8 }}
                        onClick={async () => {
                          if (!name || name.trim().length < 2) {
                            setNameError("Name must be at least 2 characters");
                            return;
                          }
                          try {
                            await nameMutation.mutateAsync({
                              name: name.trim(),
                            });
                          } catch (err: any) {
                            setNameError(err?.message || "Update failed");
                          }
                        }}
                        disabled={nameMutation.isPending}
                      >
                        {nameMutation.isPending ? (
                          <Circle
                            size={12}
                            className="animate-spin"
                            style={{
                              opacity: 0.5,
                            }}
                          />
                        ) : (
                          <Save size={12} />
                        )}{" "}
                        Save Changes
                      </button>
                    </div>
                    <hr className="divider" />

                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      Change Password
                    </div>
                    <div>
                      <label className="form-label">Current Password</label>
                      <input
                        className="input"
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setPasswordError("");
                        }}
                      />
                    </div>
                    <div>
                      <label className="form-label">New Password</label>
                      <input
                        className="input"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError("");
                        }}
                      />
                    </div>
                    <div>
                      <label className="form-label">Confirm New Password</label>
                      <input
                        className="input"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError("");
                        }}
                      />
                      {passwordError && (
                        <div
                          style={{
                            color: "#ef4444",
                            fontSize: 12,
                            marginTop: 6,
                          }}
                        >
                          {passwordError}
                        </div>
                      )}
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ alignSelf: "flex-start" }}
                      onClick={async () => {
                        // validation
                        if (!currentPassword) {
                          setPasswordError(
                            "Please enter your current password",
                          );
                          return;
                        }
                        if (!newPassword || newPassword.length < 8) {
                          setPasswordError(
                            "New password must be at least 8 characters",
                          );
                          return;
                        }
                        if (newPassword !== confirmPassword) {
                          setPasswordError(
                            "New password and confirmation do not match",
                          );
                          return;
                        }
                        try {
                          await passwordMutation.mutateAsync({
                            currentPassword,
                            newPassword,
                          });
                        } catch (err: any) {
                          setPasswordError(
                            err?.message || "Password update failed",
                          );
                        }
                      }}
                      disabled={passwordMutation.isPending}
                    >
                      {passwordMutation.isPending ? (
                        <Circle
                          size={12}
                          className="animate-spin"
                          style={{
                            opacity: 0.5,
                          }}
                        />
                      ) : (
                        <Key size={12} />
                      )}{" "}
                      Change Password
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}
