import React, { useState, useEffect } from "react";
import {
    Plus,
    BarChart2,
    Settings as SettingsIcon,
    Save,
    Layout,
    Eye,
    Menu,
    QrCode,
    ArrowLeft,
    LogOut
} from "lucide-react";
import { AnimatePresence, Reorder } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { Link, Settings, AnalyticsData } from "../types";
import { SortableLinkItem } from "./SortableLinkItem";
import { LinkEditorModal } from "./LinkEditorModal";

interface AdminViewProps {
    settings: Settings;
    token: string;
    onLogout: () => void;
    onBack: () => void;
}

export function AdminView({ settings: initialSettings, token, onLogout, onBack }: AdminViewProps) {
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
        try {
            const [linksRes, analyticsRes] = await Promise.all([
                fetch("/api/admin/links", { headers: { "Authorization": `Bearer ${token}` } }),
                fetch("/api/analytics", { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            if (linksRes.status === 401) {
                onLogout();
                return;
            }

            setLinks(await linksRes.json());
            setAnalytics(await analyticsRes.json());
        } catch (e) {
            console.error("Failed to fetch admin data");
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        await fetch("/api/settings", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
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
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(editingLink)
        });

        setEditingLink(null);
        fetchAdminData();
    };

    const handleDeleteLink = async (id: number) => {
        if (!confirm("Are you sure you want to delete this link?")) return;
        await fetch(`/api/admin/links/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        fetchAdminData();
    };

    const handleReorder = async (newLinks: Link[]) => {
        setLinks(newLinks);
        try {
            await fetch("/api/admin/links/reorder", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ids: newLinks.map(l => l.id) })
            });
        } catch (error) {
            console.error("Failed to save new order:", error);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-b md:border-r border-stone-200 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
                            <Layout className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-display font-bold text-xl tracking-tight text-blue-900">Dembel Admin</h1>
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
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "links" ? "bg-blue-800 text-white shadow-lg shadow-blue-100" : "hover:bg-stone-100 text-stone-600"}`}
                    >
                        <Menu className="w-5 h-5" />
                        <span className="font-medium">Links</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("appearance")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "appearance" ? "bg-blue-800 text-white shadow-lg shadow-blue-100" : "hover:bg-stone-100 text-stone-600"}`}
                    >
                        <SettingsIcon className="w-5 h-5" />
                        <span className="font-medium">Appearance</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "analytics" ? "bg-blue-800 text-white shadow-lg shadow-blue-100" : "hover:bg-stone-100 text-stone-600"}`}
                    >
                        <BarChart2 className="w-5 h-5" />
                        <span className="font-medium">Analytics</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("qrcode")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "qrcode" ? "bg-blue-800 text-white shadow-lg shadow-blue-100" : "hover:bg-stone-100 text-stone-600"}`}
                    >
                        <QrCode className="w-5 h-5" />
                        <span className="font-medium">QR Code</span>
                    </button>
                </nav>

                <div className="mt-8 space-y-2">
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center gap-2 w-full py-3 border-2 border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                    >
                        <Eye className="w-5 h-5" />
                        Preview Hub
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center gap-2 w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-6 md:p-12 max-w-4xl mx-auto w-full">
                {activeTab === "links" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Manage Links</h2>
                            <button
                                onClick={() => setEditingLink({ title: "", subtitle: "", url: "", icon: "web", active: true })}
                                className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                            >
                                <Plus className="w-5 h-5" />
                                Add Link
                            </button>
                        </div>

                        <Reorder.Group
                            axis="y"
                            values={links}
                            onReorder={handleReorder}
                            className="space-y-4"
                        >
                            <AnimatePresence mode="popLayout">
                                {links.map(link => (
                                    <SortableLinkItem
                                        key={link.id}
                                        link={link}
                                        onEdit={(l) => setEditingLink(l)}
                                        onDelete={handleDeleteLink}
                                    />
                                ))}
                            </AnimatePresence>
                        </Reorder.Group>
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
                                        onChange={e => setSettings({ ...settings, profile_name: e.target.value })}
                                        className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Username</span>
                                    <input
                                        type="text"
                                        value={settings.profile_username}
                                        onChange={e => setSettings({ ...settings, profile_username: e.target.value })}
                                        className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Profile Image URL</span>
                                    <input
                                        type="text"
                                        value={settings.profile_image}
                                        onChange={e => setSettings({ ...settings, profile_image: e.target.value })}
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
                                            onChange={e => setSettings({ ...settings, bg_color: e.target.value })}
                                            className="h-12 w-12 rounded-lg border-none p-0 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={settings.bg_color}
                                            onChange={e => setSettings({ ...settings, bg_color: e.target.value })}
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
                                            onChange={e => setSettings({ ...settings, button_color: e.target.value })}
                                            className="h-12 w-12 rounded-lg border-none p-0 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={settings.button_color}
                                            onChange={e => setSettings({ ...settings, button_color: e.target.value })}
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
                                            onChange={e => setSettings({ ...settings, text_color: e.target.value })}
                                            className="h-12 w-12 rounded-lg border-none p-0 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={settings.text_color}
                                            onChange={e => setSettings({ ...settings, text_color: e.target.value })}
                                            className="flex-grow rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                            className="flex items-center justify-center gap-2 w-full bg-blue-800 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
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
                <LinkEditorModal
                    editingLink={editingLink}
                    setEditingLink={setEditingLink}
                    onSave={handleSaveLink}
                />
            )}
        </div>
    );
}
