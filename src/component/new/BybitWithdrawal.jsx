import { useState } from 'react';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { IoCopyOutline } from 'react-icons/io5';
import { toPng } from 'html-to-image';
import PhoneStatusBar from './PhoneStatusBar';
import TemplateToolbar from './TemplateToolbar';
import { getAddress, getFeeAmount } from '../../lib/config';
import { CARD_HEIGHT, cardCaptureOptions } from '../../lib/card';
import { randomBattery, randomSignal, randomSignalBars, randomTime, randomTxHash } from '../../lib/random';

const THEME = {
    light: {
        bg: '#FFFFFF',
        text: '#121214',
        label: '#6B6D73',
        border: '#E3E3E3',
        input: 'bg-[#f0f0f0] text-black border border-[#ddd] rounded px-2 py-1 focus:outline-none focus:border-[#F7A600]',
    },
    dark: {
        bg: '#000000',
        text: '#FFFFFF',
        label: '#81858C',
        border: '#3C3C3C',
        input: 'bg-[#1C1C1E] text-white border border-[#3C3C3C] rounded px-2 py-1 focus:outline-none focus:border-[#F7A600]',
    },
};

const STATUS_STYLE = {
    'Withdrawal Completed': { color: '#20B26C', Icon: FiCheckCircle },
    'Withdrawal Processing': { color: '#F7A600', Icon: FiClock },
    'Withdrawal Failed': { color: '#EF454A', Icon: FiXCircle },
};

// Declared at module scope so they keep a stable component identity across
// renders — otherwise React remounts them and edit-mode inputs lose focus.
const Row = ({ theme, label, children }) => (
    <div className="flex items-start justify-between gap-4 py-[8px]">
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
        className="mt-[1px] shrink-0 cursor-pointer transition-colors hover:text-[#F7A600]"
        style={{ color: theme.label }}
    >
        <span className="inline-block -scale-x-100 text-[13px]">
            <IoCopyOutline />
        </span>
    </button>
);

const BybitWithdrawal = ({ dark = false }) => {
    const c = dark ? THEME.dark : THEME.light;

    const [isEditing, setIsEditing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Lazy so the random values are drawn once per mount, not per render.
    const [statusBar, setStatusBar] = useState(() => ({
        time: randomTime(),
        battery: randomBattery(),
        signal: randomSignal({ wifi: true }),
        signalBars: randomSignalBars(),
    }));

    // Lazy: the stored fee is read once, not on every keystroke re-render.
    const [formData, setFormData] = useState(() => ({
        quantity: '1,000',
        status: 'Withdrawal Completed',
        withdrawalAccount: 'Funding Account',
        fees: getFeeAmount(),
        chainType: 'TRON (TRC20)',
        time: '2026-08-19 22:32:57',
        withdrawalAddress: getAddress(),
        transactionHash: randomTxHash(),
    }));

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
            const dataUrl = await toPng(element, cardCaptureOptions(element, c.bg));

            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `bybit-${dark ? 'dark' : 'light'}-withdrawal-${timestamp}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error generating image. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const { color: statusColor, Icon: StatusIcon } =
        STATUS_STYLE[formData.status] ?? STATUS_STYLE['Withdrawal Completed'];

    // pb-24 keeps the card's CTA clear of the floating toolbar. It sits on the
    // page wrapper, not the card, so it stays out of the downloaded image.
    return (
        <div className={`flex min-h-dvh justify-center p-2 pb-24 font-sans ${dark ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <div className="mx-auto w-full max-w-[400px]">
                <TemplateToolbar
                    dark={dark}
                    accent="#F7A600"
                    accentHover="#FFC13C"
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
                        minHeight: `${CARD_HEIGHT}px`,
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

                    {/* Header — the title is centred on the card, not between the
                        icons, since Bybit has no trailing action here. */}
                    <div className="relative mt-[30px] flex items-center justify-center px-4">
                        <FaArrowLeftLong className="absolute left-4 text-[17px]" />
                        <h2 className="text-[14.5px] font-semibold">Withdrawal Details</h2>
                    </div>

                    {/* Quantity */}
                    <div className="mt-11 text-center">
                        <p className="text-[11.5px]" style={{ color: c.label }}>
                            Quantity
                        </p>
                        <div className="mt-1.5 flex items-center justify-center gap-1.5">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className={`w-36 text-center text-xl font-bold ${c.input}`}
                                    />
                                    <span className="text-xl font-bold">USDT</span>
                                </>
                            ) : (
                                <span className="text-[18px] font-bold tracking-tight">
                                    {formData.quantity} USDT
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="mt-1.5 flex items-center justify-center gap-1.5">
                        <StatusIcon className="text-[13px]" style={{ color: statusColor }} />
                        {isEditing ? (
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={`text-[12px] font-medium ${c.input}`}
                                style={{ color: statusColor }}
                            >
                                <option value="Withdrawal Completed">Withdrawal Completed</option>
                                <option value="Withdrawal Processing">Withdrawal Processing</option>
                                <option value="Withdrawal Failed">Withdrawal Failed</option>
                            </select>
                        ) : (
                            <span className="text-[12px] font-medium" style={{ color: statusColor }}>
                                {formData.status}
                            </span>
                        )}
                    </div>

                    {/* Details */}
                    <div className="mt-[62px] px-4">
                        <Row theme={c} label="Withdrawal Account">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="withdrawalAccount"
                                    value={formData.withdrawalAccount}
                                    onChange={handleChange}
                                    className={`w-40 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                formData.withdrawalAccount
                            )}
                        </Row>

                        <Row theme={c} label="Fees">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="fees"
                                    value={formData.fees}
                                    onChange={handleChange}
                                    className={`w-24 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                formData.fees
                            )}
                        </Row>

                        <Row theme={c} label="Chain Type">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="chainType"
                                    value={formData.chainType}
                                    onChange={handleChange}
                                    className={`w-40 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                formData.chainType
                            )}
                        </Row>

                        <Row theme={c} label="Time">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className={`w-44 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                formData.time
                            )}
                        </Row>

                        <Row theme={c} label="Withdrawal Address">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="withdrawalAddress"
                                    value={formData.withdrawalAddress}
                                    onChange={handleChange}
                                    className={`w-52 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                <div className="flex items-start justify-end gap-1.5">
                                    <span className="max-w-[168px] text-right font-medium break-all">
                                        {formData.withdrawalAddress}
                                    </span>
                                    <CopyButton
                                        theme={c}
                                        onCopy={() => copyToClipboard(formData.withdrawalAddress)}
                                    />
                                </div>
                            )}
                        </Row>

                        <Row theme={c} label="Transaction Hash">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="transactionHash"
                                    value={formData.transactionHash}
                                    onChange={handleChange}
                                    className={`w-52 text-right text-xs ${c.input}`}
                                />
                            ) : (
                                <div className="flex items-start justify-end gap-1.5">
                                    <span className="max-w-[168px] text-right font-medium break-all">
                                        {formData.transactionHash}
                                    </span>
                                    <CopyButton
                                        theme={c}
                                        onCopy={() => copyToClipboard(formData.transactionHash)}
                                    />
                                </div>
                            )}
                        </Row>
                    </div>

                    <div className="flex-1" />

                    <div className="px-1 pb-9">
                        <button
                            className="w-full rounded-full py-[11px] text-[13px]"
                            style={{ border: `1px solid ${c.border}`, color: c.text }}
                        >
                            View in Blockchain Explorer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BybitWithdrawal;
