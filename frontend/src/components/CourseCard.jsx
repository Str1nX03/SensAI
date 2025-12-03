import React from "react";
import { BookOpen, CheckCircle } from "lucide-react";

export default function CourseCard({ course, isEditMode, isSelected, onClick }) {
    return (
        <div
            className={`bento-card ${isEditMode ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
        >
            {isEditMode && (
                <div className="selection-indicator">
                    {isSelected && <CheckCircle size={14} />}
                </div>
            )}

            <div className="card-top">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", color: "#666", fontSize: "0.8rem" }}>
                    <BookOpen size={14} />{course.subject}
                </div>
                <h4>{course.topic}</h4>
            </div>
            <span className="card-badge">Grade {course.standard}</span>
        </div>
    );
}
