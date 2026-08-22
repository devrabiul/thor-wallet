// Receipt amounts carry thousands separators ("1,998.5"), so they can't be
// handed to Number() as-is.

export const parseAmount = (value) => {
    const cleaned = String(value ?? '').replace(/,/g, '').trim();
    if (!cleaned) return null;

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
};

export const formatAmount = (value) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(value);

/**
 * What the account is actually debited: the amount that lands plus the network
 * fee. Returns null when either side isn't a number — the caller leaves the
 * field untouched rather than writing "NaN" into a receipt half-way through a
 * keystroke.
 */
export const totalWithFee = (amount, fee) => {
    const parsedAmount = parseAmount(amount);
    const parsedFee = parseAmount(fee);
    if (parsedAmount === null || parsedFee === null) return null;

    // Adding two decimal strings in binary floating point lands on values like
    // 151.49999999999997, which would print in full. Eight places is past any
    // precision these receipts show.
    return formatAmount(Math.round((parsedAmount + parsedFee) * 1e8) / 1e8);
};
