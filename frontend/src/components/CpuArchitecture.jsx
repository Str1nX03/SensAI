import React from "react";

// fallback cn if missing
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CpuArchitecture({
  className,
  width = "100%",
  height = "220px",
  centralLogoUrl = "/gojo.png",
  animateLines = true,
  animateMarkers = true,
}) {
  const nodes = [
    { text: "Agent 1", x: 25, y: 18 },
    { text: "Agent 3", x: 35, y: 38 },
    { text: "Agent 2", x: 150, y: 18 },
    { text: "YT Crawler", x: 130, y: 34 },
    { text: "PDF Scanner", x: 140, y: 54 },
    { text: "Web Scraper", x: 158, y: 72 },
    { text: "Vector Pusher", x: 78, y: 74 },
    { text: "Metadata Extractor", x: 90, y: 90 },
  ];

  return (
    <svg
      className={cn("text-muted", className)}
      width={width}
      height={height}
      viewBox="0 0 200 120"
      style={{ overflow: "visible" }}
    >
      {/* ================= PATH MAP ================= */}
      <g
        stroke="currentColor"
        fill="none"
        strokeWidth="0.35"
        strokeDasharray="100 100"
        pathLength="100"
        markerStart="url(#cpu-circle-marker)"
      >
        <path d="M 10 20 h 80 q 5 0 5 5 v 30" />
        <path d="M 180 20 h -75 q -5 0 -5 5 v 30" />
        <path d="M 130 30 v 25 q 0 5 -5 5 h -12" />
        <path d="M 170 90 v -25 q 0 -5 -5 -5 h -55" />
        <path d="M 135 72 h 17 q 5 0 5 5 v 12 q 0 5 -5 5 h -45 q -5 0 -5 -5 v -22" />
        <path d="M 95 110 v -38" />
        <path d="M 88 98 v -16 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -6 q 0 -5 5 -5 h 15" />
        <path d="M 28 30 h 27 q 5 0 5 5 v 8 q 0 5 5 5 h 19" />

        {animateLines && (
          <animate
            attributeName="stroke-dashoffset"
            from="100"
            to="0"
            dur="1.1s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25,0.1,0.5,1"
            keyTimes="0;1"
          />
        )}
      </g>

      {/* ================= GLOW TRAILS ================= */}
      {[1,2,3,4,5,6,7,8].map(i => (
        <g key={i} mask={`url(#cpu-mask-${i})`}>
          <circle cx="0" cy="0" r="9" fill={`url(#cpu-grad-${i})`} />
        </g>
      ))}

      {/* ================= CENTER GOJO CPU ================= */}
      <rect
        x="82"
        y="40"
        width="38"
        height="30"
        rx="5"
        fill="#0d0d0d"
        stroke="#2a2a2a"
        strokeWidth="0.8"
        filter="url(#cpu-shadow)"
      />

      {/* Center Logo */}
      <image
        href={centralLogoUrl}
        x="88"
        y="44"
        width="26"
        height="26"
        preserveAspectRatio="xMidYMid meet"
        style={{ imageRendering: "crisp-edges" }}
      />

      {/* ================= LABEL CAPSULES ================= */}
      {nodes.map((n, i) => (
        <foreignObject key={i} x={n.x - 22} y={n.y - 6} width="110" height="20">
          <div
            style={{
              fontSize: "6.5px",
              padding: "2px 6px",
              borderRadius: "10px",
              background: "#111",
              border: "1px solid #333",
              color: "#e5e5e5",
              fontFamily: "Inter, sans-serif",
              width: "fit-content",
              whiteSpace: "nowrap",
              opacity: 0.95,
            }}
          >
            {n.text}
          </div>
        </foreignObject>
      ))}

      <defs>
        {/* MASK PATHS */}
        {[1,2,3,4,5,6,7,8].map(i => (
          <mask id={`cpu-mask-${i}`} key={i}>
            <path
              d={
                [
                  "M 10 20 h 80 q 5 0 5 5 v 26",
                  "M 180 20 h -75 q -5 0 -5 5 v 26",
                  "M 130 30 v 24 q 0 5 -5 5 h -12",
                  "M 170 90 v -25 q 0 -5 -5 -5 h -55",
                  "M 135 72 h 17 q 5 0 5 5 v 12 q 0 5 -5 5 h -45 q -5 0 -5 -5 v -22",
                  "M 95 110 v -38",
                  "M 88 98 v -16 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -6 q 0 -5 5 -5 h 15",
                  "M 28 30 h 27 q 5 0 5 5 v 8 q 0 5 5 5 h 19",
                ][i-1]
              }
              stroke="white"
              strokeWidth="0.5"
            />
          </mask>
        ))}

        {/* GLOW GRADIENTS */}
        {[
          "#00E8ED", "#FFD800", "#B642FF", "#FFF",
          "#22c55e", "#f97316", "#06b6d4", "#f43f5e"
        ].map((color, i) => (
          <radialGradient id={`cpu-grad-${i+1}`} key={i}>
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        ))}

        {/* Pulsating Marker */}
        <marker
          id="cpu-circle-marker"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="12"
          markerHeight="12"
        >
          <circle
            cx="5"
            cy="5"
            r="2"
            fill="black"
            stroke="#232323"
            strokeWidth="0.5"
          >
            {animateMarkers && (
              <animate attributeName="r" values="0;3;2" dur="0.5s" repeatCount="indefinite" />
            )}
          </circle>
        </marker>

        {/* Shadow under Gojo CPU block */}
        <filter id="cpu-shadow">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
    </svg>
  );
}
