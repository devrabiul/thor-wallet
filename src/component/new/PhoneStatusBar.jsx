import { MdWifi } from 'react-icons/md';
import SignalBars from '../SignalBars';

// A filled pill with the percentage printed inside it. The charged portion is
// drawn in the foreground colour and the digits in the card's background
// colour, so the number stays legible over both halves of the pill.
const BatteryPill = ({ percentage, fg, bg }) => {
    const parsed = parseInt(percentage, 10);
    const level = Math.max(0, Math.min(100, Number.isNaN(parsed) ? 0 : parsed));

    return (
        <div className="flex items-center gap-[1.5px]">
            <div
                className="relative h-[15px] w-[27px] overflow-hidden rounded-[5px]"
                style={{ backgroundColor: '#9CA3AF' }}
            >
                <div
                    className="absolute inset-y-0 left-0"
                    style={{
                        width: `${level}%`,
                        backgroundColor: level <= 20 ? '#F6465D' : fg,
                    }}
                />
                <span
                    className="absolute inset-0 flex items-center justify-center text-[10px] font-bold leading-none"
                    style={{ color: bg }}
                >
                    {level}
                </span>
            </div>
            <div className="h-[5px] w-[2px] rounded-r-[1px]" style={{ backgroundColor: '#9CA3AF' }} />
        </div>
    );
};

/**
 * Phone status bar shared by the new Binance and Bybit templates.
 *
 * `signal` doubles as the network label and the Wi-Fi switch: type "wifi" and
 * the screenshots' filled Wi-Fi fan is drawn instead of the text, matching the
 * two variants in the reference images.
 */
const PhoneStatusBar = ({ value, onChange, isEditing, fg, bg, inputClass }) => {
    const showWifi = value.signal.trim().toLowerCase() === 'wifi';

    return (
        <div className="flex items-center justify-between px-8 pt-[18px] pb-1" style={{ color: fg }}>
            {isEditing ? (
                <input
                    type="text"
                    name="time"
                    value={value.time}
                    onChange={onChange}
                    className={`w-16 text-center text-sm ${inputClass}`}
                />
            ) : (
                <span className="text-[17px] font-semibold tracking-tight">{value.time}</span>
            )}

            <div className="flex items-center gap-1.5">
                {/* Same staircase the V1 status bars draw — the dot-matrix this
                    replaced read as two stacks of dots rather than signal. */}
                <SignalBars color={fg} level={value.signalBars} />

                {isEditing && (
                    <input
                        type="text"
                        name="signalBars"
                        aria-label="Signal bars, 0 to 4"
                        value={value.signalBars}
                        onChange={onChange}
                        className={`w-8 text-center text-xs ${inputClass}`}
                    />
                )}

                {isEditing ? (
                    <input
                        type="text"
                        name="signal"
                        value={value.signal}
                        onChange={onChange}
                        className={`w-16 text-center text-xs ${inputClass}`}
                    />
                ) : showWifi ? (
                    <MdWifi className="text-[17px]" />
                ) : (
                    <span className="text-[13px] font-semibold">{value.signal}</span>
                )}

                {isEditing ? (
                    <input
                        type="text"
                        name="battery"
                        value={value.battery}
                        onChange={onChange}
                        className={`w-12 text-center text-xs ${inputClass}`}
                    />
                ) : (
                    <BatteryPill percentage={value.battery} fg={fg} bg={bg} />
                )}
            </div>
        </div>
    );
};

export default PhoneStatusBar;
