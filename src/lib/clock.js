// Receipt timestamps are free text ("2026-08-19 22:32:57") — typed a character
// at a time in edit mode — so the phone clock drawn above them is read out of
// that string with a regex rather than handed to Date(), which would turn every
// half-finished edit into "Invalid Date".

/**
 * The clock the status bars print ("22:32"), taken from a receipt timestamp.
 * The hour is passed through exactly as typed rather than reformatted, so the
 * two never disagree: the status bar is the same 24-hour HH:MM the receipt
 * shows, down to whether the hour carries a leading zero.
 *
 * Returns null when the string doesn't carry a usable HH:MM yet, so callers can
 * leave the clock as it was instead of blanking it mid-keystroke.
 */
export const statusTimeFromTimestamp = (value) => {
    const match = /(\d{1,2}):(\d{2})/.exec(String(value ?? ''));
    if (!match) return null;

    if (Number(match[1]) > 23 || Number(match[2]) > 59) return null;

    return `${match[1]}:${match[2]}`;
};
