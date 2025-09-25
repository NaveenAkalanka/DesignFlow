import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            onLogin(data.user);
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#1E293B] text-white font-inter">
            <div className="w-full max-w-md bg-[#182028]/80 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/10">
                {/* Logo & Title */}
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/DesignFLow.svg"
                        alt="DesignFlow Logo"
                        className="h-16 mb-4"
                    />
                    <h1 className="text-2xl font-medium tracking-wide">
                        Welcome to
                    </h1>
                    <h1 className="text-6xl font-bold tracking-wide text-4xl bg-gradient-to-r from-[#2D82E3] to-[#00FAFF] bg-clip-text text-transparent p-2">
                        DesignFlow
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">
                        Sign in to manage outlets and workflows
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-lg bg-[#0D1117] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg bg-[#0D1117] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 transition font-semibold shadow-lg"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-gray-400">
                    © {new Date().getFullYear()} DesignFlow. All rights reserved.
                </div>
            </div>
        </div>
    );
}
