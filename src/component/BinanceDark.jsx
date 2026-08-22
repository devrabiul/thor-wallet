import { useState } from 'react';
import { CiCircleCheck } from 'react-icons/ci';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { IoCopyOutline } from 'react-icons/io5';
import img from '../assets/binanceai.png';
import { MdOutlineHeadsetMic, MdWifi } from 'react-icons/md';
import { TbReport } from 'react-icons/tb';
import { toPng } from 'html-to-image';
import { getAddress, getFeeAmount } from '../lib/config';
import { CARD_HEIGHT, cardCaptureOptions } from '../lib/card';
import { totalWithFee } from '../lib/amount';
import { randomBattery, randomSignal, randomSignalBars, randomTime, randomTxHash } from '../lib/random';
import SignalBars from './SignalBars';

const BinanceDark = () => {
    // Editable state for all fields
    const [isEditing, setIsEditing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    // Lazy: the stored fee is read once, not on every keystroke re-render.
    const [formData, setFormData] = useState(() => {
        const fee = getFeeAmount();
        const amount = '150';

        return {
            amount,
            status: 'Completed',
            cryptoTransferred: 'Crypto transferred out of Binance. Please contact the recipient platform for your transaction receipt.',
            network: 'TRX',
            address: getAddress(),
            txid: randomTxHash(),
            // Derived, not hardcoded — the fee is configurable, so a fixed
            // total would contradict it as soon as it isn't 1.5.
            amountTotal: totalWithFee(amount, fee),
            networkFee: fee,
            wallet: 'Spot Wallet',
            date: '2025-08-07 05:54:02'
        };
    });

    // Status bar state
    // Lazy so the random values are drawn once per mount, not per render.
    const [statusBar, setStatusBar] = useState(() => ({
        time: randomTime(),
        battery: randomBattery(),
        signal: randomSignal(),
        signalBars: randomSignalBars(),
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const next = { ...prev, [name]: value };

            // Total tracks amount + fee as you type. Left alone when the
            // arithmetic doesn't resolve, so a half-typed amount doesn't blank
            // it, and never recomputed while the total itself is being edited —
            // that's what lets a hand-entered total stick.
            if (name === 'amount' || name === 'networkFee') {
                const total = totalWithFee(next.amount, next.networkFee);
                if (total !== null) next.amountTotal = total;
            }

            return next;
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
        const element = document.getElementById('withdrawal-card');
        if (!element) return;
        
        setIsDownloading(true);
        
        try {
            const dataUrl = await toPng(element, cardCaptureOptions(element, '#1E2329'));
            
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `binance-withdrawal-${timestamp}.png`;
            link.href = dataUrl;
            link.click();
            
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Error generating image. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Function to split address - first part minus last 9 chars, last 9 chars separately
    const getAddressParts = (fullAddress) => {
        if (!fullAddress) return { line1: '', line2: '' };
        if (fullAddress.length <= 9) {
            return { line1: fullAddress, line2: '' };
        }
        const line2 = fullAddress.slice(-9);
        const line1 = fullAddress.slice(0, -9);
        return { line1, line2 };
    };

    const addressParts = getAddressParts(formData.address);

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
        
        const barColor = isLowBattery ? '#F97316' : '#FFFFFF';
        
        return (
            <div className="flex items-center gap-[2px] relative">
                <div className="relative">
                    <svg width="22" height="12" viewBox="0 0 22 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke={barColor} strokeOpacity="0.8" fill="none"/>
                        <rect x="19" y="3.5" width="2.5" height="5" rx="1" fill={barColor} fillOpacity="0.8"/>
                        {filledBars >= 1 && <rect x="2" y="2" width="3" height="8" rx="0.5" fill={barColor} fillOpacity={isLowBattery ? 1 : 0.9}/>}
                        {filledBars >= 2 && <rect x="6" y="2" width="3" height="8" rx="0.5" fill={barColor} fillOpacity={0.9}/>}
                        {filledBars >= 3 && <rect x="10" y="2" width="3" height="8" rx="0.5" fill={barColor} fillOpacity={0.9}/>}
                        {filledBars >= 4 && <rect x="14" y="2" width="3" height="8" rx="0.5" fill={barColor} fillOpacity={0.9}/>}
                    </svg>
                </div>
                {isEditing ? (
                    <input
                        type="text"
                        name="battery"
                        value={statusBar.battery}
                        onChange={handleStatusBarChange}
                        className="bg-[#2B3139] text-white text-[10px] px-1 py-0.5 rounded w-10 text-center border border-[#474D57] focus:outline-none focus:border-[#F0B90B] ml-1"
                    />
                ) : (
                    <span className="text-[10px] text-white ml-1">{statusBar.battery}%</span>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-dvh bg-black flex items-center justify-center p-1 sm:p-2 font-sans">
            <div className="w-full max-w-[400px] mx-auto">
                {/* Edit/View Toggle & Download Button - Mobile Optimized */}
                <div className="mb-3 sm:mb-4 flex justify-end gap-2 sm:gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1f2630] text-white transition-colors text-sm sm:text-base"
                    >
                        {isEditing ? (
                            <span className="text-green-500 text-base sm:text-lg">✓</span>
                        ) : (
                            <span className="text-blue-400 text-base sm:text-lg">✎</span>
                        )}
                        <span className="hidden xs:inline">{isEditing ? 'View Mode' : 'Edit Mode'}</span>
                        <span className="xs:hidden">{isEditing ? 'View' : 'Edit'}</span>
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#F0B90B] text-black hover:bg-[#FCD535] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        <span className="text-base sm:text-lg">{isDownloading ? '⏳' : '⬇️'}</span>
                        <span className="hidden xs:inline">{isDownloading ? 'Downloading...' : 'Download'}</span>
                        <span className="xs:hidden">{isDownloading ? '...' : 'DL'}</span>
                    </button>
                </div>

                {/* Binance Dark Card - Full Height for Mobile Screenshot */}
                <div
                    id="withdrawal-card"
                    className="bg-[#1f2630] shadow-2xl border border-[#2B3139] flex flex-col relative overflow-hidden"
                    style={{ 
                        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                        width: '100%',
                        maxWidth: '400px',
                        margin: '0 auto',
                        minHeight: `${CARD_HEIGHT}px`,
                        height: 'auto'
                    }}
                >
                    {/* Status Bar - Top with smaller padding on mobile */}
                    <div className="px-1 sm:px-2 pt-2 sm:pt-2 pb-2 flex-shrink-0">
                        <div className="flex justify-between items-center text-white text-sm font-medium">
                            <div className="flex items-center gap-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="time"
                                        value={statusBar.time}
                                        onChange={handleStatusBarChange}
                                        className="bg-[#2B3139] text-white text-xs sm:text-sm px-2 py-1 rounded w-14 sm:w-16 text-center border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                                    />
                                ) : (
                                    <span className="text-xs sm:text-sm">{statusBar.time}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="signal"
                                            value={statusBar.signal}
                                            onChange={handleStatusBarChange}
                                            className="bg-[#2B3139] text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded w-10 sm:w-12 text-center border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    ) : (
                                        <span className="text-[10px] sm:text-xs">{statusBar.signal}</span>
                                    )}
                                    {isEditing && (
                                        <input
                                            type="text"
                                            name="signalBars"
                                            aria-label="Signal bars, 0 to 4"
                                            value={statusBar.signalBars}
                                            onChange={handleStatusBarChange}
                                            className="bg-[#2B3139] text-white text-[10px] sm:text-xs px-1 py-0.5 rounded w-7 text-center border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    )}
                                    <SignalBars level={statusBar.signalBars} color="#FFFFFF" />
                                </div>
                                <MdWifi className="text-white text-base sm:text-lg" />
                                {renderBatteryIcon(statusBar.battery)}
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Adjust padding for mobile */}
                    <div className="px-2 sm:px-2 flex-1 flex flex-col">
                        {/* Header Section */}
                        <div className="mb-4 sm:mb-6 flex justify-between items-center">
                            <FaArrowLeftLong color="#fff" className="text-sm sm:text-base" />
                            <h2 className="text-white text-base sm:text-sm flex items-center gap-2">
                                Withdrawal Details
                            </h2>
                            <MdOutlineHeadsetMic color="#fff" className="text-base sm:text-lg" />
                        </div>

                        {/* Amount Row - Mobile responsive text sizes */}
                        <div className="mb-3 sm:mb-2">
                            {isEditing ? (
                                <div className="flex items-baseline gap-1 sm:gap-2 justify-center flex-wrap">
                                    <span className="text-white text-xl sm:text-2xl font-semibold">-</span>
                                    <input
                                        type="text"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className="bg-[#2B3139] text-white text-xl sm:text-xl font-bold px-2 py-1 rounded w-24 sm:w-32 border border-[#474D57] focus:outline-none focus:border-[#F0B90B] text-center"
                                    />
                                    <span className="text-white text-xl sm:text-xl font-bold">USDT</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-white text-xl sm:text-2xl font-medium">-{formData.amount}</span>
                                    <span className="text-white text-xl sm:text-2xl font-medium ml-1">USDT</span>
                                </div>
                            )}
                        </div>

                        {/* Status Row */}
                        <div className="mb-1 sm:mb-1 flex text-sm font-medium items-center justify-center gap-1">
                            {formData.status === 'Completed' ? (
                                <span className="text-green-500 text-lg sm:text-xl"><CiCircleCheck /></span>
                            ) : (
                                <span className="text-yellow-500 text-lg sm:text-xl">⏳</span>
                            )}
                            {isEditing ? (
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="bg-[#2B3139] text-green-500 font-medium px-2 py-1 rounded border border-[#474D57] focus:outline-none focus:border-[#F0B90B] text-sm"
                                >
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            ) : (
                                <span className="text-green-500 font-medium text-sm">{formData.status}</span>
                            )}
                        </div>

                        {/* Info Message */}
                        <div className="mb-2 sm:mb-1">
                            {isEditing ? (
                                <textarea
                                    name="cryptoTransferred"
                                    value={formData.cryptoTransferred}
                                    onChange={handleChange}
                                    rows={2}
                                    className="bg-[#2B3139] text-[#a5abb2] text-center text-xs sm:text-sm w-full px-3 py-2 rounded border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                                />
                            ) : (
                                <p className="text-[#a5abb2] text-center text-[11px] sm:text-xs">
                                    {formData.cryptoTransferred}
                                </p>
                            )}
                        </div>

                        {/* Help Link */}
                        <div className="mb-4 sm:mb-6 flex justify-center items-center">
                            <button className="text-[#f8d042] text-xs sm:text-sm text-center hover:underline">
                                Why hasn't my withdrawal arrived?
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#2B3139] my-3 sm:my-4"></div>

                        {/* Details Grid - Mobile optimized layout */}
                        <div className="space-y-3 sm:space-y-3">
                            {/* Network Row */}
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-[#a5abb2] text-[11px] sm:text-xs w-2/5">Network</span>
                                <div className="w-3/5 flex justify-end">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="network"
                                            value={formData.network}
                                            onChange={handleChange}
                                            className="bg-[#2B3139] text-[#dfe3ea] text-[11px] sm:text-xs px-2 py-1 rounded w-full max-w-[140px] text-right border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    ) : (
                                        <span className="text-[#dfe3ea] text-[11px] sm:text-xs font-thin">{formData.network}</span>
                                    )}
                                </div>
                            </div>

                            {/* Address Row - Two lines */}
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-[#a5abb2] text-[11px] sm:text-xs w-2/5 pt-0">Address</span>
                                <div className="w-3/5 flex flex-col items-end gap-1">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="bg-[#2B3139] text-[#dfe3ea] text-[10px] sm:text-xs px-2 py-1 rounded w-full font-mono border border-[#474D57] focus:outline-none focus:border-[#F0B90B] text-right"
                                        />
                                    ) : (
                                        <>
                                            <span className="text-[#dfe3ea] text-[10px] sm:text-xs font-mono break-all text-right">
                                                {addressParts.line1}
                                            </span>
                                            {addressParts.line2 && (
                                                <span className="text-[#dfe3ea] text-[10px] sm:text-xs font-mono break-all text-right">
                                                    {addressParts.line2}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    <button
                                        onClick={() => copyToClipboard(formData.address)}
                                        className="text-[#dfe3ea] cursor-pointer hover:text-[#F0B90B] transition-colors flex-shrink-0 mt-1"
                                    >
                                        <span className="text-xs sm:text-sm inline-block -scale-x-100">
                                            <IoCopyOutline />
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="text-[#f8d042] text-[10px] sm:text-xs  hover:underline">Save Address</button>
                            </div>

                            {/* Txid Row */}
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-[#a5abb2] text-[11px] sm:text-xs w-2/5">Txid</span>
                                <div className="w-3/5 flex items-center gap-1 sm:gap-2 justify-end">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="txid"
                                            value={formData.txid}
                                            onChange={handleChange}
                                            className="bg-[#2B3139] text-[#dfe3ea] underline text-[9px] sm:text-xs px-2 py-1 rounded w-full font-mono border border-[#474D57] focus:outline-none focus:border-[#F0B90B] text-right"
                                        />
                                    ) : (
                                        <span className="text-[#dfe3ea] underline text-[9px] sm:text-xs font-mono break-all text-right">
                                            {formData.txid}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => copyToClipboard(formData.txid)}
                                        className="text-[#dfe3ea] cursor-pointer hover:text-[#F0B90B] transition-colors flex-shrink-0"
                                    >
                                        <span className="text-xs sm:text-sm inline-block -scale-x-100">
                                            <IoCopyOutline />
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Amount Row */}
                            <div className="flex justify-between gap-2">
                                <span className="text-[#a5abb2] text-[11px] sm:text-xs w-2/5">Amount</span>
                                <div className="w-3/5 flex justify-end">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="amountTotal"
                                            value={formData.amountTotal}
                                            onChange={handleChange}
                                            className="bg-[#2B3139] text-[#dfe3ea] text-xs sm:text-sm px-2 py-1 rounded w-full max-w-[100px] text-right border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    ) : (
                                        <span className="text-[#dfe3ea] text-[11px] sm:text-xs">{formData.amountTotal} USDT</span>
                                    )}
                                </div>
                            </div>

                            {/* Network Fee Row */}
                            <div className="flex justify-between gap-2">
                                <span className="text-[#a5abb2] text-[11px] sm:text-xs w-2/5">Network fee</span>
                                <div className="w-3/5 flex justify-end">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="networkFee"
                                            value={formData.networkFee}
                                            onChange={handleChange}
                                            className="bg-[#2B3139] text-[#dfe3ea] text-[11px] sm:text-xs px-2 py-1 rounded w-full max-w-[100px] text-right border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    ) : (
                                        <span className="text-[#dfe3ea] text-[11px] sm:text-xs">{formData.networkFee} USDT</span>
                                    )}
                                </div>
                            </div>

                            {/* Withdrawal Wallet Row */}
                            <div className="flex justify-between gap-2">
                                <span className="text-[#a5abb2] text-[11px] sm:text-xs w-2/5">Withdrawal Wallet</span>
                                <div className="w-3/5 flex justify-end">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="wallet"
                                            value={formData.wallet}
                                            onChange={handleChange}
                                            className="bg-[#2B3139] text-[#dfe3ea] text-xs sm:text-sm px-2 py-1 rounded w-full max-w-[140px] text-right border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    ) : (
                                        <span className="text-[#dfe3ea] text-[11px] sm:text-xs">{formData.wallet}</span>
                                    )}
                                </div>
                            </div>

                            {/* Date Row */}
                            <div className="flex justify-between gap-2">
                                <span className="text-[#a5abb2] text-[11px] sm:text-xs w-2/5">Date</span>
                                <div className="w-3/5 flex justify-end">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="bg-[#2B3139] text-[#dfe3ea] text-[11px] sm:text-sm px-2 py-1 rounded w-full max-w-[150px] text-right border border-[#474D57] focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    ) : (
                                        <span className="text-[#dfe3ea] text-[11px] sm:text-xs">{formData.date}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Scam Report Link */}
                        <div className="flex my-4 sm:my-6 justify-center">
                            <button className="text-[#a5abb2] text-[10px] sm:text-xs font-thin flex items-center gap-1 hover:text-red-400 transition-colors">
                                <span className="text-xs text-[#a5abb2] sm:text-sm"><TbReport /></span>
                                Scam Report
                            </button>
                        </div>

                        {/* Spacer to push button to bottom */}
                        <div className="flex-1"></div>

                        {/* Withdraw Again Button - At the very bottom */}
                        <div className="mb-1 sm:mb-1 mt-3 sm:mt-4">
                            <button className='bg-[#fcd434] text-black rounded-md w-full py-2.5 sm:py-2 text-xs font-medium'>
                                Withdraw Again
                            </button>
                        </div>
                    </div>

                    {/* Binance AI Logo - Bottom Right Corner, mobile adjusted */}
                    <div className="absolute bottom-16 sm:bottom-20 right-4 sm:right-6">
                        <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200 border-2 border-[#1E2329]">
                            <img src={img} alt="Binance AI" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BinanceDark;