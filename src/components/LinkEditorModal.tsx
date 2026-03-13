import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { Link } from "../types";

interface LinkEditorModalProps {
    editingLink: Partial<Link>;
    setEditingLink: (link: Partial<Link> | null) => void;
    onSave: (e: React.FormEvent) => void;
}

export function LinkEditorModal({ editingLink, setEditingLink, onSave }: LinkEditorModalProps) {
    return (
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

                <form onSubmit={onSave} className="space-y-4">
                    <label className="block">
                        <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Title</span>
                        <input
                            required
                            type="text"
                            value={editingLink.title}
                            onChange={e => setEditingLink({ ...editingLink, title: e.target.value })}
                            className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                            placeholder="e.g. My Telegram Channel"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Subtitle (Optional)</span>
                        <input
                            type="text"
                            value={editingLink.subtitle || ""}
                            onChange={e => setEditingLink({ ...editingLink, subtitle: e.target.value })}
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
                            onChange={e => setEditingLink({ ...editingLink, url: e.target.value })}
                            className="mt-1 block w-full rounded-xl border-stone-200 shadow-sm focus:border-stone-900 focus:ring-stone-900 p-3 bg-white border"
                            placeholder="https://t.me/..."
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Icon Type</span>
                        <select
                            value={editingLink.icon}
                            onChange={e => setEditingLink({ ...editingLink, icon: e.target.value })}
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
    );
}
