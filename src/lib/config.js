// Fee amount shared by every withdrawal template.
//
// Templates read this once, when their form state is initialised, so editing a
// generated receipt still overrides the default for that screenshot only.

const FEE_KEY = 'feeAmount';

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
