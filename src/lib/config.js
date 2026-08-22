// Starting values shared by every withdrawal template.
//
// Templates read these once, when their form state is initialised, so editing a
// generated receipt still overrides the default for that screenshot only.

const FEE_KEY = 'feeAmount';
const ADDRESS_KEY = 'walletAddress';
const ASSISTANT_KEY = 'showAssistant';

export const DEFAULT_FEE = '1.5';

// Anything that isn't a non-negative number falls back to the default rather
// than pushing `NaN` into a template.
export const normalizeFee = (value) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) return DEFAULT_FEE;

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return DEFAULT_FEE;

    return trimmed;
};

export const getFeeAmount = () => normalizeFee(localStorage.getItem(FEE_KEY));

export const setFeeAmount = (value) => {
    const fee = normalizeFee(value);
    localStorage.setItem(FEE_KEY, fee);
    return fee;
};

export const clearFeeAmount = () => {
    localStorage.removeItem(FEE_KEY);
    return DEFAULT_FEE;
};

export const DEFAULT_ADDRESS = 'TK2NgwbxmY2uksJgwcVTGQ6knbT1hk2SJn';

// Trimmed but not format-checked. Pinning this to TRON's shape would reject a
// pasted address from any other chain, and these are screenshots — the address
// only has to look right, not resolve.
export const normalizeAddress = (value) => String(value ?? '').trim() || DEFAULT_ADDRESS;

export const getAddress = () => normalizeAddress(localStorage.getItem(ADDRESS_KEY));

export const setAddress = (value) => {
    const address = normalizeAddress(value);
    localStorage.setItem(ADDRESS_KEY, address);
    return address;
};

export const clearAddress = () => {
    localStorage.removeItem(ADDRESS_KEY);
    return DEFAULT_ADDRESS;
};

// The floating assistant mascot on the new Binance templates. Off unless the
// stored value is exactly 'true', so a missing or junk key reads as hidden.
export const DEFAULT_SHOW_ASSISTANT = false;

export const getShowAssistant = () => localStorage.getItem(ASSISTANT_KEY) === 'true';

export const setShowAssistant = (value) => {
    const show = Boolean(value);
    localStorage.setItem(ASSISTANT_KEY, String(show));
    return show;
};

export const clearShowAssistant = () => {
    localStorage.removeItem(ASSISTANT_KEY);
    return DEFAULT_SHOW_ASSISTANT;
};
