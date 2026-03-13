import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2, Layout, MapPin, Clock } from "lucide-react";
import { Link, Settings } from "../types";
import { ICON_MAP } from "./constant";

interface HubViewProps {
    links: Link[];
    settings: Settings;
    isAuthenticated: boolean;
    onAdminClick: () => void;
}

export function HubView({ links, settings, isAuthenticated, onAdminClick }: HubViewProps) {
    const [clickCount, setClickCount] = useState(0);

    useEffect(() => {
        if (clickCount >= 6) {
            onAdminClick();
            setClickCount(0);
        }

        // Reset click count after 2 seconds of inactivity
        const timer = setTimeout(() => {
            if (clickCount > 0) setClickCount(0);
        }, 2000);

        return () => clearTimeout(timer);
    }, [clickCount, onAdminClick]);

    const handleLinkClick = async (link: Link) => {
        try {
            await fetch(`/api/links/${link.id}/click`, { method: "POST" });
        } catch (e) {
            console.error("Failed to track click");
        }
        window.open(link.url, "_blank");
    };

    return (
        <div
            className={`min-h-screen flex flex-col items-center py-16 px-4 transition-colors duration-500 font-sans ${settings.bg_color ? `bg-[${settings.bg_color}]` : "bg-white"}`}
        >
            {/* Yellow Accent Bar */}
            <div className="fixed top-0 left-0 w-full h-2 bg-[#facc15] z-50"></div>

            {/* Top Actions */}
            <div className="fixed top-6 right-6 flex gap-2 z-40">
                <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: settings.profile_name || 'Dembel City Center',
                                text: `Check out ${settings.profile_name || 'Dembel City Center'}'s links!`,
                                url: window.location.href,
                            });
                        } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard!");
                        }
                    }}
                    className="p-3 bg-white/80 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all border border-stone-100"
                    title="Share Hub"
                >
                    <Share2 className="w-5 h-5 text-blue-800" />
                </button>
            </div>

            {/* Header Section - Editorial Style */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center mb-12 text-center max-w-2xl"
            >
                <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl overflow-hidden mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <img
                        src={settings.profile_image || 'https://pub-f30882b481294faa997a4d11ff77ce65.r2.dev/company-logo/10932099/photo_2025-08-20_16-16-37.jpg'}
                        alt={settings.profile_name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                </div>

                <h1 className="text-5xl font-display font-bold mb-2 tracking-tight text-blue-900 leading-none">
                    {settings.profile_name || 'Dembel City Center'}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                    <span className="h-px w-8 bg-[#facc15]"></span>
                    <p className="font-display text-lg font-medium text-blue-700 uppercase tracking-widest">
                        {settings.profile_username || '@DEMBELCITYCENTER'}
                    </p>
                    <span className="h-px w-8 bg-[#facc15]"></span>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-stone-500 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#facc15]" />
                        <span>Addis Ababa, Ethiopia</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#facc15]" />
                        <span>Open Daily: 8AM - 10PM</span>
                    </div>
                </div>
            </motion.div>

            {/* Links Section - Clean Utility Style */}
            <div className="w-full max-w-lg space-y-4">
                <AnimatePresence>
                    {links.map((link, index) => (
                        <motion.button
                            key={link.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleLinkClick(link)}
                            className="w-full group relative flex items-center p-5 rounded-2xl transition-all hover:translate-x-2 active:scale-[0.98] shadow-md border border-stone-100 overflow-hidden"
                            style={{
                                backgroundColor: settings.button_color || "#1e40af",
                                color: settings.text_color || "#ffffff"
                            }}
                        >
                            {/* Hover Accent */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#facc15] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 mr-5 group-hover:bg-white/20 transition-colors shadow-inner">
                                {ICON_MAP[link.icon?.toLowerCase()] || ICON_MAP.default}
                            </div>

                            <div className="grow text-left">
                                <h2 className="font-display font-bold text-xl leading-tight tracking-tight">{link.title}</h2>
                                {link.subtitle && <p className="text-sm opacity-80 font-medium mt-0.5">{link.subtitle}</p>}
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <Layout className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer / Admin Link */}
            <div
                className="mt-auto pt-16 pb-8 cursor-default"
                onClick={() => !isAuthenticated && setClickCount(prev => prev + 1)}
            >
                {isAuthenticated ? (
                    <button
                        onClick={onAdminClick}
                        className="flex items-center gap-3 px-8 py-4 bg-blue-900/5 hover:bg-blue-900/10 rounded-2xl transition-all text-sm font-bold border border-blue-900/10 text-blue-900 group"
                    >
                        <Layout className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Manage Mall Hub</span>
                    </button>
                ) : (
                    <div className="h-[52px] w-[180px]" /> // Invisible placeholder to maintain layout
                )}
                <p className="text-center mt-6 text-stone-400 text-xs font-medium uppercase tracking-widest pointer-events-none">
                    © 2026 Dembel City Center
                </p>
            </div>
        </div>
    );
}
