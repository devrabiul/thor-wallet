import { useState } from 'react';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { IoCopyOutline } from 'react-icons/io5';
import { MdOutlineHeadsetMic } from 'react-icons/md';
import { TbReport } from 'react-icons/tb';
import { toPng } from 'html-to-image';
import PhoneStatusBar from './PhoneStatusBar';
import TemplateToolbar from './TemplateToolbar';
import { getFeeAmount } from '../../lib/config';
import { randomBattery, randomSignal, randomTime, randomTxHash } from '../../lib/random';

const THEME = {
    light: {
        bg: '#FFFFFF',
        text: '#0B0E11',
        label: '#787878',
        divider: '#EFEFEF',
        input: 'bg-[#f0f0f0] text-black border border-[#ddd] rounded px-2 py-1 focus:outline-none focus:border-[#F0B90B]',
    },
    dark: {
        bg: '#1F2630',
        text: '#FFFFFF',
        label: '#9DA4AE',
        divider: '#303741',
        input: 'bg-[#2B3139] text-white border border-[#474D57] rounded px-2 py-1 focus:outline-none focus:border-[#F0B90B]',
    },
};

const YELLOW = '#F0B90B';
const BUTTON = '#FCD535';
const GREEN = '#2EBD85';
const RED = '#F6465D';

// Picking a status swaps in that status' copy — the reference screenshots pair
// "Processing" with an ETA line and "Completed" with the transfer notice. The
// note stays editable afterwards, so a custom message only survives until the
// status is changed again.
const NOTES = {
    Completed:
        'Crypto transferred out of Binance. Please contact the recipient platform for your transaction receipt.',
    Processing:
        'Estimated completion time: 2026-08-19 12:52:47.\nYou will receive an email once withdrawal is completed.',
    Failed: 'This withdrawal was not completed. Any deducted amount has been returned to your account.',
};

const STATUS_STYLE = {
    Completed: { color: GREEN, Icon: FiCheckCircle },
    Processing: { color: '#FFFFFF', Icon: FiClock },
    Failed: { color: RED, Icon: FiXCircle },
};

// The yellow mascot that floats above the CTA in the Binance screenshots: a
// rounded square turned 45° with a face on it.
const AiMascot = () => (
    <svg width="48" height="48" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="binance-ai-face" x1="22" y1="3" x2="22" y2="41" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F8D641" />
                <stop offset="0.55" stopColor="#F2B420" />
                <stop offset="1" stopColor="#E58A16" />
            </linearGradient>
        </defs>
        <g transform="rotate(45 22 22)">
            <rect x="8" y="8" width="28" height="28" rx="7" fill="url(#binance-ai-face)" />
        </g>
        <rect x="15.5" y="18" width="2.6" height="5" rx="1.3" fill="#1A1A1A" />
        <rect x="25.9" y="18" width="2.6" height="5" rx="1.3" fill="#1A1A1A" />
        <path
            d="M15.8 25.6h12.4c0 3.3-2.8 5.6-6.2 5.6s-6.2-2.3-6.2-5.6Z"
            fill="#1A1A1A"
        />
    </svg>
);

// Row and CopyButton live at module scope on purpose. Declared inside the
// component they'd be a new component type on every render, so React would
// remount the subtree and the edit-mode inputs would lose focus per keystroke.
const Row = ({ theme, label, children }) => (
    <div className="flex items-start justify-between gap-4 py-[10px]">
        <span className="text-[11.5px] leading-[1.5]" style={{ color: theme.label }}>
            {label}
        </span>
        <div className="text-right text-[11.5px] leading-[1.5]" style={{ color: theme.text }}>
            {children}
        </div>
    </div>
);

const CopyButton = ({ theme, onCopy }) => (
    <button
        onClick={onCopy}
        className="mt-[1px] shrink-0 cursor-pointer transition-colors hover:text-[#F0B90B]"
        style={{ color: theme.label }}
    >
        <span className="inline-block -scale-x-100 text-[13px]">
            <IoCopyOutline />
        </span>
    </button>
);

const BinanceWithdrawal = ({ dark = false }) => {
    const c = dark ? THEME.dark : THEME.light;

    const [isEditing, setIsEditing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Lazy so the random values are drawn once per mount, not per render.
    const [statusBar, setStatusBar] = useState(() => ({
        time: randomTime(),
        battery: randomBattery(),
        signal: randomSignal({ wifi: true }),
    }));

    // Lazy: the stored fee is read once, not on every keystroke re-render.
    const [formData, setFormData] = useState(() => ({
        amount: '1,998.5',
        status: 'Completed',
        note: NOTES.Completed,
        network: 'TRX',
        address: 'TK2NgwbxmY2uksJgwcVTGQ6knbT1hk2SJn',
        txid: randomTxHash(),
        amountTotal: '2,000',
        networkFee: getFeeAmount(),
        wallet: 'Spot Account',
        date: '2026-08-19 12:50:30',
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'status' ? { note: NOTES[value] } : null),
        }));
    };

    const handleStatusBarChange = (e) => {
        setStatusBar((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const handleDownload = async () => {
        const element = document.getElementById('withdrawal-card');
        if (!element) return;

        setIsDownloading(true);

        try {
            const dataUrl = await toPng(element, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: c.bg,
                cacheBust: true,
            });

            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `binance-${dark ? 'dark' : 'light'}-withdrawal-${timestamp}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error generating image. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const { color: statusColor, Icon: StatusIcon } = STATUS_STYLE[formData.status];

    // pb-24 keeps the card's CTA clear of the floating toolbar. It sits on the
    // page wrapper, not the card, so it stays out of the downloaded image.
    return (
        <div className={`flex min-h-screen justify-center p-2 pb-24 font-sans ${dark ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <div className="mx-auto w-full max-w-[400px]">
                <TemplateToolbar
                    dark={dark}
                    accent={YELLOW}
                    accentHover={BUTTON}
                    isEditing={isEditing}
                    onToggleEdit={() => setIsEditing(!isEditing)}
                    isDownloading={isDownloading}
                    onDownload={handleDownload}
                />

                <div
                    id="withdrawal-card"
                    className="relative flex flex-col"
                    style={{
                        backgroundColor: c.bg,
                        color: c.text,
                        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                        minHeight: '100vh',
                        height: 'auto',
                    }}
                >
                    <PhoneStatusBar
                        value={statusBar}
                        onChange={handleStatusBarChange}
                        isEditing={isEditing}
                        fg={c.text}
                        bg={c.bg}
                        inputClass={c.input}
                    />

                    {/* Header */}
                    <div className="mt-[19px] flex items-center justify-between px-4">
                        <FaArrowLeftLong className="text-[17px]" />
                        <h2 className="text-[14.5px] font-semibold">Withdrawal Details</h2>
                        <MdOutlineHeadsetMic className="text-[18px]" />
                    </div>

                    {/* Amount */}
                    <div className="mt-8 flex items-center justify-center gap-2 px-4">
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className={`w-40 text-center text-2xl font-bold ${c.input}`}
                                />
                                <span className="text-2xl font-bold">USDT</span>
                            </>
                        ) : (
                            <span className="text-[27px] font-bold tracking-tight">
                                -{formData.amount} USDT
                            </span>
                        )}
                    </div>

                    {/* Status */}
                    <div className="mt-[9px] flex items-center justify-center gap-1.5 px-4">
                        <StatusIcon className="text-[15px]" style={{ color: statusColor }} />
                        {isEditing ? (
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={`text-[13px] font-medium ${c.input}`}
                                style={{ color: statusColor }}
                            >
                                <option value="Completed">Completed</option>
                                <option value="Processing">Processing</option>
                                <option value="Failed">Failed</option>
                            </select>
                        ) : (
                            <span className="text-[13px] font-medium" style={{ color: statusColor }}>
                                {formData.status}
                            </span>
                        )}
                    </div>

                    {/* Note + help link */}
                    <div className="mt-2 px-6">
                        {isEditing ? (
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                rows={3}
                                className={`w-full text-xs ${c.input}`}
                            />
                        ) : (
                            <p
                                className="text-center text-[11px] leading-[1.45] whitespace-pre-line"
                                style={{ color: c.label }}
                            >
                                {formData.note}
                            </p>
                        )}
                        <p className="mt-1 text-center text-[10.5px] font-semibold" style={{ color: YELLOW }}>
                            Why hasn&apos;t my withdrawal arrived?
                        </p>
                    </div>

                    <div className="mt-7 h-px w-full" style={{ backgroundColor: c.divider }} />

                    {/* Details */}
                    <div className="mt-[26px] px-4">
                        <Row theme={c} label="Network">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="network"
                                    value={formData.network}
                                    onChange={handleChange}
                                    className={`w-28 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                formData.network
                            )}
                        </Row>

                        <Row theme={c} label="Address">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={`w-56 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                <div className="flex items-start justify-end gap-1.5">
                                    <div className="flex flex-col items-end">
                                        <span className="max-w-[174px] text-right break-all">
                                            {formData.address}
                                        </span>
                                        <span className="mt-1 text-[11px] font-semibold" style={{ color: YELLOW }}>
                                            Save Address
                                        </span>
                                    </div>
                                    <CopyButton theme={c} onCopy={() => copyToClipboard(formData.address)} />
                                </div>
                            )}
                        </Row>

                        <Row theme={c} label="Txid">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="txid"
                                    value={formData.txid}
                                    onChange={handleChange}
                                    className={`w-56 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                <div className="flex items-start justify-end gap-1.5">
                                    <span className="max-w-[181px] text-right break-all underline">
                                        {formData.txid}
                                    </span>
                                    <CopyButton theme={c} onCopy={() => copyToClipboard(formData.txid)} />
                                </div>
                            )}
                        </Row>

                        <Row theme={c} label="Amount">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="amountTotal"
                                    value={formData.amountTotal}
                                    onChange={handleChange}
                                    className={`w-28 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                `${formData.amountTotal} USDT`
                            )}
                        </Row>

                        <Row theme={c} label="Network fee">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="networkFee"
                                    value={formData.networkFee}
                                    onChange={handleChange}
                                    className={`w-28 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                `${formData.networkFee} USDT`
                            )}
                        </Row>

                        <Row theme={c} label="Withdrawal Wallet">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="wallet"
                                    value={formData.wallet}
                                    onChange={handleChange}
                                    className={`w-36 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                formData.wallet
                            )}
                        </Row>

                        <Row theme={c} label="Date">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={`w-44 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                formData.date
                            )}
                        </Row>
                    </div>

                    {/* Scam Report */}
                    <div className="mt-4 flex justify-center">
                        <span
                            className="flex items-center gap-1 text-[11.5px]"
                            style={{ color: c.label }}
                        >
                            <TbReport className="text-[14px]" />
                            Scam Report
                        </span>
                    </div>

                    <div className="flex-1" />

                    {/* Mascot sits just above the CTA, hugging the right edge */}
                    <div className="flex justify-end pr-3 pb-6">
                        <AiMascot />
                    </div>

                    <div className="px-4 pb-9">
                        <button
                            className="w-full rounded-lg py-3 text-[13px] font-semibold text-black"
                            style={{ backgroundColor: BUTTON }}
                        >
                            Withdraw Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BinanceWithdrawal;
