import React, { useState } from "react";
import { motion } from "motion/react";
import { Layout, User, Lock, ArrowLeft } from "lucide-react";

interface LoginViewProps {
    onLogin: (token: string) => void;
    onBack: () => void;
}

export function LoginView({ onLogin, onBack }: LoginViewProps) {
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("admin123");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            console.log(data);
            if (res.ok) {
                onLogin(data.token);
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-800 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-100">
                        <Layout className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-blue-900">Dembel Hub Admin</h1>
                    <p className="text-stone-500 font-medium">Manage your mall's social presence</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}
                    <label className="block">
                        <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Username</span>
                        <div className="relative mt-1">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                required
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="block w-full rounded-xl border-stone-200 shadow-sm focus:border-blue-800 focus:ring-blue-800 p-3 pl-12 bg-white border"
                                placeholder="admin"
                            />
                        </div>
                    </label>
                    <label className="block">
                        <span className="text-sm font-bold text-stone-600 uppercase tracking-wider">Password</span>
                        <div className="relative mt-1">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="block w-full rounded-xl border-stone-200 shadow-sm focus:border-blue-800 focus:ring-blue-800 p-3 pl-12 bg-white border"
                                placeholder="••••••••"
                            />
                        </div>
                    </label>
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-blue-800 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Sign In to Admin"}
                    </button>
                </form>

                <button
                    onClick={onBack}
                    className="w-full mt-6 flex items-center justify-center gap-2 text-stone-500 font-medium hover:text-stone-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Hub
                </button>
            </motion.div>
        </div>
    );
}
