import { useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiLogOut, FiMoon, FiSun, FiZap } from 'react-icons/fi';
import { SESSION_DURATION, clearSession } from '../lib/auth';
import { meshBackground } from '../lib/theme';

const TEMPLATES = [
    { to: '/binance-light', exchange: 'Binance', theme: 'Light', accent: '#F0B90B', dark: false },
    { to: '/binance-dark', exchange: 'Binance', theme: 'Dark', accent: '#F0B90B', dark: true },
    { to: '/bybit', exchange: 'Bybit', theme: 'Dark', accent: '#F7A600', dark: true },
    { to: '/bybit-light', exchange: 'Bybit', theme: 'Light', accent: '#F7A600', dark: false },
];

const NEW_TEMPLATES = [
    { to: '/new/binance-light', exchange: 'Binance', theme: 'Light', accent: '#F0B90B', dark: false },
    { to: '/new/binance-dark', exchange: 'Binance', theme: 'Dark', accent: '#F0B90B', dark: true },
    { to: '/new/bybit-dark', exchange: 'Bybit', theme: 'Dark', accent: '#F7A600', dark: true },
    { to: '/new/bybit-light', exchange: 'Bybit', theme: 'Light', accent: '#F7A600', dark: false },
];

const cardBase =
    'flex items-center gap-3.5 rounded-2xl border p-3.5 backdrop-blur-xl transition duration-200';

const Swatch = ({ accent, dark, muted }) => (
    <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
            dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
        } ${muted ? 'opacity-60' : ''}`}
    >
        {dark ? (
            <FiMoon className="h-4 w-4" style={{ color: accent }} />
        ) : (
            <FiSun className="h-4 w-4" style={{ color: accent }} />
        )}
    </div>
);

const TemplateGrid = ({ children }) => (
    <div className="grid gap-3 sm:grid-cols-2">{children}</div>
);

const SectionHeading = ({ title, note }) => (
    <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
        {note && <span className="text-[11px] text-slate-400">{note}</span>}
    </div>
);

const Home = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');

    // A ref, not a local — a plain variable is recreated every render, so the
    // cleanup and the activity handler would each clear a different timer.
    const logoutTimer = useRef(null);

    const handleLogout = useCallback(() => {
        clearTimeout(logoutTimer.current);
        clearSession();
        navigate('/login', { replace: true });
    }, [navigate]);

    useEffect(() => {
        // Expire relative to the original login, so refreshing can't extend a
        // session past its deadline.
        const deadlineFrom = (loginTime) => {
            const elapsed = Date.now() - Number(loginTime || Date.now());
            return Math.max(0, SESSION_DURATION - elapsed);
        };

        const armTimer = () => {
            clearTimeout(logoutTimer.current);
            logoutTimer.current = setTimeout(
                handleLogout,
                deadlineFrom(localStorage.getItem('loginTime')),
            );
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach((event) => window.addEventListener(event, armTimer));
        armTimer();

        return () => {
            clearTimeout(logoutTimer.current);
            events.forEach((event) => window.removeEventListener(event, armTimer));
        };
    }, [handleLogout]);

    return (
        <div style={meshBackground} className="min-h-screen antialiased">
            {/* Header */}
            <header className="border-b border-white/60 bg-white/50 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm shadow-indigo-500/20">
                            <FiZap className="h-4 w-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-semibold tracking-[0.2em] text-slate-800">
                            THOR
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="hidden text-right sm:block">
                            <p className="text-[13px] font-medium leading-tight text-slate-700">
                                {username || 'User'}
                            </p>
                            <p className="text-[11px] leading-tight text-slate-400">
                                {userRole || 'Guest'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 shadow-sm shadow-slate-200/50 transition-colors hover:border-rose-200 hover:text-rose-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                        >
                            <FiLogOut className="h-3.5 w-3.5" />
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
                <div className="mb-8">
                    <h1 className="text-xl font-semibold text-slate-800">Choose a template</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Pick a wallet layout to generate a screenshot.
                    </p>
                </div>

                {/* Existing, working generators */}
                <section className="mb-9">
                    <SectionHeading title="V1 / Old Generator" />
                    <TemplateGrid>
                        {TEMPLATES.map(({ to, exchange, theme, accent, dark }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`${cardBase} group border-white/70 bg-white/70 shadow-sm shadow-slate-200/50 hover:-translate-y-0.5 hover:border-white hover:bg-white/90 hover:shadow-lg hover:shadow-slate-300/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100`}
                            >
                                <Swatch accent={accent} dark={dark} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[15px] font-medium text-slate-800">
                                        {exchange}
                                    </p>
                                    <p className="text-xs text-slate-400">{theme} theme</p>
                                </div>
                                <FiArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500" />
                            </Link>
                        ))}
                    </TemplateGrid>
                </section>

                {/* Redrawn against the latest app screenshots */}
                <section>
                    <SectionHeading title="New Templates" note="updated design" />
                    <TemplateGrid>
                        {NEW_TEMPLATES.map(({ to, exchange, theme, accent, dark }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`${cardBase} group border-white/70 bg-white/70 shadow-sm shadow-slate-200/50 hover:-translate-y-0.5 hover:border-white hover:bg-white/90 hover:shadow-lg hover:shadow-slate-300/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100`}
                            >
                                <Swatch accent={accent} dark={dark} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[15px] font-medium text-slate-800">
                                        {exchange}
                                    </p>
                                    <p className="text-xs text-slate-400">{theme} theme</p>
                                </div>
                                <FiArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500" />
                            </Link>
                        ))}
                    </TemplateGrid>
                </section>

                <p className="mt-10 text-center text-[11px] text-slate-400">
                    Sessions expire after 1 hour · Authorized access only
                </p>
            </main>
        </div>
    );
};

export default Home;
