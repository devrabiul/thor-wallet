// Starting values that differ on every page load, so two receipts generated
// back to back don't carry an identical battery level or transaction hash.
//
// Called from each template's lazy useState initialiser: that runs once per
// mount, which is what makes the value stable while you edit the form and
// fresh again on reload.

// 15–99. Never 100 — a full battery reads as staged — and never single
// digits, which pulls the eye to the status bar instead of the receipt.
export const randomBattery = () => String(15 + Math.floor(Math.random() * 85));

// 12-hour clock with no leading zero on the hour: the format every reference
// screenshot uses, and what the status bars are laid out for. Deliberately
// independent of the receipt's own timestamp — see the note in the templates.
export const randomTime = () => {
    const hour = 1 + Math.floor(Math.random() * 12);
    const minute = Math.floor(Math.random() * 60);
    return `${hour}:${String(minute).padStart(2, '0')}`;
};

const CELLULAR = ['5G', '4G', 'LTE'];

// The V1 status bars print this label beside a permanently drawn cellular
// icon, so only network names belong there — "wifi" next to a signal staircase
// would contradict itself. PhoneStatusBar (the new templates) instead swaps the
// label out for a Wi-Fi fan when the value is literally "wifi", so pass
// `wifi: true` there to put it in the pool.
export const randomSignal = ({ wifi = false } = {}) => {
    const options = wifi ? [...CELLULAR, 'wifi'] : CELLULAR;
    return options[Math.floor(Math.random() * options.length)];
};

// 64 lowercase hex characters, the shape both Binance txids and Bybit
// transaction hashes take in the reference screenshots.
export const randomTxHash = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};
