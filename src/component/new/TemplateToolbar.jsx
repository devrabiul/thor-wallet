import { Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiCheck, FiEdit2, FiLoader } from 'react-icons/fi';

// Floating controls for the /new templates only. The card underneath is a
// full-height phone screenshot, so an inline toolbar scrolls out of reach —
// this one is fixed to the viewport instead. It lives outside
// #withdrawal-card, so it never lands in the downloaded PNG.

// The bar deliberately runs opposite the template it sits on: a light bar over
// the dark pages, a dark bar over the light ones. Same reason the buttons are
// tinted rather than ghosted — the toolbar should read as a control layer
// floating above the screenshot, not as part of it.
const BAR = {
    // Shown on the dark templates.
    light: {
        shell: 'border-black/5 bg-white/90 shadow-black/20',
        divider: 'bg-black/10',
        home: 'bg-[#EEF0F4] text-[#3F4550] hover:bg-[#E2E5EB]',
        edit: 'bg-[#DBEAFE] text-[#1D4ED8] hover:bg-[#BFDBFE]',
    },
    // Shown on the light templates.
    dark: {
        shell: 'border-white/10 bg-[#16181D]/90 shadow-black/40',
        divider: 'bg-white/15',
        home: 'bg-white/10 text-white/85 hover:bg-white/20 hover:text-white',
        edit: 'bg-[#1D4ED8]/35 text-[#93C5FD] hover:bg-[#1D4ED8]/55 hover:text-white',
    },
};

const PILL =
    'flex h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium transition-all duration-150 active:scale-95 sm:px-4';

const TemplateToolbar = ({ dark = false, accent, accentHover, isEditing, onToggleEdit, isDownloading, onDownload }) => {
    const t = dark ? BAR.light : BAR.dark;

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-3">
            <div
                className={`pointer-events-auto flex items-center gap-1.5 rounded-full border p-1.5 shadow-xl backdrop-blur-md ${t.shell}`}
            >
                <Link to="/" title="Back to home" className={`${PILL} ${t.home}`}>
                    <FiArrowLeft className="text-[16px]" />
                    <span className="hidden sm:inline">Home</span>
                </Link>

                <span className={`h-6 w-px ${t.divider}`} />

                <button
                    onClick={onToggleEdit}
                    title={isEditing ? 'Done editing' : 'Edit fields'}
                    aria-pressed={isEditing}
                    className={`${PILL} ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : t.edit}`}
                >
                    {isEditing ? <FiCheck className="text-[16px]" /> : <FiEdit2 className="text-[16px]" />}
                    <span className="hidden sm:inline">{isEditing ? 'Done' : 'Edit'}</span>
                </button>

                <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className={`${PILL} font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60`}
                    style={{ backgroundColor: isDownloading ? accentHover : accent }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = accentHover;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = accent;
                    }}
                >
                    {isDownloading ? (
                        <FiLoader className="animate-spin text-[16px]" />
                    ) : (
                        <FiDownload className="text-[16px]" />
                    )}
                    {isDownloading ? 'Saving...' : 'Download'}
                </button>
            </div>
        </div>
    );
};

export default TemplateToolbar;
