import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DeleteModal({ show, count, onCancel, onConfirm }) {
    if (!show) return null;
    return (
        <div className="modal-overlay" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modal-icon">
                    <AlertTriangle size={32} />
                </div>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Delete Selected Courses?</h2>
                <p style={{ color: "#aaa", lineHeight: "1.6", marginBottom: "1rem" }}>
                    You are about to delete <b>{count}</b> course(s). This action is <b>permanent</b> and cannot be undone.
                </p>
                <div className="modal-actions">
                    <div className="btn btn-secondary" role="button" tabIndex={0} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onCancel(); }}>
                        Cancel
                    </div>
                    <div className="btn btn-danger" role="button" tabIndex={0} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConfirm(); }}>
                        Yes, Delete Permanently
                    </div>
                </div>
            </div>
        </div>
    );
}
