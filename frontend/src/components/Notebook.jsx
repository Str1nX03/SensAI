import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, FileText, Type } from "lucide-react";

const STORAGE_KEY = "sensai_notebook";
const NOTE_COLORS = [
  { id: "default", label: "Default", bg: "var(--bg-elevated)", border: "var(--border-strong)" },
  { id: "amber", label: "Amber", bg: "rgba(212,168,83,0.08)", border: "rgba(212,168,83,0.35)" },
  { id: "green", label: "Green", bg: "rgba(91,173,127,0.08)", border: "rgba(91,173,127,0.35)" },
  { id: "rose", label: "Rose", bg: "rgba(212,92,92,0.08)", border: "rgba(212,92,92,0.35)" },
  { id: "blue", label: "Blue", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.35)" },
];

function getNotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
function newNote(initialTitle = "Untitled Notebook") {
  const now = new Date().toISOString();
  return { id: Date.now(), title: initialTitle, content: "", color: "default", createdAt: now, updatedAt: now };
}

export default function Notebook() {
  const [notes, setNotes] = useState(getNotes);
  const [activeId, setActiveId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [fontTheme, setFontTheme] = useState('generic'); // Local Font State

  const active = notes.find(n => n.id === activeId) || null;

  useEffect(() => { saveNotes(notes); }, [notes]);

  const createNote = () => {
    const name = window.prompt("Enter a name for your new notebook:", "New Notebook") || "Untitled Notebook";
    const n = newNote(name);
    setNotes(prev => [n, ...prev]);
    setActiveId(n.id);
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeId === id) setActiveId(notes.find(n => n.id !== id)?.id || null);
    setConfirmDel(null);
  };

  const updateActive = useCallback((field, val) => {
    setNotes(prev => prev.map(n => {
      if (n.id === activeId) return { ...n, [field]: val, updatedAt: new Date().toISOString() };
      return n;
    }));
  }, [activeId]);

  const formatDateShort = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " at " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const colorOf = (colorId) => NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg-base)" }} data-font={fontTheme}>
      {/* ── NOTE LIST (left) ── */}
      <div style={{
        width: 240, flexShrink: 0, borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-surface)",
      }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>Notebooks</span>
          <button onClick={createNote} style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: "6px", cursor: "pointer", transition: "var(--transition)" }} title="New note"><Plus size={14} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
          {notes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              <FileText size={28} style={{ opacity: 0.3, display: "block", margin: "0 auto 0.5rem" }} /> No notes yet.
            </div>
          ) : notes.map(note => {
            const col = colorOf(note.color);
            const isActive = note.id === activeId;
            return (
              <div key={note.id} onClick={() => setActiveId(note.id)}
                style={{ padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", marginBottom: "3px", cursor: "pointer", background: isActive ? col.bg : "transparent", border: `1px solid ${isActive ? col.border : "transparent"}`, transition: "var(--transition)", position: "relative" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-hover)"; }} onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{note.title || "Untitled Notebook"}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>{formatDateShort(note.createdAt)}</div>
                <button onClick={e => { e.stopPropagation(); setConfirmDel(note.id); }} style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: "4px", color: "var(--text-muted)", cursor: "pointer", opacity: 0, transition: "opacity 0.15s" }} className="note-del-btn" title="Delete note"><Trash2 size={11} /></button>
              </div>
            );
          })}
        </div>

        {/* Font Control Only */}
        <div style={{ padding: "0.625rem", borderTop: "1px solid var(--border)" }}>
          <button onClick={() => setFontTheme(prev => prev === 'generic' ? 'handwritten' : 'generic')}
            style={{ width: "100%", padding: "0.5rem 0.625rem", display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: "0.78rem", cursor: "pointer", transition: "var(--transition)", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <Type size={13} style={{ opacity: 0.7 }} /> Font: {fontTheme === 'generic' ? 'Generic' : 'Handwritten'}
          </button>
        </div>
      </div>

      {/* ── EDITOR (right) ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {active ? (
          <>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-surface)", gap: "1rem" }}>
              <div style={{ flex: 1, fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <div>Created</div><div style={{ fontWeight: 600, marginTop: "2px" }}>{formatDateTime(active.createdAt)}</div>
              </div>
              <div style={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <input value={active.title} onChange={e => updateActive("title", e.target.value)} placeholder="Name your notebook…" style={{ width: "100%", textAlign: "center", background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, color: "var(--text-primary)", borderBottom: "1px dashed transparent", transition: "var(--transition)" }} onFocus={e => e.target.style.borderBottom = "1px dashed var(--border-strong)"} onBlur={e => e.target.style.borderBottom = "1px dashed transparent"} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", marginBottom: "6px" }}>
                  <div>Last Edited</div><div style={{ fontWeight: 600, marginTop: "2px" }}>{formatDateTime(active.updatedAt || active.createdAt)}</div>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {NOTE_COLORS.map(col => (
                    <button key={col.id} onClick={() => updateActive("color", col.id)} title={col.label} style={{ width: 12, height: 12, borderRadius: "50%", background: col.bg, border: `1.5px solid ${col.border}`, cursor: "pointer", outline: active.color === col.id ? `2px solid ${col.border}` : "none", outlineOffset: "1px", padding: 0 }} />
                  ))}
                </div>
              </div>
            </div>

            <textarea value={active.content} onChange={e => updateActive("content", e.target.value)} placeholder="Start writing your notes…"
              style={{
                flex: 1, padding: "1.5rem 2rem", background: "var(--bg-base)", color: "var(--text-primary)", border: "none", outline: "none", resize: "none",
                fontFamily: fontTheme === "handwritten" ? "var(--font-hand)" : "var(--font-body)", fontSize: fontTheme === "handwritten" ? "1.2rem" : "0.95rem", lineHeight: 1.8,
                backgroundImage: fontTheme === "handwritten" ? "linear-gradient(var(--border) 1px, transparent 1px)" : "none", backgroundSize: "100% 1.8em", backgroundPosition: "0 0.4rem",
              }} />
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            <FileText size={40} style={{ opacity: 0.2, marginBottom: "1rem" }} />
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>Select a notebook or create a new one</p>
          </div>
        )}
      </div>

      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-xl)", padding: "1.75rem", width: 300, textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ fontSize: "1.25rem", marginBottom: "0.375rem", fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Delete notebook?</div>
            <div style={{ display: "flex", gap: "0.625rem", marginTop: "1.5rem" }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: "9px", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-strong)", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => deleteNote(confirmDel)} style={{ flex: 1, padding: "9px", borderRadius: "var(--radius-md)", background: "var(--danger)", color: "#fff", border: "none", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <style>{`.note-del-btn { opacity: 0 !important; } div:hover > .note-del-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}