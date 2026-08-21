import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowRight, FiEye, FiEyeOff, FiLock, FiUser, FiZap } from 'react-icons/fi';
import { isAuthenticated, startSession, verifyCredentials } from '../lib/auth';
import { meshBackground } from '../lib/theme';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Where PrivateRoute bounced the user from, so they land back where they meant to go.
    const from = location.state?.from?.pathname || '/';

    // Already signed in? Don't show the form at all.
    if (isAuthenticated()) {
        return <Navigate to={from} replace />;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network latency so the button state is visible.
        setTimeout(() => {
            const account = verifyCredentials(username.trim(), password);

            if (!account) {
                setError('Invalid username or password.');
                setPassword('');
                setLoading(false);
                return;
            }

            startSession(account);
            navigate(from, { replace: true });
        }, 700);
    };

    const clearError = () => error && setError('');

    const fieldClasses =
        'h-11 w-full rounded-xl border border-slate-200 bg-white text-[15px] text-slate-800 shadow-sm shadow-slate-200/50 placeholder:text-slate-300 transition duration-200 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100';

    const labelClasses = 'mb-1.5 block text-xs font-medium text-slate-500';

    const iconClasses =
        'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300';

    return (
        <div
            style={meshBackground}
            className="relative min-h-screen overflow-hidden px-4 py-10 antialiased"
        >
            <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center">
                <div className="w-full max-w-[21rem]">
                    {/* Brand */}
                    <div className="mb-7 text-center">
                        <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20">
                            <FiZap className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-semibold tracking-[0.25em] text-slate-800">
                            THOR
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-400">Sign in to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className={labelClasses}>
                                Username
                            </label>
                            <div className="relative">
                                <FiUser aria-hidden="true" className={iconClasses} />
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        clearError();
                                    }}
                                    autoComplete="username"
                                    autoFocus
                                    required
                                    aria-invalid={Boolean(error)}
                                    placeholder="Enter your username"
                                    className={`${fieldClasses} pl-10 pr-3.5`}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className={labelClasses}>
                                Password
                            </label>
                            <div className="relative">
                                <FiLock aria-hidden="true" className={iconClasses} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        clearError();
                                    }}
                                    autoComplete="current-password"
                                    required
                                    aria-invalid={Boolean(error)}
                                    placeholder="Enter your password"
                                    className={`${fieldClasses} pl-10 pr-11`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-300 transition-colors hover:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
                                >
                                    {showPassword ? (
                                        <FiEyeOff className="h-4 w-4" />
                                    ) : (
                                        <FiEye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50/90 px-3.5 py-2.5"
                            >
                                <FiAlertCircle
                                    aria-hidden="true"
                                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400"
                                />
                                <p className="text-[13px] text-rose-600">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-[15px] font-medium text-white shadow-md shadow-indigo-500/20 transition duration-200 hover:shadow-lg hover:shadow-indigo-500/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-md disabled:active:scale-100"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="h-4 w-4 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-90"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Signing in
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-5 text-center text-[11px] text-slate-400">
                        Sessions expire after 1 hour · Authorized access only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
