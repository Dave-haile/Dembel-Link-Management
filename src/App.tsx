import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  BarChart2, 
  Settings as SettingsIcon, 
  ChevronRight, 
  Save,
  X,
  Layout,
  Eye,
  Menu,
  MoreVertical,
  Instagram,
  Twitter,
  Youtube,
  Send,
  Globe,
  Github,
  Share2,
  QrCode,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { Link, Settings, AnalyticsData } from "./types";

const ICON_MAP: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  telegram: <Send className="w-5 h-5" />,
  github: <Github className="w-5 h-5" />,
  web: <Globe className="w-5 h-5" />,
  default: <ExternalLink className="w-5 h-5" />
};

export default function App() {
  const [view, setView] = useState<"hub" | "admin">("hub");
  const [links, setLinks] = useState<Link[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [linksRes, settingsRes] = await Promise.all([
        fetch("/api/links"),
        fetch("/api/settings")
      ]);
      const linksData = await linksRes.json();
      const settingsData = await settingsRes.json();
      setLinks(linksData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
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
      {view === "hub" ? (
        <HubView links={links} settings={settings} onAdminClick={() => setView("admin")} />
      ) : (
        <AdminView 
          settings={settings} 
          onBack={() => {
            setView("hub");
            fetchData();
          }} 
        />
      )}
    </div>
  );
}

function HubView({ links, settings, onAdminClick }: { links: Link[], settings: Settings, onAdminClick: () => void }) {
  const [adminClicks, setAdminClicks] = useState(0);

  const handleLinkClick = async (link: Link) => {
    try {
      await fetch(`/api/links/${link.id}/click`, { method: "POST" });
    } catch (e) {
      console.error("Failed to track click");
    }
    window.open(link.url, "_blank");
  };

  const handleLogoClick = () => {
    const newClicks = adminClicks + 1;
    if (newClicks >= 5) {
      onAdminClick();
      setAdminClicks(0);
    } else {
      setAdminClicks(newClicks);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center py-12 px-4 transition-colors duration-500"
      style={{ backgroundColor: settings.bg_color }}
    >
      {/* Top Actions */}
      <div className="fixed top-4 right-4 flex gap-2">
        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: settings.profile_name,
                text: `Check out ${settings.profile_name}'s links!`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }
          }}
          className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-all"
          title="Share Hub"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10 text-center"
      >
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4">
          <img 
            src={settings.profile_image} 
            alt={settings.profile_name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: settings.text_color }}>
          {settings.profile_name}
        </h1>
        <p className="opacity-80 font-medium" style={{ color: settings.text_color }}>
          {settings.profile_username}
        </p>
      </motion.div>

      {/* Links Section */}
      <div className="w-full max-w-md space-y-4">
        <AnimatePresence>
          {links.map((link, index) => (
            <motion.button
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleLinkClick(link)}
              className="w-full group flex items-center p-4 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] relative overflow-hidden"
              style={{ backgroundColor: settings.button_color, color: settings.text_color }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center mr-4 group-hover:bg-stone-200 transition-colors">
                {ICON_MAP[link.icon?.toLowerCase()] || ICON_MAP.default}
              </div>
              <div className="flex-grow text-left">
                <h2 className="font-bold text-lg leading-tight">{link.title}</h2>
                {link.subtitle && <p className="text-sm opacity-60">{link.subtitle}</p>}
              </div>
              <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-12 flex flex-col items-center gap-4">
        <button 
          onClick={handleLogoClick}
          className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-all active:scale-95"
          title="LinkHub"
        >
          <Layout className="w-6 h-6 text-white/40" />
        </button>
        <p className="text-sm opacity-40 font-medium" style={{ color: settings.text_color }}>
          Created with LinkHub
        </p>
      </footer>
    </div>
  );
}

function AdminView({ settings: initialSettings, onBack }: { settings: Settings, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"links" | "appearance" | "analytics" | "qrcode">("links");
  const [links, setLinks] = useState<Link[]>([]);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [editingLink, setEditingLink] = useState<Partial<Link> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const [linksRes, analyticsRes] = await Promise.all([
      fetch("/api/admin/links"),
      fetch("/api/analytics")
    ]);
    setLinks(await linksRes.json());
    setAnalytics(await analyticsRes.json());
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    setIsSaving(false);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    const method = editingLink.id ? "PUT" : "POST";
    const url = editingLink.id ? `/api/admin/links/${editingLink.id}` : "/api/admin/links";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingLink)
    });

    setEditingLink(null);
    fetchAdminData();
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    await fetch(`/api/admin/links/${id}`, { method: "DELETE" });
    fetchAdminData();
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-stone-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">LinkHub</h1>
          </div>
          <button 
            onClick={onBack}
            className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
            title="Back to Hub"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        <button 
          onClick={onBack}
          className="hidden md:flex items-center gap-2 mb-6 text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hub
        </button>

        <nav className="space-y-1 flex-grow">
          <button 
            onClick={() => setActiveTab("links")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "links" ? "bg-stone-900 text-white" : "hover:bg-stone-100 text-stone-600"}`}
          >
            <Menu className="w-5 h-5" />
            <span className="font-medium">Links</span>
          </button>
          <button 
            onClick={() => setActiveTab("appearance")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "appearance" ? "bg-stone-900 text-white" : "hover:bg-stone-100 text-stone-600"}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="font-medium">Appearance</span>
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "analytics" ? "bg-stone-900 text-white" : "hover:bg-stone-100 text-stone-600"}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab("qrcode")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "qrcode" ? "bg-stone-900 text-white" : "hover:bg-stone-100 text-stone-600"}`}
          >
            <QrCode className="w-5 h-5" />
            <span className="font-medium">QR Code</span>
          </button>
        </nav>

        <button 
          onClick={onBack}
          className="mt-8 flex items-center justify-center gap-2 w-full py-3 border-2 border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <Eye className="w-5 h-5" />
          Preview Hub
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 max-w-4xl mx-auto w-full">
        {activeTab === "links" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Links</h2>
              <button 
                onClick={() => setEditingLink({ title: "", subtitle: "", url: "", icon: "web", active: true })}
                className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-stone-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Link
              </button>
            </div>

            <div className="space-y-4">
              {links.map(link => (
                <div key={link.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600">
                    {ICON_MAP[link.icon?.toLowerCase()] || ICON_MAP.default}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{link.title}</h3>
                    <p className="text-sm text-stone-500 truncate max-w-[200px] md:max-w-md">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingLink(link)}
                      className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Appearance Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Profile Name</span>
                  <input 
                    type="text" 
                    value={settings.profile_name}
                    onChange={e => setSettings({...settings, profile_name: e.target.value})}
                    className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Username</span>
                  <input 
                    type="text" 
                    value={settings.profile_username}
                    onChange={e => setSettings({...settings, profile_username: e.target.value})}
                    className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Profile Image URL</span>
                  <input 
                    type="text" 
                    value={settings.profile_image}
                    onChange={e => setSettings({...settings, profile_image: e.target.value})}
                    className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Background Color</span>
                  <div className="flex gap-2 mt-1">
                    <input 
                      type="color" 
                      value={settings.bg_color}
                      onChange={e => setSettings({...settings, bg_color: e.target.value})}
                      className="h-12 w-12 rounded-lg border-none p-0 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={settings.bg_color}
                      onChange={e => setSettings({...settings, bg_color: e.target.value})}
                      className="flex-grow rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Button Color</span>
                  <div className="flex gap-2 mt-1">
                    <input 
                      type="color" 
                      value={settings.button_color}
                      onChange={e => setSettings({...settings, button_color: e.target.value})}
                      className="h-12 w-12 rounded-lg border-none p-0 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={settings.button_color}
                      onChange={e => setSettings({...settings, button_color: e.target.value})}
                      className="flex-grow rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Text Color</span>
                  <div className="flex gap-2 mt-1">
                    <input 
                      type="color" 
                      value={settings.text_color}
                      onChange={e => setSettings({...settings, text_color: e.target.value})}
                      className="h-12 w-12 rounded-lg border-none p-0 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={settings.text_color}
                      onChange={e => setSettings({...settings, text_color: e.target.value})}
                      className="flex-grow rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                    />
                  </div>
                </label>
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? "Saving..." : "Save Appearance"}
            </button>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Link Analytics</h2>
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-stone-600 uppercase tracking-wider text-xs">Link Title</th>
                    <th className="px-6 py-4 font-bold text-stone-600 uppercase tracking-wider text-xs text-right">Total Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {analytics.map((stat, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{stat.title}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-stone-900">{stat.clicks}</td>
                    </tr>
                  ))}
                  {analytics.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-stone-400 italic">No data available yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "qrcode" && (
          <div className="space-y-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold">Your Hub QR Code</h2>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200">
              <QRCodeCanvas 
                value={window.location.origin} 
                size={256}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: settings.profile_image,
                  x: undefined,
                  y: undefined,
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            </div>
            <div className="max-w-sm">
              <p className="text-stone-500 mb-4">Download or share this QR code to give people quick access to your LinkHub.</p>
              <button 
                onClick={() => {
                  const canvas = document.querySelector("canvas");
                  if (canvas) {
                    const url = canvas.toDataURL("image/png");
                    const link = document.createElement("a");
                    link.download = "linkhub-qr.png";
                    link.href = url;
                    link.click();
                  }
                }}
                className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors"
              >
                Download PNG
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{editingLink.id ? "Edit Link" : "Add New Link"}</h3>
              <button onClick={() => setEditingLink(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Title</span>
                <input 
                  required
                  type="text" 
                  value={editingLink.title}
                  onChange={e => setEditingLink({...editingLink, title: e.target.value})}
                  className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                  placeholder="e.g. My Telegram Channel"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Subtitle (Optional)</span>
                <input 
                  type="text" 
                  value={editingLink.subtitle || ""}
                  onChange={e => setEditingLink({...editingLink, subtitle: e.target.value})}
                  className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                  placeholder="e.g. Join for daily updates"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">URL</span>
                <input 
                  required
                  type="url" 
                  value={editingLink.url}
                  onChange={e => setEditingLink({...editingLink, url: e.target.value})}
                  className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                  placeholder="https://t.me/..."
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Icon Type</span>
                <select 
                  value={editingLink.icon}
                  onChange={e => setEditingLink({...editingLink, icon: e.target.value})}
                  className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                >
                  <option value="web">Default / Web</option>
                  <option value="telegram">Telegram</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="youtube">YouTube</option>
                  <option value="github">GitHub</option>
                </select>
              </label>
              
              <div className="flex items-center gap-2 pt-4">
                <button 
                  type="submit"
                  className="flex-grow bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all"
                >
                  {editingLink.id ? "Update Link" : "Create Link"}
                </button>
                <button 
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-6 py-4 border-2 border-stone-200 rounded-2xl font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
