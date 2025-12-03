import React, { useMemo } from "react";

// --- EMBEDDED CSS STYLES ---
const dashboardStyles = `
/* Define variables for standalone usage */
:root {
  --bg-app: #050505;
  --bg-surface: #0a0a0a;
  --bg-surface-hover: #111;
  --text-primary: #ededed;
  --text-secondary: #a1a1aa;
  --border-subtle: #222;
  --border-strong: #333;
  --radius: 8px;
  --accent: #a855f7;
}

.app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-app);
  color: var(--text-primary);
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  flex-shrink: 0;
  z-index: 10;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #222;
}

.user-info h3 {
  font-size: 0.95rem;
  margin: 0;
  color: var(--text-primary);
}

.user-info p {
  font-size: 0.75rem;
  margin: 0;
  color: var(--text-secondary);
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  color: var(--text-secondary);
  background: transparent;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.nav-item:hover, .nav-item.active {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.main-content-area {
  flex-grow: 1;
  padding: 2rem 3rem;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding-bottom: 4rem;
}

.bento-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.bento-card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
}

.create-card {
  border: 1px dashed var(--border-strong);
  background: transparent;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-secondary);
}

.create-card:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(255, 255, 255, 0.03);
}

.card-top h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.card-badge {
  align-self: flex-start;
  font-size: 0.75rem;
  padding: 4px 10px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 20px;
  color: #888;
}

.cpu-architecture {
  transform-origin: 0 0;
}
`;

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
  "cpu-blue-grad",
  "cpu-yellow-grad",
  "cpu-pinkish-grad",
  "cpu-white-grad",
  "cpu-green-grad",
  "cpu-orange-grad",
  "cpu-cyan-grad",
  "cpu-rose-grad",
];

export default function CpuArchitecture({
  className,
  width = "100%",
  height = "220px",
  centralLogoUrl = "/gojo.png",
}) {
  const connectionParams = useMemo(() => {
    return CONNECTIONS.map((_, i) => {
      const seed = (i * 12.345) % 1;
      const seed2 = (i * 45.678) % 1;

      return {
        duration: `${2 + seed * 2}s`,
        delay: `${-(seed2 * 5)}s`,
        colorId: GRADIENT_IDS[i % GRADIENT_IDS.length],
      };
    });
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
      <svg
        className={cn("text-muted", className)}
        width={width}
        height={height}
        viewBox="0 0 200 140"
        style={{ overflow: "visible" }}
      >
        <defs>
          {CONNECTIONS.map((pathD, i) => (
            <path key={`path-def-${i}`} id={`path-${i}`} d={pathD} />
          ))}

          {CONNECTIONS.map((pathD, i) => (
            <mask key={`mask-${i}`} id={`cpu-mask-${i}`}>
              <path
                d={pathD}
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          ))}

          {/* === Gradients === */}
          <radialGradient id="cpu-blue-grad" fx="1">
            <stop offset="0%" stopColor="#00E8ED" />
            <stop offset="50%" stopColor="#08F" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <radialGradient id="cpu-yellow-grad" fx="1">
            <stop offset="0%" stopColor="#FFD800" />
            <stop offset="50%" stopColor="#FFD800" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <radialGradient id="cpu-pinkish-grad" fx="1">
            <stop offset="0%" stopColor="#d10c5eff" />
            <stop offset="50%" stopColor="#9e0c49ff" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <radialGradient id="cpu-white-grad" fx="1">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <radialGradient id="cpu-green-grad" fx="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <radialGradient id="cpu-orange-grad" fx="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <radialGradient id="cpu-cyan-grad" fx="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#4374d8ff" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <radialGradient id="cpu-rose-grad" fx="1">
            <stop offset="0%" stopColor="#ff002bff" />
            <stop offset="50%" stopColor="#cd1736ae" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Deep Saturated Purple Core Gradient */}
          <radialGradient id="core-purple-grad">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="1" />
            <stop offset="40%" stopColor="#a855f7" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#7e22ce" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <filter id="cpu-glow-shadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="6"
              floodColor="#d946ef"
              floodOpacity="0.8"
            />
          </filter>
        </defs>

        {/* === Rails  === */}
        <g stroke="currentColor" fill="none" strokeWidth="0.5" opacity="0.15">
          {CONNECTIONS.map((pathD, i) => (
            <path key={i} d={pathD} />
          ))}
        </g>

        {/* === ANIMATED FLOW ORBS (Masked) === */}
        {CONNECTIONS.map((_, i) => (
          <g key={i} mask={`url(#cpu-mask-${i})`}>
            <circle
              r="8"
              fill={`url(#${connectionParams[i].colorId})`}
              cx="0"
              cy="0"
            >
              <animateMotion
                dur={connectionParams[i].duration}
                begin={connectionParams[i].delay}
                repeatCount="indefinite"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              >
                <mpath href={`#path-${i}`} />
              </animateMotion>
            </circle>
          </g>
        ))}

        {/* === Breathing Purple Core === */}
        <g transform="translate(101, 55)">
          <circle r="20" fill="url(#core-purple-grad)">
            {/* Pulsating Size */}
            <animate
              attributeName="r"
              values="18;26;18"
              dur="4s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.5;1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
            {/* Breathing Opacity */}
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="4s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.5;1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </circle>
        </g>

        {/* === Center Circle === */}
        <circle
          cx="101"
          cy="55"
          r="19"
          fill="#6e076eff"
          stroke="#5451532a"
          strokeWidth="1"
          filter="url(#cpu-glow-shadow)"
        />

        {/* Fallback image or icon if URL fails */}
        <image
          href={centralLogoUrl}
          x="88.5"
          y="42.5"
          width="25"
          height="25"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />

        {/* === Labels (CAPSULE STYLE) === */}
        {NODES.map((n, i) => (
          <foreignObject key={i} x={n.x - 20} y={n.y - 12} width="100" height="24">
            <div
              style={{
                fontSize: "8px",
                padding: "3px 10px",
                borderRadius: "99px",
                background: "rgba(10, 10, 10, 0.8)",
                border: "1px solid #333",
                color: "#a1a1aa",
                fontFamily: "Inter, sans-serif",
                width: "fit-content",
                whiteSpace: "nowrap",
                textAlign: "center",
                backdropFilter: "blur(2px)"
              }}
            >
              {n.text}
            </div>
          </foreignObject>
        ))}
      </svg>
    </>
  );
}