import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Hardcoded credentials
    const credentials = {
        admin: { username: 'admin', password: 'admin123', role: 'Admin' },
        moderator: { username: 'moderator', password: 'mod123', role: 'Moderator' }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            if (username === credentials.admin.username && password === credentials.admin.password) {
                // Save to localStorage with login time
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', credentials.admin.role);
                localStorage.setItem('username', username);
                localStorage.setItem('loginTime', Date.now().toString());
                
                alert(`✅ Welcome ${credentials.admin.role}! Login successful.`);
                setLoading(false);
                // Navigate to home
                navigate('/');
            } 
            else if (username === credentials.moderator.username && password === credentials.moderator.password) {
                // Save to localStorage with login time
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', credentials.moderator.role);
                localStorage.setItem('username', username);
                localStorage.setItem('loginTime', Date.now().toString());
                
                alert(`✅ Welcome ${credentials.moderator.role}! Login successful.`);
                setLoading(false);
                // Navigate to home
                navigate('/');
            } 
            else {
                setError('❌ Invalid username or password. Please try again.');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse delay-500"></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-300 hover:shadow-3xl">
                {/* Header with "THORI" text */}
                <div className="text-center mb-8">
                    <h1 className="text-6xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
                        THOR
                    </h1>
                    <p className="text-white/80 mt-2 text-sm font-medium tracking-wide">
                        ✨ Access Portal for Admin & Moderator ✨
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full mx-auto mt-4"></div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Field */}
                    <div className="group">
                        <label className="block text-white text-sm font-semibold mb-2 tracking-wide">
                            👤 USERNAME
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="group">
                        <label className="block text-white text-sm font-semibold mb-2 tracking-wide">
                            🔒 PASSWORD
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-3 text-center">
                            <p className="text-red-100 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            '✨ LOGIN ✨'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-white/50 text-xs">
                    © 2024 THOR • Secure Access Portal
                </div>
            </div>
        </div>
    );
};

export default Login;