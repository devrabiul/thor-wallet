import { useState } from 'react';
import { CiCircleCheck } from 'react-icons/ci';
import { FaArrowLeftLong, FaBars } from 'react-icons/fa6';
import { IoAccessibility, IoCopyOutline } from 'react-icons/io5';
import { MdOutlineHeadsetMic, MdWifi, MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { toPng } from 'html-to-image';
import { FaRegCircle } from "react-icons/fa";
import { getAddress, getFeeAmount } from '../lib/config';
import { CARD_HEIGHT, cardCaptureOptions } from '../lib/card';
import { randomBattery, randomSignal, randomSignalBars, randomTime, randomTxHash } from '../lib/random';
import SignalBars from './SignalBars';

const BybitLight = () => {
    // Editable state for all fields
    const [isEditing, setIsEditing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Status bar state
    // Lazy so the random values are drawn once per mount, not per render.
    const [statusBar, setStatusBar] = useState(() => ({
        time: randomTime(),
        battery: randomBattery(),
        signal: randomSignal(),
        signalBars: randomSignalBars(),
    }));

    // Form data state - Bybit style
    // Lazy: the stored fee is read once, not on every keystroke re-render.
    const [formData, setFormData] = useState(() => ({
        quantity: '103.3553',
        status: 'Withdrawal Completed',
        withdrawalAccount: 'Funding Account',
        fees: getFeeAmount(),
        chainType: 'TRON (TRC20)',
        time: '2025-08-26 15:01:22',
        withdrawalAddress: getAddress(),
        transactionHash: randomTxHash()
    }));

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleStatusBarChange = (e) => {
        setStatusBar({
            ...statusBar,
            [e.target.name]: e.target.value
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const handleDownload = async () => {
        const element = document.getElementById('withdrawal-card-light');
        if (!element) return;

        setIsDownloading(true);

        try {
            const dataUrl = await toPng(element, cardCaptureOptions(element));

            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `bybit-withdrawal-light-${timestamp}.png`;
            link.href = dataUrl;
            link.click();

        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error generating image. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Function to render battery icon based on percentage
    const renderBatteryIcon = (percentage) => {
        const batteryLevel = parseInt(percentage);
        const isLowBattery = batteryLevel <= 20;

        const filledBars =
            batteryLevel >= 90 ? 4
                : batteryLevel >= 70 ? 3
                    : batteryLevel >= 50 ? 2
                        : batteryLevel >= 30 ? 1
                            : 0;

        const barColor = isLowBattery ? '#F97316' : '#1a1a1a';

        return (
            <div className="flex items-center gap-[2px] relative">
                <div className="relative">
                    <svg width="22" height="12" viewBox="0 0 22 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke={barColor} strokeOpacity="0.8" fill="none" />
                        <rect x="19" y="3.5" width="2.5" height="5" rx="1" fill={barColor} fillOpacity="0.8" />
                        {filledBars >= 1 && <rect x="2" y="2" width="3" height="8" rx="0.5" fill={barColor} fillOpacity={isLowBattery ? 1 : 0.9} />}
                        {filledBars >= 2 && <rect x="6" y="2" width="3" height="8" rx="0.5" fill={barColor} fillOpacity={0.9} />}
                        {filledBars >= 3 && <rect x="10" y="2" width="3" height="8" rx="0.5" fill={barColor} fillOpacity={0.9} />}
                        {filledBars >= 4 && <rect x="14" y="2" width="3" height="8" rx="0.5" fill={barColor} fillOpacity={0.9} />}
                    </svg>
                </div>
                {isEditing ? (
                    <input
                        type="text"
                        name="battery"
                        value={statusBar.battery}
                        onChange={handleStatusBarChange}
                        className="bg-gray-200 text-gray-800 text-[10px] px-1 py-0.5 rounded w-10 text-center border border-gray-300 focus:outline-none focus:border-[#F0B90B] ml-1"
                    />
                ) : (
                    <span className="text-[10px] text-gray-800 ml-1">{statusBar.battery}%</span>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-dvh bg-gray-100 flex items-center justify-center p-2 font-sans">
            <div className="w-full max-w-[400px] mx-auto">
                {/* Edit/View Toggle & Download Button */}
                <div className="mb-4 flex justify-end gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-800 shadow-md hover:shadow-lg transition-shadow"
                    >
                        {isEditing ? (
                            <span className="text-green-500 text-lg">✓</span>
                        ) : (
                            <span className="text-blue-500 text-lg">✎</span>
                        )}
                        {isEditing ? 'View Mode' : 'Edit Mode'}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F0B90B] text-black hover:bg-[#FCD535] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-lg">{isDownloading ? '⏳' : '⬇️'}</span>
                        {isDownloading ? 'Downloading...' : 'Download as Image'}
                    </button>
                </div>

                {/* Bybit Light Card - Full height */}
                <div
                    id="withdrawal-card-light"
                    className="bg-white flex flex-col shadow-xl rounded-2xl"
                    style={{
                        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                        minHeight: `${CARD_HEIGHT}px`,
                        height: 'auto'
                    }}
                >
                    {/* Status Bar - Top */}
                    <div className="px-2 pt-2 pb-2 flex-shrink-0">
                        <div className="flex justify-between items-center text-gray-800 text-sm font-medium">
                            <div className="flex items-center gap-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="time"
                                        value={statusBar.time}
                                        onChange={handleStatusBarChange}
                                        className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded w-16 text-center border border-gray-300 focus:outline-none focus:border-[#F0B90B]"
                                    />
                                ) : (
                                    <span>{statusBar.time}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="signal"
                                            value={statusBar.signal}
                                            onChange={handleStatusBarChange}
                                            className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded w-12 text-center border border-gray-300 focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    ) : (
                                        <span className="text-xs">{statusBar.signal}</span>
                                    )}
                                    {isEditing && (
                                        <input
                                            type="text"
                                            name="signalBars"
                                            aria-label="Signal bars, 0 to 4"
                                            value={statusBar.signalBars}
                                            onChange={handleStatusBarChange}
                                            className="bg-[#f0f0f0] text-black text-[10px] px-1 py-0.5 rounded w-7 text-center border border-[#ddd] focus:outline-none focus:border-[#F7A600]"
                                        />
                                    )}
                                    <SignalBars level={statusBar.signalBars} color="#1F2937" />
                                </div>
                                <MdWifi className="text-gray-800 text-lg" />
                                {renderBatteryIcon(statusBar.battery)}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-2 flex-1 flex flex-col">
                        {/* Header Section */}
                        <div className="mb-6 flex justify-between items-center">
                            <FaArrowLeftLong color="#1a1a1a" />
                            <h2 className="text-gray-800 text-sm  flex items-center gap-2">
                                Withdrawal Details
                            </h2>
                            <MdOutlineHeadsetMic color="#1a1a1a" />
                        </div>

                        {/* Quantity Row */}
                        <div className="mb-2 text-center">
                            <div className="text-gray-500 text-xs font-medium mb-1">Quantity</div>
                            {isEditing ? (
                                <div className="flex items-baseline gap-2 justify-center">
                                    <input
                                        type="text"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className="bg-gray-200 text-gray-800 text-3xl font-bold px-2 py-1 rounded w-40 text-center border border-gray-300 focus:outline-none focus:border-[#F0B90B]"
                                    />
                                    <span className="text-gray-800 text-xl font-medium">USDT</span>
                                </div>
                            ) : (
                                <div className="text-gray-800 text-xl font-bold">
                                    {formData.quantity} <span className="text-xl font-medium">USDT</span>
                                </div>
                            )}
                        </div>

                        {/* Status Row */}
                        <div className="mb-8 flex items-center justify-center gap-1">
                            <CiCircleCheck className="text-green-400 font-semibold text-[14px]" />
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="bg-gray-200 text-green-400 font-medium px-2 py-1 rounded text-center border border-gray-300 focus:outline-none focus:border-[#F0B90B]"
                                />
                            ) : (
                                <span className="text-green-400 text-[10px] font-semibold">{formData.status}</span>
                            )}
                        </div>

                        {/* Details Grid - Bybit Style */}
                        <div className="space-y-2 mb-12">
                            {/* Withdrawal Account */}
                            <div className="flex justify-between items-center">
                                <span className="text-[#73767a]  text-xs">Withdrawal Account</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="withdrawalAccount"
                                        value={formData.withdrawalAccount}
                                        onChange={handleChange}
                                        className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded w-40 text-right border border-gray-300 focus:outline-none focus:border-[#F0B90B]"
                                    />
                                ) : (
                                    <span className="text-gray-800 text-xs">{formData.withdrawalAccount}</span>
                                )}
                            </div>

                            {/* Fees */}
                            <div className="flex justify-between items-center">
                                <span className="text-[#73767a]  text-xs">Fees</span>
                                {isEditing ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            name="fees"
                                            value={formData.fees}
                                            onChange={handleChange}
                                            className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded w-20 text-right border border-gray-300 focus:outline-none focus:border-[#F0B90B]"
                                        />
                                        <span className="text-gray-800 text-xs">USDT</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-800 text-xs">{formData.fees} USDT</span>
                                )}
                            </div>

                            {/* Chain Type */}
                            <div className="flex justify-between items-center">
                                <span className="text-[#73767a]  text-xs">Chain Type</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="chainType"
                                        value={formData.chainType}
                                        onChange={handleChange}
                                        className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded w-40 text-right border border-gray-300 focus:outline-none focus:border-[#F0B90B]"
                                    />
                                ) : (
                                    <span className="text-gray-800 text-xs">{formData.chainType}</span>
                                )}
                            </div>

                            {/* Time */}
                            <div className="flex justify-between items-center">
                                <span className="text-[#73767a]  text-xs">Time</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded w-48 text-right border border-gray-300 focus:outline-none focus:border-[#F0B90B]"
                                    />
                                ) : (
                                    <span className="text-gray-800 text-xs">{formData.time}</span>
                                )}
                            </div>

                            {/* Withdrawal Address */}
                            <div className="flex justify-between items-start">
                                <span className="text-[#73767a]  text-xs">Withdrawal Address</span>
                                <div className="flex items-center gap-2 max-w-[200px]">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="withdrawalAddress"
                                            value={formData.withdrawalAddress}
                                            onChange={handleChange}
                                            className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded w-full font-mono border border-gray-300 focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    ) : (
                                        <span className="text-gray-800 text-xs font-mono break-all text-right">
                                            {formData.withdrawalAddress}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => copyToClipboard(formData.withdrawalAddress)}
                                        className="text-[#73767a]  cursor-pointer hover:text-[#F0B90B] transition-colors"
                                    >
                                        <IoCopyOutline size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Transaction Hash */}
                            <div className="flex justify-between items-start">
                                <span className="text-[#73767a]  text-xs">Transaction Hash</span>
                                <div className="flex items-center gap-2 max-w-[200px]">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="transactionHash"
                                            value={formData.transactionHash}
                                            onChange={handleChange}
                                            className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded w-full font-mono border border-gray-300 focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    ) : (
                                        <span className="text-gray-800 text-xs font-mono break-all text-right">
                                            {formData.transactionHash}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => copyToClipboard(formData.transactionHash)}
                                        className="text-[#73767a]  cursor-pointer hover:text-[#F0B90B] transition-colors"
                                    >
                                        <IoCopyOutline size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Spacer to push button to bottom */}
                        <div className="flex-1"></div>

                        <div className="mt-4 mb-1">
                            <button
                                className="w-full bg-transparent text-gray-800 py-2 rounded-full text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-300"
                            >
                                View in Blockchain Explorer
                            </button>
                        </div>
                    </div>

                    {/* Phone Navigation Bar - Bottom */}
                    <div className="h-10 bg-white  flex items-center justify-between px-4 text-gray-800 relative">
                        {/* First 3 Icons Group - Centered with justify-around */}
                        <div className="flex items-center justify-around gap-6 flex-1">
                            {/* Back Button */}
                            <MdOutlineKeyboardArrowLeft className="text-xl opacity-80" />

                            {/* Home Button */}
                            <FaRegCircle className="text-base opacity-80" />

                            {/* Recent Apps Button */}
                            <FaBars className="text-sm rotate-90 opacity-80" />
                        </div>

                        {/* Last Icon - Far Right */}
                        <IoAccessibility className='text-sm opacity-80' />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BybitLight;