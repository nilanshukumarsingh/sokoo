import React, { useState, useEffect } from 'react';

/**
 * Reusable component for a single scrambling character with hue cycling.
 * @param {number} frequency - How many times per second the character changes (Hz). Higher = Faster.
 * @param {number} hueSpeed - How fast the color hue rotates (0-360).
 * @param {string[]} characters - Custom set of characters to cycle through.
 */
const ScrambleChar = ({
    frequency = 10,
    hueSpeed = 60,
    characters = ['+', 'q', '^', '\\', '@', '!', '#', '$', '%', '&', '*', '?', '0', '1', 'x', 'z']
}) => {
    const [char, setChar] = useState(characters[0]);
    const [hue, setHue] = useState(Math.floor(Math.random() * 360));

    useEffect(() => {
        // Convert frequency (Hz) to interval (ms)
        // 1000ms / frequency = interval duration
        const intervalTime = 1000 / frequency;

        const intervalId = setInterval(() => {
            // Pick random char
            setChar(characters[Math.floor(Math.random() * characters.length)]);
            // Rotate hue
            setHue((prev) => (prev + hueSpeed) % 360);
        }, intervalTime);

        return () => clearInterval(intervalId);
    }, [frequency, hueSpeed, characters]);

    return (
        <span
            style={{
                color: `hsl(${hue}, 100%, 50%)`,
                textShadow: `0 0 20px hsl(${hue}, 100%, 50%, 0.6)`,
                display: "inline-block",
                width: "1ch",
                textAlign: "center"
            }}
        >
            {char}
        </span>
    );
};

export default ScrambleChar;
