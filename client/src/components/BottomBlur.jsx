import React from 'react';

const BottomBlur = () => {
    return (
        <div style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100px", // Match general height/feel, or keep same
            zIndex: 900,
            pointerEvents: "none",
            transform: "scaleY(-1)", // Mirror vertically
        }}>
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(64px)", zIndex: 8, mask: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,0) 25%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,0) 25%)" }} />
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(32px)", zIndex: 7, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)" }} />
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(16px)", zIndex: 6, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 37.5%, rgba(0,0,0,0) 50%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 37.5%, rgba(0,0,0,0) 50%)" }} />
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(8px)", zIndex: 5, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 37.5%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 62.5%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 37.5%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 62.5%)" }} />
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(4px)", zIndex: 4, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 37.5%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 62.5%, rgba(0,0,0,0) 75%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 37.5%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 62.5%, rgba(0,0,0,0) 75%)" }} />
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(2px)", zIndex: 3, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 62.5%, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 87.5%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 62.5%, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 87.5%)" }} />
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(1px)", zIndex: 2, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 62.5%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 62.5%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(0.5px)", zIndex: 1, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)" }} />
        </div>
    );
};

export default BottomBlur;
