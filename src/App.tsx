import React, { useState, useEffect } from "react";
import { Link, Settings } from "./types";
import { HubView } from "./components/Hub";
import { LoginView } from "./components/Login";
import { AdminView } from "./components/Admin";

export default function App() {
  const [view, setView] = useState<"hub" | "admin" | "login">("hub");
  const [links, setLinks] = useState<Link[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("linkhub_token") || null,
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [linksRes, settingsRes] = await Promise.all([
        fetch("/api/links"),
        fetch("/api/settings"),
      ]);
      const linksData = await linksRes.json();
      const settingsData = await settingsRes.json();
      setLinks(linksData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("linkhub_token", newToken);
    setView("admin");
  };

  const handleLogout = async () => {
    setToken(null);
    localStorage.removeItem("linkhub_token");
    setView("hub");
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen font-sans">
      {view === "hub" && (
        <HubView
          links={links}
          settings={settings}
          isAuthenticated={token}
          onAdminClick={() => setView(token ? "admin" : "login")}
        />
      )}
      {view === "login" && (
        <LoginView onLogin={handleLogin} onBack={() => setView("hub")} />
      )}
      {view === "admin" &&
        (token ? (
          <AdminView
            settings={settings}
          token={token}
          onLogout={handleLogout}
          onBack={() => {
            setView("hub");
            fetchData();
          }}
        />
        ) : (
          <LoginView onLogin={handleLogin} onBack={() => setView("hub")} />
        ))}
    </div>
  );
}
