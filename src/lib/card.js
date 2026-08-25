import { toPng } from 'html-to-image';

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

// Render a card element to a PNG data URL.
//
// The card is laid out responsively — `w-full max-w-[400px]` inside a padded
// page — so it only actually measures CARD_WIDTH when the viewport is wide
// enough. On a 360px Android it renders 344px wide, on a 375px iPhone 359px.
//
// That mattered, because html-to-image copies each node's *computed* style
// onto the clone, and computed style carries the resolved used width
// (`width: 359.5px`). Every descendant got the device's width frozen into it,
// while the library's own `width` option was applied to the root clone alone.
// The result was a 400px-wide root full of 359.5px-wide children, and the
// leftover strip of background painted down the right edge of the PNG, top to
// bottom — a band whose size depended on the phone the download came from.
//
// So the layout, not just the output canvas, has to be at CARD_WIDTH. We pin
// the element there for the duration of the capture and put it back afterwards.
export const captureCardPng = async (element, backgroundColor) => {
    // Inter is `font-display: swap`, so a download fired before it arrives
    // would measure and lay out the card in the fallback font. Waiting costs
    // nothing once the font is cached, which it is after the first paint.
    await document.fonts.ready;

    const { style } = element;
    const saved = {
        width: style.width,
        transform: style.transform,
        transformOrigin: style.transformOrigin,
        marginBottom: style.marginBottom,
    };

    // How wide the card sits on screen right now, measured before we touch it.
    const onScreenWidth = element.getBoundingClientRect().width;

    style.width = `${CARD_WIDTH}px`;

    // Read back at the pinned width. offsetHeight is the layout height, so it
    // ignores the scale applied below and stays correct either way. Height is
    // measured rather than pinned so content taller than CARD_HEIGHT — a
    // wrapped address, an extra fee row — isn't cropped off the bottom.
    const height = Math.max(CARD_HEIGHT, element.offsetHeight);

    // Pinning the width makes the card overflow its wrapper on a narrow phone,
    // which would flash a horizontal scrollbar across the page for as long as
    // the capture runs. Scaling it back to the width it already occupied keeps
    // the screen looking unchanged; transforms don't affect layout, so the
    // clone is still built from a 400px-wide box. The negative margin absorbs
    // the height the scale no longer paints.
    const scale = onScreenWidth > 0 ? Math.min(1, onScreenWidth / CARD_WIDTH) : 1;
    if (scale < 1) {
        style.transform = `scale(${scale})`;
        style.transformOrigin = 'top left';
        style.marginBottom = `${-Math.round(height * (1 - scale))}px`;
    }

    try {
        return await toPng(element, {
            quality: 1,
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor,
            width: CARD_WIDTH,
            height,

            // The clone inherits the on-screen shrink through the same
            // computed-style copy described above. `style` is applied to the
            // root clone last, after the library's own width/height, so this
            // is where it gets undone.
            style: {
                transform: 'none',
                transformOrigin: 'top left',
                marginBottom: '0px',

                // Two cards are `@container`, which implies `contain: layout
                // style inline-size`. The container queries have already been
                // resolved into the clone's inline styles by this point, so
                // the containment has nothing left to do and is dropped
                // rather than carried into the SVG.
                containerType: 'normal',
                contain: 'none',
            },
        });
    } finally {
        style.width = saved.width;
        style.transform = saved.transform;
        style.transformOrigin = saved.transformOrigin;
        style.marginBottom = saved.marginBottom;
    }
};
