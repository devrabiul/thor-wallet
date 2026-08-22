// Size of the phone-shaped card every template renders and downloads.
//
// The card used to be sized with `min-height: 100vh`, so its height came from
// whatever viewport happened to be open: a laptop produced a short image, a
// tall phone a much longer one, and the same receipt came out a different
// shape on every device. These fixed pixel dimensions cut that link — the card
// looks the same everywhere, and so does the PNG.

export const CARD_WIDTH = 400;

// 400 x 866 is close to 9:19.5, the aspect ratio of a current phone screen.
export const CARD_HEIGHT = 866;

// Capture options shared by every template's download handler.
//
// The clone is forced to CARD_WIDTH even when the card is rendered narrower on
// a small screen, so the file never carries the device's width either. Height
// is measured rather than pinned so that content taller than CARD_HEIGHT — a
// wrapped address, an extra fee row — isn't cropped off the bottom; because
// the measurement happens at the on-screen width, which is never wider than
// CARD_WIDTH, it can only ever err on the side of a little extra background.
export const cardCaptureOptions = (element, backgroundColor) => {
    const height = Math.max(CARD_HEIGHT, Math.ceil(element.getBoundingClientRect().height));

    // width/height size the output canvas *and* are applied to the clone as
    // inline px, so the capture is laid out at these dimensions rather than at
    // whatever the card happens to measure on screen.
    return {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor,
        width: CARD_WIDTH,
        height,
    };
};
