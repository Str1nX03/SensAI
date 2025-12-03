import React from "react";
import { Edit3, Trash2, X } from "lucide-react";

export default function EditCapsule({ isEditMode, onToggleEdit, selectedCount, onOpenDelete }) {
    return (
        <div className="edit-capsule-container">
            {!isEditMode ? (
                <div className="edit-btn-initial" onClick={onToggleEdit} role="button" tabIndex={0}>
                    <Edit3 size={16} /> Manage
                </div>
            ) : (
                <div className="edit-capsule">
                    <div
                        className={`capsule-btn delete ${selectedCount === 0 ? 'disabled' : ''}`}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (selectedCount > 0) onOpenDelete();
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <Trash2 size={16} /> Delete ({selectedCount})
                    </div>
                    <div style={{ width: "1px", height: "16px", background: "#333", margin: "0 4px" }}></div>
                    <div
                        className="capsule-btn cancel"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleEdit();
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <X size={18} />
                    </div>
                </div>
            )}
        </div>
    );
}
