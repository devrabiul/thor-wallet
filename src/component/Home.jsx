import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiArrowRight,
    FiCheck,
    FiChevronDown,
    FiClipboard,
    FiLogOut,
    FiMoon,
    FiSliders,
    FiSun,
    FiUser,
    FiX,
    FiZap,
} from 'react-icons/fi';
import { SESSION_DURATION, clearSession } from '../lib/auth';
import {
    DEFAULT_ADDRESS,
    DEFAULT_FEE,
    DEFAULT_SHOW_ASSISTANT,
    clearAddress,
    clearFeeAmount,
    clearShowAssistant,
    getAddress,
    getFeeAmount,
    getShowAssistant,
    setAddress,
    setFeeAmount,
    setShowAssistant,
} from '../lib/config';
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

// Middle-truncated, because the ends of a wallet address are what identify it —
// the run of characters in the middle is noise at a glance.
const shortAddress = (address) =>
    address.length > 18 ? `${address.slice(0, 7)}…${address.slice(-6)}` : address;

const isDefaultValues = (values) =>
    values.fee === DEFAULT_FEE &&
    values.address === DEFAULT_ADDRESS &&
    values.showAssistant === DEFAULT_SHOW_ASSISTANT;

// One instance of this lives in Home and feeds both the desktop panel and the
// mobile sheet. Two independent copies would drift the moment one of them
// saved, and the hidden one would still be showing the old values on resize.
const useSettings = () => {
    const [values, setValues] = useState(() => ({
        fee: getFeeAmount(),
        address: getAddress(),
        showAssistant: getShowAssistant(),
    }));
    const [draft, setDraft] = useState(values);
    const [saved, setSaved] = useState(false);

    const savedTimer = useRef(null);
    useEffect(() => () => clearTimeout(savedTimer.current), []);

    // `values` can't be read back inside discard: closing right after a save
    // runs in the same tick, so the closure still holds the pre-save pair and
    // would roll the fields back to it. The ref is written synchronously.
    const valuesRef = useRef(values);

    const flashSaved = useCallback((next) => {
        valuesRef.current = next;
        setValues(next);
        setDraft(next);
        setSaved(true);
        clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaved(false), 2000);
    }, []);

    // Stable identity: SettingsSheet's setup effect keys off the close handler
    // that wraps this, and a fresh function each render would re-run it —
    // reselecting the input on every keystroke.
    const discard = useCallback(() => setDraft(valuesRef.current), []);

    return {
        values,
        draft,
        saved,
        // The draft counts too: reset also puts the fields back, so with
        // defaults stored and an edited-but-unsaved field it still has work to
        // do — keying this off `values` alone left the button dead in exactly
        // the case people press it in.
        isDefault: isDefaultValues(values) && isDefaultValues(draft),
        setField: (field, value) => setDraft((prev) => ({ ...prev, [field]: value })),
        save: () =>
            flashSaved({
                fee: setFeeAmount(draft.fee),
                address: setAddress(draft.address),
                showAssistant: setShowAssistant(draft.showAssistant),
            }),
        reset: () =>
            flashSaved({
                fee: clearFeeAmount(),
                address: clearAddress(),
                showAssistant: clearShowAssistant(),
            }),
        // Drop an unsaved edit — the sheet closing shouldn't leave a field
        // showing a value that was never stored.
        discard,
    };
};

const fieldClasses =
    'thor-field h-11 w-full rounded-xl border border-indigo-500 bg-indigo-50 px-3.5 text-slate-800 shadow-sm shadow-indigo-200/50 placeholder:text-slate-700 transition duration-200 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600';

const labelClasses = 'mb-1.5 block text-xs font-medium text-slate-700';

// Shared by the panel and the sheet, so the two can't drift apart in layout or
// validation. `idPrefix` is a prop because both are mounted at once on desktop.
const SettingsFields = ({ setting, idPrefix, firstFieldRef, onSave }) => {
    const { draft, saved, isDefault, setField, save, reset } = setting;

    const [pasted, setPasted] = useState(false);
    const addressRef = useRef(null);
    const pastedTimer = useRef(null);
    useEffect(() => () => clearTimeout(pastedTimer.current), []);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text.trim()) return;

            setField('address', text.trim());
            setPasted(true);
            clearTimeout(pastedTimer.current);
            pastedTimer.current = setTimeout(() => setPasted(false), 1500);
        } catch {
            // Firefox doesn't expose readText to pages at all, and any browser
            // refuses it once the permission is denied. Put the caret in the
            // field and select it so ⌘V / Ctrl+V still lands on the right spot.
            addressRef.current?.focus();
            addressRef.current?.select();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        save();
        onSave?.();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="sm:w-36 sm:shrink-0">
                    <label htmlFor={`${idPrefix}-fee`} className={labelClasses}>
                        Fee amount (USDT)
                    </label>
                    <input
                        id={`${idPrefix}-fee`}
                        ref={firstFieldRef}
                        name="feeAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        value={draft.fee}
                        onChange={(event) => setField('fee', event.target.value)}
                        placeholder={DEFAULT_FEE}
                        className={`${fieldClasses} text-[15px]`}
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <label htmlFor={`${idPrefix}-address`} className={labelClasses}>
                        Wallet address
                    </label>
                    <div className="relative">
                        <input
                            id={`${idPrefix}-address`}
                            ref={addressRef}
                            name="walletAddress"
                            type="text"
                            value={draft.address}
                            onChange={(event) => setField('address', event.target.value)}
                            placeholder={DEFAULT_ADDRESS}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            className={`${fieldClasses} pr-11 font-mono text-[13px]`}
                        />
                        <button
                            type="button"
                            onClick={handlePaste}
                            aria-label="Paste address from clipboard"
                            title="Paste from clipboard"
                            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-indigo-200/70 hover:text-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                        >
                            {pasted ? (
                                <FiCheck aria-hidden="true" className="h-4 w-4 text-emerald-700" />
                            ) : (
                                <FiClipboard aria-hidden="true" className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Switch rather than a checkbox: it's a display state that takes
                effect elsewhere, and the track reads as on/off at a glance. */}
            <label
                htmlFor={`${idPrefix}-assistant`}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white/60 px-3 py-2.5"
            >
                <input
                    id={`${idPrefix}-assistant`}
                    type="checkbox"
                    role="switch"
                    checked={draft.showAssistant}
                    onChange={(event) => setField('showAssistant', event.target.checked)}
                    className="peer sr-only"
                />
                <span
                    aria-hidden="true"
                    className="relative h-6 w-10 shrink-0 rounded-full bg-slate-400 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-indigo-700 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-700 peer-focus-visible:ring-offset-2"
                />
                <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-slate-800">
                        Assistant icon
                    </span>
                    <span className="block text-[12px] text-slate-700">
                        The floating mascot on the new Binance templates · hidden by default
                    </span>
                </span>
            </label>

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
        </form>
    );
};

const SettingsHeading = ({ id }) => (
    <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
            <FiSliders aria-hidden="true" className="h-4 w-4 text-indigo-800" />
        </span>
        <div className="min-w-0">
            <h2 id={id} className="text-[15px] font-semibold text-slate-800">
                Template defaults
            </h2>
            <p className="text-[13px] text-slate-700">Starting values for every template</p>
        </div>
    </div>
);

const CurrentValues = ({ values }) => (
    <p aria-live="polite" className="mt-3 text-[13px] text-slate-700">
        Currently <span className="font-semibold text-slate-800">{values.fee} USDT</span> ·{' '}
        <span className="font-mono text-slate-800">{shortAddress(values.address)}</span> · assistant{' '}
        <span className="font-semibold text-slate-800">
            {values.showAssistant ? 'shown' : 'hidden'}
        </span>
        , saved to this browser.
    </p>
);

// Desktop only — on mobile the same controls live in SettingsSheet, reached from
// the floating button, so the phone screen stays a list of templates.
const SettingsPanel = ({ setting }) => (
    <section className="mb-7 hidden sm:mb-9 sm:block">
        <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm shadow-slate-200/50 backdrop-blur-xl sm:p-5">
            <SettingsHeading />
            <div className="mt-4">
                <SettingsFields setting={setting} idPrefix="settings" />
            </div>
            <CurrentValues values={setting.values} />
        </div>
    </section>
);

const SettingsSheet = ({ setting, onClose }) => {
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
                aria-labelledby="settings-sheet-title"
                className="thor-sheet absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/70 bg-white px-4 pb-7 pt-3 shadow-2xl shadow-slate-900/20"
            >
                <span
                    aria-hidden="true"
                    className="mx-auto mb-4 block h-1 w-10 rounded-full bg-slate-300"
                />

                <div className="flex items-start justify-between gap-3">
                    <SettingsHeading id="settings-sheet-title" />
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
                    <SettingsFields
                        setting={setting}
                        idPrefix="settings-sheet"
                        firstFieldRef={inputRef}
                        onSave={onClose}
                    />
                </div>

                <CurrentValues values={setting.values} />
            </div>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    // Display name, not the login id — sessions started before displayName
    // existed fall back to the username rather than rendering blank.
    const displayName = localStorage.getItem('displayName') || localStorage.getItem('username');
    const position = localStorage.getItem('userRole');

    const [showV1, setShowV1] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const settings = useSettings();
    const fabRef = useRef(null);

    useEffect(() => {
        // Setting the same boolean twice is a no-op in React, so this doesn't
        // re-render on every scroll event — only on the two crossings.
        const onScroll = () => setScrolled(window.scrollY > 4);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const { discard } = settings;
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
            {/* No full-width bar: a slab of its own colour sat on top of the
                mesh and cut the page in two. This is a floating capsule with
                the background running past it on every side, and its surface is
                translucent enough to take the hue of whatever mesh is behind
                it — indigo at the left edge, sky at the right — so it reads as
                part of the background rather than a lid on it. */}
            <header className="sticky top-0 z-20 px-3 pt-3 sm:px-5 sm:pt-4">
                <div
                    className={`mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-white/50 px-3 py-2 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 sm:px-4 sm:py-2.5 ${
                        scrolled
                            ? // #FAFAFF is the mesh's own base colour, not white:
                              // near-opaque is the only way to stop cards ghosting
                              // through, and plain white would put back the slab
                              // this design exists to avoid.
                              'bg-[#FAFAFF]/95 shadow-lg shadow-indigo-950/10'
                            : 'bg-white/45 shadow-md shadow-indigo-950/5'
                    }`}
                >
                    <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-700 to-violet-700 shadow-md shadow-indigo-600/30">
                            <FiZap
                                aria-hidden="true"
                                className="h-[18px] w-[18px] text-white"
                                strokeWidth={2.5}
                            />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-[15px] font-semibold leading-tight tracking-[0.22em] text-slate-900">
                                THOR
                            </span>
                            {/* First thing to go when the capsule gets tight. */}
                            <span className="hidden text-[11px] leading-tight text-slate-600 sm:block">
                                Wallet screenshot studio
                            </span>
                        </span>
                    </div>

                    {/* One surface, not three: the capsule already provides the
                        chrome, so the account sits directly on it and only Log
                        out — an action — is drawn as a control. */}
                    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                        <div className="flex items-center gap-2">
                            {/* Outlined, not filled: a second solid indigo blob
                                beside the logo tile read as a duplicate mark. */}
                            <span
                                aria-hidden="true"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/75 text-indigo-800 ring-1 ring-inset ring-indigo-900/15"
                            >
                                <FiUser className="h-4 w-4" strokeWidth={2} />
                            </span>
                            {/* Below 360px this would push the account onto the
                                wordmark; the initial still identifies it, and Log
                                out keeps its label at every width. */}
                            <span className="min-w-0 leading-tight max-[359px]:hidden">
                                <span className="block truncate text-[13px] font-semibold text-slate-900">
                                    {displayName || 'User'}
                                </span>
                                <span className="block truncate text-[10.5px] text-slate-600">
                                    {position || 'Guest'}
                                </span>
                            </span>
                        </div>

                        <span aria-hidden="true" className="h-6 w-px bg-slate-900/10" />

                        <button
                            onClick={handleLogout}
                            className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-rose-500/10 hover:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2"
                        >
                            <FiLogOut aria-hidden="true" className="h-4 w-4" />
                            Log out
                        </button>
                    </div>
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

                <SettingsPanel setting={settings} />

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

            {/* Carries the fee, so the value most often checked needs no tap.
                The address is too long for a pill and lives inside the sheet. */}
            <button
                ref={fabRef}
                type="button"
                onClick={() => setSheetOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={sheetOpen}
                aria-label={`Template defaults, fee ${settings.values.fee} USDT, address ${settings.values.address}`}
                className="fixed bottom-5 right-4 z-30 flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-700 to-violet-700 pl-4 pr-5 text-[15px] font-medium text-white shadow-lg shadow-indigo-900/30 transition duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 sm:hidden"
            >
                <FiSliders aria-hidden="true" className="h-4 w-4" />
                <span aria-hidden="true">Fee {settings.values.fee}</span>
            </button>

            {sheetOpen && <SettingsSheet setting={settings} onClose={closeSheet} />}
        </div>
    );
};

export default Home;
