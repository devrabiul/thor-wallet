// Receipt timestamps are free text ("2026-08-19 12:50:30") — typed a character
// at a time in edit mode — so the phone clock drawn above them is read out of
// that string with a regex rather than handed to Date(), which would turn every
// half-finished edit into "Invalid Date".

/**
 * The 12-hour clock the status bars print ("12:50"), taken from a receipt
 * timestamp. Returns null when the string doesn't carry a usable HH:MM yet, so
 * callers can leave the clock as it was instead of blanking it mid-keystroke.
 */
export const statusTimeFromTimestamp = (value) => {
    const match = /(\d{1,2}):(\d{2})/.exec(String(value ?? ''));
    if (!match) return null;

    const hour24 = Number(match[1]);
    if (hour24 > 23 || Number(match[2]) > 59) return null;

    // Midnight and noon both land on 12 — 0:50 would read as a clock that
    // isn't running.
    const hour = hour24 % 12 || 12;
    return `${hour}:${match[2]}`;
};
