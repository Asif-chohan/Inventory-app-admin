"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Inbox,
  Users,
  MessageCircle,
  LogOut,
  ChevronRight,
  Key,
} from "lucide-react";
import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotOpenedRequestsCount } from "@/lib/services/requests";
import { supabase } from "@/lib/supabase/client";
import QUERY_KEYS from "@/constants/queryKeys";
import { getProfile } from "@/lib/services/auth";


export default function Sidebar() {
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const { data: requestCount = 0 } = useQuery<number, unknown>({
        queryKey: [QUERY_KEYS.GET_NOT_OPENED_REQUESTS_COUNT],
        queryFn: fetchNotOpenedRequestsCount,
        refetchOnWindowFocus: false,
    });

    const { data: profile } = useQuery<any, unknown>({
      queryKey: [QUERY_KEYS.GET_PROFILE],
      queryFn: getProfile,
      refetchOnWindowFocus: false,
      select: (data) => data?.data || null,
    });


    useEffect(() => {
        const channel = supabase.channel(`requests`).subscribe(() => {});

        channel.on("broadcast", { event: "new-request" }, (payload) => {
            const newCount = Number(payload?.payload?.newRequests ?? 1);
            // update the react-query cache so consumers reflect the latest value
            queryClient.setQueryData([QUERY_KEYS.GET_NOT_OPENED_REQUESTS_COUNT], newCount);
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const NAV = React.useMemo(() => [
      { label: "Requests", href: "/requests", icon: Inbox, badge: requestCount },
      { label: "Customers", href: "/customers", icon: Users },
      { label: "License Keys", href: "/license-keys", icon: Key },
    ], [requestCount]);

    const router = useRouter();

    const handleLogout = async () => {
      try {
        // call server route to clear HttpOnly cookie
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (err) {
        console.error('Logout failed', err);
      }

      try {
        await queryClient.clear();
      } catch (e) {
        // ignore
      }

      // redirect to login
      router.replace('/login');
    }

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
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              Inventory
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--brand-primary)",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              ADMIN PANEL
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
          <div className="section-label" style={{ marginBottom: "0.5rem" }}>
            Main Menu
          </div>
          {NAV.map(({ label, href, icon: Icon, badge }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${isActive ? "active" : ""}`}
                style={{ marginBottom: 2 }}
              >
                <Icon size={16} strokeWidth={2} />
                <span style={{ flex: 1 }}>{label}</span>
                {(badge ?? 0) > 0 && (
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
                {isActive && (
                  <ChevronRight size={12} style={{ opacity: 0.5 }} />
                )}
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
          {profile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                marginBottom: "0.25rem",
                cursor: "pointer",
              }}
              onClick={()=> router.push("/settings")}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--brand-primary), var(--brand-dark))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0f172a",
                  flexShrink: 0,
                }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {profile.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-dim)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {profile.email}
                </div>
              </div>
            </div>
          )}
          <button
            // href="/login"
            onClick={handleLogout}
            className="nav-item"
            style={{ color: "var(--danger)" }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    );
}
