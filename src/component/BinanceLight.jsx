import React, { useState } from 'react';
import { CiCircleCheck } from 'react-icons/ci';
import { FaArrowLeftLong } from 'react-icons/fa6';
import img from '../assets/binanceai.png'
import { IoCopyOutline } from 'react-icons/io5';
import { MdOutlineHeadsetMic, MdWifi, MdSignalCellularAlt } from 'react-icons/md';
import { TbReport } from 'react-icons/tb';
import { toPng } from 'html-to-image';

const BinanceLight = () => {
    // Editable state for all fields
    const [isEditing, setIsEditing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '150',
        status: 'Completed',
        cryptoTransferred: 'Crypto transferred out of Binance. Please contact the recipient platform for your transaction receipt.',
        network: 'TRX',
        address: 'TQeyx87kMFDiG99jiLcRgCrv6JYEnMv553',
        txid: '6695183afe317c6b990dcb339983a9f5edfcd28feb8f7325fcde6909a25730e2',
        amountTotal: '151',
        networkFee: '1',
        wallet: 'Spot Wallet',
        date: '2025-08-07 05:54:02'
    });

    // Status bar state
    const [statusBar, setStatusBar] = useState({
        time: '9:41',
        battery: '98',
        signal: '4G'
    });

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
        const element = document.getElementById('withdrawal-card');
        if (!element) return;

        setIsDownloading(true);

        try {
            const dataUrl = await toPng(element, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#FFFFFF',
                cacheBust: true,
            });

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

        let filledBars = 0;
        if (batteryLevel >= 90) filledBars = 4;
        else if (batteryLevel >= 70) filledBars = 3;
        else if (batteryLevel >= 50) filledBars = 2;
        else if (batteryLevel >= 30) filledBars = 1;
        else filledBars = 0;

        const barColor = isLowBattery ? '#F97316' : '#000000';

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
                        className="bg-[#f0f0f0] text-black text-[10px] px-1 py-0.5 rounded w-10 text-center border border-[#ddd] focus:outline-none focus:border-[#F0B90B] ml-1"
                    />
                ) : (
                    <span className="text-[10px] text-black ml-1">{statusBar.battery}%</span>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 font-sans">
            <div className="w-full max-w-[400px] mx-auto">
                {/* Edit/View Toggle & Download Button */}
                <div className="mb-4 flex justify-end gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white text-black transition-colors"
                    >
                        {isEditing ? (
                            <span className="text-green-500 text-lg">✓</span>
                        ) : (
                            <span className="text-blue-400 text-lg">✎</span>
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

                {/* Binance Light Card - Full height */}
                <div
                    id="withdrawal-card"
                    className="bg-white text-black border border-gray-200 flex flex-col relative"
                    style={{
                        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                        minHeight: '100vh',
                        height: 'auto'
                    }}
                >
                    {/* Status Bar - Top */}
                    <div className="px-2 pt-2 pb-2 flex-shrink-0">
                        <div className="flex justify-between items-center text-black text-sm font-medium">
                            <div className="flex items-center gap-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="time"
                                        value={statusBar.time}
                                        onChange={handleStatusBarChange}
                                        className="bg-[#f0f0f0] text-black text-sm px-2 py-1 rounded w-16 text-center border border-[#ddd] focus:outline-none focus:border-[#F0B90B]"
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
                                            className="bg-[#f0f0f0] text-black text-xs px-2 py-1 rounded w-12 text-center border border-[#ddd] focus:outline-none focus:border-[#F0B90B]"
                                        />
                                    ) : (
                                        <span className="text-xs">{statusBar.signal}</span>
                                    )}
                                    <MdSignalCellularAlt className="text-black text-lg" />
                                </div>
                                <MdWifi className="text-black text-lg" />
                                {renderBatteryIcon(statusBar.battery)}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-2 flex-1 flex flex-col">
                        {/* Header Section */}
                        <div className="mb-6 flex justify-between items-center">
                            <FaArrowLeftLong color="#000" />
                            <h2 className="text-black text-base font-medium flex items-center gap-2">
                                Withdrawal Details
                            </h2>
                            <MdOutlineHeadsetMic color="#000" />
                        </div>

                        {/* Amount Row */}
                        <div className="mb-4">
                            {isEditing ? (
                                <div className="flex items-baseline gap-2 justify-center">
                                    <span className="text-black text-2xl font-semibold">-</span>
                                    <input
                                        type="text"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className="bg-[#f0f0f0] text-black text-4xl font-bold px-2 py-1 rounded w-32 border border-[#ddd] focus:outline-none focus:border-[#F0B90B] text-center"
                                    />
                                    <span className="text-black text-2xl font-bold">USDT</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-black text-2xl font-medium">-{formData.amount}</span>
                                    <span className="text-black text-2xl font-medium ml-1">USDT</span>
                                </div>
                            )}
                        </div>

                        {/* Status Row */}
                        <div className="mb-2 flex text-sm font-medium items-center justify-center gap-2">
                            {formData.status === 'Completed' ? (
                                <span className="text-green-500 text-xl"><CiCircleCheck /></span>
                            ) : (
                                <span className="text-yellow-500 text-xl">⏳</span>
                            )}
                            {isEditing ? (
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="bg-[#f0f0f0] text-green-500 font-medium px-2 py-1 rounded border border-[#ddd] focus:outline-none focus:border-[#F0B90B]"
                                >
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            ) : (
                                <span className="text-green-500 font-medium">{formData.status}</span>
                            )}
                        </div>

                        {/* Info Message */}
                        <div className="mb-1">
                            {isEditing ? (
                                <textarea
                                    name="cryptoTransferred"
                                    value={formData.cryptoTransferred}
                                    onChange={handleChange}
                                    rows={2}
                                    className="bg-[#f0f0f0] text-[#6b717a] text-sm w-full px-3 py-2 rounded border border-[#ddd] focus:outline-none focus:border-[#F0B90B]"
                                />
                            ) : (
                                <p className="text-[#6b717a] text-center text-[11px] sm:text-xs">
                                    {formData.cryptoTransferred}
                                </p>
                            )}
                        </div>

                        {/* Help Link */}
                        <div className="mb-6 flex justify-center items-center">
                            <button className="text-[#e7b913] text-sm text-center font-medium hover:underline">
                                Why hasn't my withdrawal arrived?
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-4"></div>

                        {/* Details Grid */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="text-[#7a808a] font-extralight text-xs">Network</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="network"
                                        value={formData.network}
                                        onChange={handleChange}
                                        className="bg-[#f0f0f0] text-black text-sm px-2 py-1 rounded w-24 text-right border border-[#ddd] focus:outline-none focus:border-[#F0B90B]"
                                    />
                                ) : (
                                    <span className="text-black text-xs font-thin">{formData.network}</span>
                                )}
                            </div>

                            <div className="flex justify-between items-start">
                                <span className="text-[#7a808a] text-xs">Address</span>
                                <div className="flex flex-col items-end gap-1 max-w-[220px]">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="bg-[#f0f0f0] text-black text-sm px-2 py-1 rounded w-full font-mono border border-[#ddd] focus:outline-none focus:border-[#F0B90B] text-right"
                                        />
                                    ) : (
                                        <>
                                            <span className="text-black text-sm font-mono break-all text-right">
                                                {addressParts.line1}
                                            </span>
                                            {addressParts.line2 && (
                                                <span className="text-black text-sm font-mono break-all text-right">
                                                    {addressParts.line2}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    <button
                                        onClick={() => copyToClipboard(formData.address)}
                                        className="text-[#7a808a] cursor-pointer hover:text-[#F0B90B] transition-colors"
                                    >
                                        <span className="text-sm inline-block -scale-x-100">
                                            <IoCopyOutline />
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="text-[#e7b913] text-xs font-medium hover:underline">Save Address</button>
                            </div>

                            <div className="flex justify-between items-start">
                                <span className="text-[#7a808a] text-xs">Txid</span>
                                <div className="flex items-center gap-2 max-w-[220px]">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="txid"
                                            value={formData.txid}
                                            onChange={handleChange}
                                            className="bg-[#f0f0f0] text-black underline text-xs px-2 py-1 rounded w-full font-mono border border-[#ddd] focus:outline-none focus:border-[#F0B90B] text-right"
                                        />
                                    ) : (
                                        <span className="text-black underline text-xs font-mono break-all text-right">
                                            {formData.txid}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => copyToClipboard(formData.txid)}
                                        className="text-[#7a808a] cursor-pointer hover:text-[#F0B90B] transition-colors"
                                    >
                                        <span className="text-sm inline-block -scale-x-100">
                                            <IoCopyOutline />
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-[#7a808a] text-xs">Amount</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="amountTotal"
                                        value={formData.amountTotal}
                                        onChange={handleChange}
                                        className="bg-[#f0f0f0] text-black text-sm px-2 py-1 rounded w-24 text-right border border-[#ddd] focus:outline-none focus:border-[#F0B90B]"
                                    />
                                ) : (
                                    <span className="text-black text-xs">{formData.amountTotal} USDT</span>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <span className="text-[#7a808a] text-xs">Network fee</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="networkFee"
                                        value={formData.networkFee}
                                        onChange={handleChange}
                                        className="bg-[#f0f0f0] text-black text-xs px-2 py-1 rounded w-24 text-right border border-[#ddd] focus:outline-none focus:border-[#F0B90B]"
                                    />
                                ) : (
                                    <span className="text-black text-xs">{formData.networkFee} USDT</span>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <span className="text-[#7a808a] text-xs">Withdrawal Wallet</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="wallet"
                                        value={formData.wallet}
                                        onChange={handleChange}
                                        className="bg-[#f0f0f0] text-black text-sm px-2 py-1 rounded w-32 text-right border border-[#ddd] focus:outline-none focus:border-[#F0B90B]"
                                    />
                                ) : (
                                    <span className="text-black text-xs">{formData.wallet}</span>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <span className="text-[#7a808a] text-xs">Date</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="bg-[#f0f0f0] text-black text-sm px-2 py-1 rounded w-40 text-right border border-[#ddd] focus:outline-none focus:border-[#F0B90B]"
                                    />
                                ) : (
                                    <span className="text-black text-xs">{formData.date}</span>
                                )}
                            </div>
                        </div>

                        {/* Scam Report Link */}
                        <div className="flex my-6 justify-center">
                            <button className="text-[#7a808a] text-xs font-thin flex items-center gap-1 hover:text-red-400 transition-colors">
                                <span className="text-sm"><TbReport /></span>
                                Scam Report
                            </button>
                        </div>

                        {/* Spacer to push button to bottom */}
                        <div className="flex-1"></div>

                        {/* Withdraw Again Button - At the very bottom */}
                        <div className="mb-1 mt-4">
                            <button className='bg-[#fcd434] text-black rounded-md w-full py-2 text-xs font-medium'>
                                Withdraw Again
                            </button>
                        </div>
                    </div>

                    {/* Binance AI Logo - Bottom Right Corner */}
                    <div className="absolute bottom-20 right-6">
                        <button className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200">
                            <img src={img} alt="Binance AI" className="w-8 h-8 object-contain" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BinanceLight;