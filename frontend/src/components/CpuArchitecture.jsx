import React, { useMemo, useState } from "react";

// NOTE: dashboardStyles removed — it was injecting --accent: #a855f7 (purple)
// into :root and overriding the entire theme system globally.

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const NODES = [
  { text: "Agent 1", x: 15, y: 37 },
  { text: "Agent 2", x: 30, y: 66 },
  { text: "Agent 3", x: 50, y: 97 },
  { text: "Web Crawler", x: 165, y: 26 },
  { text: "Web Scraper", x: 180, y: 51 },
  { text: "Yt Crawler", x: 195, y: 75 },
  { text: "Transcribing", x: 158, y: 101 },
  { text: "Metadata Extractor", x: 80, y: 130 },
];

const CONNECTIONS = [
  "M 35 35 H 90 q 5 0 5 5 V 40",
  "M 50 64 H 82",
  "M 70 95 H 90 q 5 0 5 -5 V 70",
  "M 165 24 H 110 q -5 0 -5 5 V 40",
  "M 180 49 H 110",
  "M 195 74 H 125 q -5 0 -5 -5 V 55 H 120",
  "M 158 99 H 112 q -5 0 -5 -5 V 70",
  "M 101 120 V 70",
];

const GRADIENT_IDS = [
  "cpu-blue-grad", "cpu-yellow-grad", "cpu-pinkish-grad", "cpu-white-grad",
  "cpu-green-grad", "cpu-orange-grad", "cpu-cyan-grad", "cpu-rose-grad",
];

export default function CpuArchitecture({
  className,
  width = "100%",
  height = "220px",
  centralLogoUrl = "/gojo.png",
}) {
  const [isHovered, setIsHovered] = useState(false);

  const connectionParams = useMemo(() =>
    CONNECTIONS.map((_, i) => ({
      duration: `${2 + (i * 12.345 % 1) * 2}s`,
      delay: `${-(i * 45.678 % 1) * 5}s`,
      colorId: GRADIENT_IDS[i % GRADIENT_IDS.length],
    })),
    []);

  return (
    <svg
      className={cn("text-muted", className)}
      width={width}
      height={height}
      viewBox="0 0 200 140"
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        {CONNECTIONS.map((pathD, i) => (
          <path key={`path-def-${i}`} id={`path-${i}`} d={pathD} />
        ))}
        {CONNECTIONS.map((pathD, i) => (
          <mask key={`mask-${i}`} id={`cpu-mask-${i}`}>
            <path d={pathD} stroke="white" strokeWidth="1.5" fill="none"
              strokeLinecap="round" strokeLinejoin="round" />
          </mask>
        ))}

        <radialGradient id="cpu-blue-grad" fx="1">
          <stop offset="0%" stopColor="#00E8ED" /><stop offset="50%" stopColor="#08F" /><stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-yellow-grad" fx="1">
          <stop offset="0%" stopColor="#FFD800" /><stop offset="50%" stopColor="#FFD800" /><stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-pinkish-grad" fx="1">
          <stop offset="0%" stopColor="#d10c5e" /><stop offset="50%" stopColor="#9e0c49" /><stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-white-grad" fx="1">
          <stop offset="0%" stopColor="white" /><stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-green-grad" fx="1">
          <stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-orange-grad" fx="1">
          <stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-cyan-grad" fx="1">
          <stop offset="0%" stopColor="#06b6d4" /><stop offset="50%" stopColor="#4374d8" /><stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cpu-rose-grad" fx="1">
          <stop offset="0%" stopColor="#ff002b" /><stop offset="50%" stopColor="#cd1736" /><stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="core-purple-grad">
          <stop offset="0%" stopColor="#d946ef" stopOpacity="1" />
          <stop offset="40%" stopColor="#a855f7" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#7e22ce" stopOpacity="0.8" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="cpu-glow-shadow" x="-80%" y="-80%" width="260%" height="260%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#d946ef" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Rails */}
      <g stroke="#555" fill="none" strokeWidth="0.5" opacity="0.2">
        {CONNECTIONS.map((pathD, i) => <path key={i} d={pathD} />)}
      </g>

      {/* Animated orbs */}
      {CONNECTIONS.map((_, i) => (
        <g key={i} mask={`url(#cpu-mask-${i})`}>
          <circle r="8" fill={`url(#${connectionParams[i].colorId})`} cx="0" cy="0">
            <animateMotion dur={connectionParams[i].duration} begin={connectionParams[i].delay}
              repeatCount="indefinite" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1">
              <mpath href={`#path-${i}`} />
            </animateMotion>
          </circle>
        </g>
      ))}

      {/* Breathing purple core */}
      <g transform="translate(101, 55)">
        <circle r="20" fill="url(#core-purple-grad)">
          <animate attributeName="r" values="18;26;18" dur="4s" repeatCount="indefinite"
            calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"
            calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
        </circle>
      </g>

      {/* Center circle */}
      <circle cx="101" cy="55" r="19" fill="#6e076e" stroke="#54515320"
        strokeWidth="1" filter="url(#cpu-glow-shadow)" />

      <image href={centralLogoUrl} x="88.5" y="42.5" width="25" height="25"
        style={{ pointerEvents: "none" }}
        onError={e => { e.target.style.display = "none"; }} />

      {/* Hover hitbox */}
      <circle cx="101" cy="55" r="40" fill="transparent" style={{ cursor: "pointer" }}
        onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} />

      {isHovered && (
        <foreignObject x="61" y="10" width="80" height="30" style={{ overflow: "visible", pointerEvents: "none" }}>
          <div style={{
            background: "white", color: "black", padding: "2px 6px", borderRadius: "6px",
            fontSize: "8px", fontWeight: "800", textAlign: "center", position: "relative",
            boxShadow: "0 2px 10px rgba(0,0,0,0.5)", fontFamily: "sans-serif",
            border: "1px solid #ccc", animation: "popIn 0.2s cubic-bezier(0.175,0.885,0.32,1.275)"
          }}>
            Nah, I'd win.
            <div style={{
              position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
              borderTop: "4px solid white"
            }} />
          </div>
          <style>{`@keyframes popIn { from { transform:scale(0.5); opacity:0; } to { transform:scale(1); opacity:1; } }`}</style>
        </foreignObject>
      )}

      {/* Labels */}
      {NODES.map((n, i) => (
        <foreignObject key={i} x={n.x - 20} y={n.y - 12} width="100" height="24">
          <div style={{
            fontSize: "8px", padding: "3px 10px", borderRadius: "99px",
            background: "rgba(10,10,10,0.85)", border: "1px solid #444",
            color: "#b0b0b0", fontFamily: "sans-serif",
            width: "fit-content", whiteSpace: "nowrap", backdropFilter: "blur(2px)"
          }}>
            {n.text}
          </div>
        </foreignObject>
      ))}
    </svg>
  );
}