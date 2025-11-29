// src/components/NeonOrbs.jsx
import React, { useEffect, useState } from "react";
import "../styles/neon-orbs.css"; 

export default function NeonOrbs() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      className="neon-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#050a18", // Force dark background here
        zIndex: 0, // Set to 0 so it's not behind the body
        pointerEvents: "none"
      }}
    >
      {/* Top-left orb */}
      <div className={`orb-position orb-top-left ${mounted ? "visible" : ""}`}>
        <div className="orb-inner beam-spin-8">
          <div className="beam-light" />
        </div>
      </div>

      {/* Bottom-center orb */}
      <div className={`orb-position orb-bottom-center ${mounted ? "visible" : ""}`}>
        <div className="orb-inner beam-spin-10-reverse">
          <div className="beam-light" />
        </div>
      </div>

      {/* Top-right orb */}
      <div className={`orb-position orb-top-right ${mounted ? "visible" : ""}`}>
        <div className="orb-inner beam-spin-6">
          <div className="beam-light" />
        </div>
      </div>

      {/* Bottom-right orb */}
      <div className={`orb-position orb-bottom-right ${mounted ? "visible" : ""}`}>
        <div className="orb-inner beam-spin-7-reverse">
          <div className="beam-light" />
        </div>
      </div>
    </div>
  );
}