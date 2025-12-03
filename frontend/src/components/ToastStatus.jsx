import React from "react";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function ToastStatus({
    generationStatus, progress, formTopic, onClick
}) {
    if (generationStatus === "idle") return null;

    return (
        <div
            className="floating-status"
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-live="polite"
            style={{
                borderColor: generationStatus === "completed" ? "#03ae00" : "#333",
                opacity: generationStatus === "completed" ? 1 : 0.8
            }}
        >
            {generationStatus === "running" ? (
                <>
                    <div className="status-dot" />
                    <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff", display: "block" }}>Agents Active</span>
                        <span style={{ fontSize: "0.75rem", color: "#888" }}>Building "{formTopic}" ({Math.round(progress)}%)</span>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ color: "#03ae00", display: "flex", alignItems: "center" }}><CheckCircle size={18} /></div>
                    <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff", display: "block" }}>Course Ready!</span>
                        <span style={{ fontSize: "0.75rem", color: "#03ae00", fontWeight: "bold" }}>Click to Open <ArrowRight size={10} style={{ display: "inline" }} /></span>
                    </div>
                </>
            )}
        </div>
    );
}
