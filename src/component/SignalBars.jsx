// Cellular staircase for the V1 status bars, replacing the fixed
// MdSignalCellularAlt icon so the strength can vary per load and be edited.
//
// Lit bars are drawn at full opacity and the rest at 0.3 — the same
// treatment the new templates' SignalDots uses, so the two families read as
// the same indicator at different sizes.
const BARS = [
    { x: 0, y: 8.5, height: 3.5 },
    { x: 4.5, y: 6, height: 6 },
    { x: 9, y: 3.5, height: 8.5 },
    { x: 13.5, y: 1, height: 11 },
];

const SignalBars = ({ level, className = '', color = 'currentColor' }) => {
    const lit = Math.max(0, Math.min(BARS.length, parseInt(level, 10) || 0));

    return (
        <svg
            width="17"
            height="12"
            viewBox="0 0 17 12"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            {BARS.map((bar, index) => (
                <rect
                    key={bar.x}
                    x={bar.x}
                    y={bar.y}
                    width="3.2"
                    height={bar.height}
                    rx="1"
                    fill={color}
                    opacity={index < lit ? 1 : 0.3}
                />
            ))}
        </svg>
    );
};

export default SignalBars;
