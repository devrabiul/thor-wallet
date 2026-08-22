import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiArrowRight,
    FiCheck,
    FiChevronDown,
    FiLogOut,
    FiMoon,
    FiSliders,
    FiSun,
    FiX,
    FiZap,
} from 'react-icons/fi';
import { SESSION_DURATION, clearSession } from '../lib/auth';
import { DEFAULT_FEE, clearFeeAmount, getFeeAmount, setFeeAmount } from '../lib/config';
import { meshBackground } from '../lib/theme';

const NEW_TEMPLATES = [
    { to: '/new/binance-dark', exchange: 'Binance', accent: '#F0B90B', dark: true },
    { to: '/new/binance-light', exchange: 'Binance', accent: '#F0B90B', dark: false },
    { to: '/new/bybit-dark', exchange: 'Bybit', accent: '#F7A600', dark: true },
    { to: '/new/bybit-light', exchange: 'Bybit', accent: '#F7A600', dark: false },
];

const V1_TEMPLATES = [
    { to: '/binance-dark', exchange: 'Binance', accent: '#F0B90B', dark: true },
    { to: '/binance-light', exchange: 'Binance', accent: '#F0B90B', dark: false },
    { to: '/bybit', exchange: 'Bybit', accent: '#F7A600', dark: true },
    { to: '/bybit-light', exchange: 'Bybit', accent: '#F7A600', dark: false },
];

// Lifted from the templates themselves so the thumbnail reads as the screen it
// opens, not as a generic light/dark chip.
const SKIN = {
    dark: { page: '#181A20', bar: '#1E2329', line: '#2B3139', text: '#EAECEF', muted: '#5E6673' },
    light: { page: '#FFFFFF', bar: '#F5F5F5', line: '#E6E8EA', text: '#1E2329', muted: '#AEB4BC' },
};

// Miniature of a withdrawal receipt: status bar, tick, amount, detail rows.
// Decorative only — the card's text carries the meaning for screen readers.
const Thumbnail = ({ accent, dark }) => {
    const s = dark ? SKIN.dark : SKIN.light;

    return (
        <div
            aria-hidden="true"
            className="h-[74px] w-[50px] shrink-0 overflow-hidden rounded-lg border sm:h-[82px] sm:w-[56px]"
            style={{ backgroundColor: s.page, borderColor: s.line }}
        >
            <div
                className="flex h-3 items-center justify-between px-1"
                style={{ backgroundColor: s.bar }}
            >
                <span
                    className="block h-[3px] w-2.5 rounded-full"
                    style={{ backgroundColor: s.muted }}
                />
                <span
                    className="block h-[3px] w-1.5 rounded-full"
                    style={{ backgroundColor: s.muted }}
                />
            </div>

            <div className="flex flex-col items-center gap-[3px] pt-2">
                <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
                <span
                    className="block h-[5px] w-7 rounded-full"
                    style={{ backgroundColor: s.text }}
                />
                <span
                    className="block h-[3px] w-4 rounded-full"
                    style={{ backgroundColor: s.muted }}
                />
            </div>

            <div className="mt-2 space-y-[4px] px-1.5">
                {[0, 1, 2].map((row) => (
                    <div key={row} className="flex items-center justify-between gap-1">
                        <span
                            className="block h-[3px] w-2.5 rounded-full"
                            style={{ backgroundColor: s.muted }}
                        />
                        <span
                            className="block h-[3px] w-5 rounded-full"
                            style={{ backgroundColor: s.line }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const TemplateCard = ({ to, exchange, accent, dark, badge }) => (
    <Link
        to={to}
        className="group flex items-center gap-3.5 rounded-2xl border border-white/70 bg-white/75 p-3 shadow-sm shadow-slate-200/50 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:shadow-lg hover:shadow-slate-300/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 active:translate-y-0 sm:p-3.5"
    >
        <Thumbnail accent={accent} dark={dark} />

        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                />
                <p className="text-[15px] font-semibold text-slate-800">{exchange}</p>
                {badge && (
                    <span className="rounded-full bg-indigo-100 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-indigo-800">
                        {badge}
                    </span>
                )}
            </div>

            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-700">
                {dark ? (
                    <FiMoon aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                    <FiSun aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                {dark ? 'Dark' : 'Light'} theme
            </p>
        </div>

        <FiArrowRight
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5"
        />
    </Link>
);

const TemplateGrid = ({ templates, badge, id }) => (
    <div id={id} className="grid gap-3 sm:grid-cols-2">
        {templates.map((template) => (
            <TemplateCard key={template.to} {...template} badge={badge} />
        ))}
    </div>
);

// One instance of this lives in Home and feeds both the desktop panel and the
// mobile sheet. Two independent copies would drift the moment one of them
// saved, and the hidden one would still be showing the old amount on resize.
const useFeeSetting = () => {
    const [fee, setFee] = useState(() => getFeeAmount());
    const [draft, setDraft] = useState(fee);
    const [saved, setSaved] = useState(false);

    const savedTimer = useRef(null);
    useEffect(() => () => clearTimeout(savedTimer.current), []);

    // `fee` state can't be read back inside discard: closing right after a save
    // runs in the same tick, so the closure still holds the pre-save amount and
    // would roll the field back to it. The ref is written synchronously.
    const feeRef = useRef(fee);

    const flashSaved = useCallback((value) => {
        feeRef.current = value;
        setFee(value);
        setDraft(value);
        setSaved(true);
        clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaved(false), 2000);
    }, []);

    // Stable identity: FeeSheet's setup effect keys off the close handler that
    // wraps this, and a fresh function each render would re-run it — reselecting
    // the input on every keystroke.
    const discard = useCallback(() => setDraft(feeRef.current), []);

    return {
        fee,
        draft,
        saved,
        isDefault: fee === DEFAULT_FEE,
        setDraft,
        save: () => flashSaved(setFeeAmount(draft)),
        reset: () => flashSaved(clearFeeAmount()),
        // Drop an unsaved edit — the sheet closing shouldn't leave the field
        // showing a number that was never stored.
        discard,
    };
};

// Shared by the panel and the sheet, so the two can't drift apart in layout or
// validation. `id` is a prop because both are mounted at once on desktop.
const FeeFields = ({ setting, id, inputRef, onSave }) => {
    const { draft, saved, isDefault, setDraft, save, reset } = setting;

    const handleSubmit = (event) => {
        event.preventDefault();
        save();
        onSave?.();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
                <div className="sm:max-w-[13rem] sm:flex-1">
                    <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-700">
                        Amount in USDT
                    </label>
                    <input
                        id={id}
                        ref={inputRef}
                        name="feeAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={DEFAULT_FEE}
                        className="thor-field h-11 w-full rounded-xl border border-indigo-500 bg-indigo-50 px-3.5 text-[15px] text-slate-800 shadow-sm shadow-indigo-200/50 placeholder:text-slate-700 transition duration-200 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>

                <div className="flex gap-2.5">
                    <button
                        type="submit"
                        className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-700 to-violet-700 px-5 text-[15px] font-medium text-white shadow-md shadow-indigo-500/20 transition duration-200 hover:shadow-lg hover:shadow-indigo-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 active:scale-[0.99] sm:flex-none"
                    >
                        {saved && <FiCheck aria-hidden="true" className="h-4 w-4" />}
                        {saved ? 'Saved' : 'Save'}
                    </button>

                    <button
                        type="button"
                        onClick={reset}
                        disabled={isDefault}
                        className="h-11 flex-1 rounded-xl border border-slate-400 bg-white/80 px-4 text-[15px] font-medium text-slate-700 transition-colors hover:border-slate-500 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </form>
    );
};

const FeeHeading = ({ id }) => (
    <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
            <FiSliders aria-hidden="true" className="h-4 w-4 text-indigo-800" />
        </span>
        <div className="min-w-0">
            <h2 id={id} className="text-[15px] font-semibold text-slate-800">
                Fee amount
            </h2>
            <p className="text-[13px] text-slate-700">
                Starting fee for every template · default {DEFAULT_FEE}
            </p>
        </div>
    </div>
);

// Desktop only — on mobile the same controls live in FeeSheet, reached from the
// floating button, so the phone screen stays a list of templates.
const FeePanel = ({ setting }) => (
    <section className="mb-7 hidden sm:mb-9 sm:block">
        <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm shadow-slate-200/50 backdrop-blur-xl sm:p-5">
            <FeeHeading />
            <div className="mt-4">
                <FeeFields setting={setting} id="feeAmount" />
            </div>
            <p aria-live="polite" className="mt-3 text-[13px] text-slate-700">
                Currently <span className="font-semibold text-slate-800">{setting.fee} USDT</span>,
                saved to this browser.
            </p>
        </div>
    </section>
);

const FeeSheet = ({ setting, onClose }) => {
    const sheetRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Select rather than just focus: the field always has a value, and
        // replacing it is the reason the sheet was opened.
        inputRef.current?.select();

        const { body } = document;
        const previousOverflow = body.style.overflow;
        body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }

            if (event.key !== 'Tab') return;

            // Keep Tab inside the sheet — with the page behind it inert, focus
            // landing on a template card is a dead end for keyboard users.
            const focusable = sheetRef.current?.querySelectorAll(
                'button:not([disabled]), input:not([disabled])',
            );
            if (!focusable?.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            body.style.overflow = previousOverflow;
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-40 sm:hidden">
            <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onClick={onClose}
                className="thor-scrim absolute inset-0 h-full w-full cursor-default bg-slate-900/40 backdrop-blur-sm"
            />

            <div
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="fee-sheet-title"
                className="thor-sheet absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/70 bg-white px-4 pb-7 pt-3 shadow-2xl shadow-slate-900/20"
            >
                <span
                    aria-hidden="true"
                    className="mx-auto mb-4 block h-1 w-10 rounded-full bg-slate-300"
                />

                <div className="flex items-start justify-between gap-3">
                    <FeeHeading id="fee-sheet-title" />
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
                    >
                        <FiX aria-hidden="true" className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4">
                    <FeeFields
                        setting={setting}
                        id="feeAmountSheet"
                        inputRef={inputRef}
                        onSave={onClose}
                    />
                </div>

                <p aria-live="polite" className="mt-3 text-[13px] text-slate-700">
                    Currently{' '}
                    <span className="font-semibold text-slate-800">{setting.fee} USDT</span>, saved
                    to this browser.
                </p>
            </div>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');

    const [showV1, setShowV1] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const feeSetting = useFeeSetting();
    const fabRef = useRef(null);

    const { discard } = feeSetting;
    const closeSheet = useCallback(() => {
        setSheetOpen(false);
        discard();
        // Send focus back to what opened the sheet, or a keyboard user is
        // dropped at the top of the document.
        fabRef.current?.focus();
    }, [discard]);

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
        <div style={meshBackground} className="min-h-dvh antialiased">
            {/* 85%, not 70%: cards scrolling under a lighter tint show through
                the username and the header reads as smeared. */}
            <header className="sticky top-0 z-10 border-b border-white/60 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-700 to-violet-700 shadow-sm shadow-indigo-500/20">
                            <FiZap
                                aria-hidden="true"
                                className="h-4 w-4 text-white"
                                strokeWidth={2.5}
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold tracking-[0.2em] text-slate-800">
                                THOR
                            </p>
                            {/* Kept on mobile too — knowing which account is signed
                                in matters more than the few pixels it costs. */}
                            <p className="truncate text-[11px] leading-tight text-slate-700">
                                {username || 'User'}
                                {userRole ? ` · ${userRole}` : ''}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-400 bg-white/80 px-3 text-[13px] font-medium text-slate-700 transition-colors hover:border-rose-500 hover:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 sm:px-3.5"
                    >
                        <FiLogOut aria-hidden="true" className="h-4 w-4" />
                        Log out
                    </button>
                </div>
            </header>

            {/* pb-28 on mobile keeps the floating button off the last card. */}
            <main className="mx-auto max-w-3xl px-4 pb-28 pt-7 sm:px-5 sm:pb-10 sm:pt-10">
                <div className="mb-5 sm:mb-7">
                    <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                        Choose a template
                    </h1>
                    <p className="mt-1 text-sm text-slate-700">
                        Pick a wallet layout, edit the fields, then download the screenshot.
                    </p>
                </div>

                <FeePanel setting={feeSetting} />

                <section>
                    <div className="mb-3 flex items-baseline gap-2">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                            Templates
                        </h2>
                        <span className="text-[11px] text-slate-600">latest design</span>
                    </div>

                    <TemplateGrid templates={NEW_TEMPLATES} badge="New" />
                </section>

                <section className="mt-7 sm:mt-9">
                    <button
                        type="button"
                        onClick={() => setShowV1((open) => !open)}
                        aria-expanded={showV1}
                        aria-controls="v1-templates"
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-400 bg-white/70 px-4 text-[13px] font-medium text-slate-700 backdrop-blur-xl transition-colors hover:border-slate-500 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 sm:w-auto"
                    >
                        <FiChevronDown
                            aria-hidden="true"
                            className={`h-4 w-4 transition-transform duration-200 ${
                                showV1 ? 'rotate-180' : ''
                            }`}
                        />
                        {showV1 ? 'Hide' : 'Show'} V1 templates
                        <span className="rounded-full bg-slate-200 px-1.5 py-px text-[11px] text-slate-700">
                            {V1_TEMPLATES.length}
                        </span>
                    </button>

                    {showV1 && (
                        <div className="mt-3">
                            <TemplateGrid id="v1-templates" templates={V1_TEMPLATES} badge="V1" />
                        </div>
                    )}
                </section>

                <p className="mt-9 text-center text-[11px] text-slate-700">
                    Sessions expire after 1 hour · Authorized access only
                </p>
            </main>

            {/* Carries the current amount, so the common case — checking the fee
                — needs no tap at all. */}
            <button
                ref={fabRef}
                type="button"
                onClick={() => setSheetOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={sheetOpen}
                aria-label={`Fee amount, currently ${feeSetting.fee} USDT`}
                className="fixed bottom-5 right-4 z-30 flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-700 to-violet-700 pl-4 pr-5 text-[15px] font-medium text-white shadow-lg shadow-indigo-900/30 transition duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 sm:hidden"
            >
                <FiSliders aria-hidden="true" className="h-4 w-4" />
                <span aria-hidden="true">Fee {feeSetting.fee}</span>
            </button>

            {sheetOpen && <FeeSheet setting={feeSetting} onClose={closeSheet} />}
        </div>
    );
};

export default Home;
