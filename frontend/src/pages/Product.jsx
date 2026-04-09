import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft, BookOpen, ChevronDown, PlusCircle, LayoutGrid,
    Palette, ExternalLink, Check, CheckCircle, Download, FileText, Type, X
} from "lucide-react";
import GlobalProgressToast from "../components/GlobalProgressToast";
import { initTheme, cycleTheme, getTheme, THEME_META } from "../utils/theme";
import "../styles/product.css";

/* ── Storage helpers ─────────────────────────────────────── */
const getProgress = () => { try { return JSON.parse(localStorage.getItem("sensai_progress") || "{}"); } catch { return {}; } };
const saveProgress = (courseId, lessonKey) => {
    const all = getProgress();
    if (!all[courseId]) all[courseId] = {};
    all[courseId][lessonKey] = !all[courseId][lessonKey];
    localStorage.setItem("sensai_progress", JSON.stringify(all));
    return !!all[courseId][lessonKey];
};
const markAllComplete = (courseId, lessonKeys) => {
    const all = getProgress();
    all[courseId] = {};
    lessonKeys.forEach(k => { all[courseId][k] = true; });
    localStorage.setItem("sensai_progress", JSON.stringify(all));
};
const unmarkAllComplete = (courseId) => {
    const all = getProgress();
    all[courseId] = {}; // Clear all checks for this course
    localStorage.setItem("sensai_progress", JSON.stringify(all));
};

const cacheLessons = (courseId, keys) => localStorage.setItem(`sensai_lessons_${courseId}`, JSON.stringify(keys));

/* ── PDF helpers ─────────────────────────────────────────── */
const CLEAN_PDF_CSS = `
        * { box-sizing: border-box; }
        body { font-family: Georgia, serif; font-size: 13pt; color: #111; background: #fff; margin: 0; padding: 0; }
        .pdf-cover { padding: 60px 60px 40px; border-bottom: 2px solid #111; margin-bottom: 40px; }
        .pdf-cover h1 { font-size: 28pt; margin: 0 0 8px; color: #111; }
        .pdf-cover p  { color: #555; font-size: 11pt; margin: 0; }
        .pdf-lesson   { padding: 32px 60px; page-break-after: always; }
        .pdf-lesson h2 { font-size: 16pt; margin: 0 0 16px; border-bottom: 1px solid #ddd; padding-bottom: 8px; color: #111; }
        h1,h2,h3 { color: #111; } p { color: #333; line-height: 1.7; }
        ul,ol { color:#333; padding-left:24px; } li { margin-bottom:4px; }
        strong,b { color:#000; font-weight:700; }
        code { background:#f3f3f3; padding:2px 6px; border-radius:3px; font-family:monospace; font-size:0.85em; }
        pre  { background:#f3f3f3; padding:14px; border-radius:6px; overflow-x:auto; font-family:monospace; font-size:0.85em; }
        blockquote { border-left:3px solid #888; padding:8px 14px; color:#555; font-style:italic; margin:16px 0; }
        @media print { .pdf-lesson { page-break-after: always; } }
        `;

function buildPrintHTML(course, lessonKeys, cssStyle, isGoogleFont) {
    const gfont = isGoogleFont ? `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">` : "";
    const lessons = lessonKeys.map((key, i) => `
                <div class="pdf-lesson">
                    <h2>Lesson ${String(i + 1).padStart(2, "0")} — ${key.replace(/^Lesson\s+\d+[:.]?\s*/i, "").replace(/\*\*/g, "").trim()}</h2>
                    ${(course.lessons[key] || "").replace(/^\s*(###|\*\*|##)\s*Lesson.*$/im, "").trim()}
                </div>
            `).join("");
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">${gfont}<style>${cssStyle}</style><title>${course.topic}</title></head><body>
                <div class="pdf-cover">
                    <h1>${course.topic}</h1>
                    <p>${course.subject?.toUpperCase()} &nbsp;·&nbsp; Grade ${course.standard} &nbsp;·&nbsp; ${lessonKeys.length} Lessons</p>
                </div>
                ${lessons}
            </body></html>`;
}

function downloadPDF(course, lessonKeys) {
    const html = buildPrintHTML(course, lessonKeys, CLEAN_PDF_CSS, false);
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to download the PDF."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 600);
}

/* ── Component ───────────────────────────────────────────── */
export default function Product() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedLessons, setExpandedLessons] = useState({});
    const [completedLessons, setCompletedLessons] = useState({});
    const [allDone, setAllDone] = useState(false);

    // 1. Sync color theme globally using your utils
    const [currentTheme, setCurrentTheme] = useState(getTheme);
    // 2. Keep font theme completely local
    const [fontTheme, setFontTheme] = useState('generic');

    // Ensure theme is applied to document.body on mount
    useEffect(() => { initTheme(); }, []);

    const handleThemeToggle = () => {
        const next = cycleTheme();
        setCurrentTheme(next);
    };

    useEffect(() => {
        const all = getProgress(); setCompletedLessons(all[id] || {});
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        axios.get(`http://localhost:5000/api/course/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => { setCourse(res.data.course || res.data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, [id, navigate]);

    useEffect(() => {
        if (!course?.lessons) return;
        const keys = Object.keys(course.lessons).sort((a, b) => {
            const n = t => { const m = t.match(/Lesson\s+(\d+)/i) || t.match(/(\d+)/); return m ? parseInt(m[1], 10) : 999; };
            return n(a) - n(b);
        });
        cacheLessons(id, keys);
    }, [course, id]);

    const lessonKeys = course?.lessons
        ? Object.keys(course.lessons).sort((a, b) => {
            const n = t => { const m = t.match(/Lesson\s+(\d+)/i) || t.match(/(\d+)/); return m ? parseInt(m[1], 10) : 999; };
            return n(a) - n(b);
        })
        : [];

    /* Check if all complete */
    useEffect(() => {
        if (!lessonKeys.length) return;
        setAllDone(lessonKeys.every(k => completedLessons[k]));
    }, [completedLessons, lessonKeys.length]);

    const toggleLesson = title => setExpandedLessons(p => ({ ...p, [title]: !p[title] }));
    const toggleComplete = (e, key) => {
        e.stopPropagation();
        const v = saveProgress(id, key);
        setCompletedLessons(p => ({ ...p, [key]: v }));
    };

    const handleToggleAllComplete = () => {
        if (allDone) {
            unmarkAllComplete(id);
            setCompletedLessons({});
            setAllDone(false);
        } else {
            markAllComplete(id, lessonKeys);
            const map = {};
            lessonKeys.forEach(k => { map[k] = true; });
            setCompletedLessons(map);
            setAllDone(true);
        }
    };

    const formatNum = n => String(n).padStart(2, "0");
    const cleanTitle = t => {
        const m = t.match(/\*\*(.*?)\*\*/);
        if (m?.[1]) return m[1].trim();
        return t.replace(/^[#\s]+/, "").replace(/\*\*/g, "").trim();
    };
    const cleanOverview = t => {
        if (!t) return "";
        return t.replace(/^[#]+\s*/gm, "").replace(/\*\*/g, "")
            .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ').trim();
    };
    const cleanContent = c => {
        if (!c) return "";
        let s = c;
        s = s.replace(/^\s*(###|\*\*|##)\s*Lesson.*$/im, "");
        s = s.replace(/^\s*Lesson\s+\d+[:.].*$/im, "");
        s = s.replace(/Lesson\s+\d+:.*Lesson\s+\d+:.*\n?/i, "");
        s = s.replace(/^\s*###\s*/, "");
        return s.trim();
    };
    const extractLinks = html => {
        if (!html) return [];
        const m = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi)];
        return m.slice(0, 6).map(x => ({ url: x[1], title: x[2].replace(/<[^>]+>/g, "").trim() || "Resource" }));
    };

    if (loading) return (
        <div className="product-container">
            <div className="loading-container"><div style={{ fontSize: "1.5rem", marginBottom: "0.5rem", opacity: 0.3 }}>◐</div>Loading…</div>
        </div>
    );
    if (!course) return (
        <div className="product-container">
            <div className="loading-container">Course unavailable. Please go back and try again.</div>
        </div>
    );

    const completed = lessonKeys.filter(k => completedLessons[k]).length;
    const pct = lessonKeys.length > 0 ? Math.round((completed / lessonKeys.length) * 100) : 0;
    const studyLinks = extractLinks(course.intro);
    const themeMeta = THEME_META[currentTheme] || THEME_META.dark;
    return (
        <div className="product-container" data-font={fontTheme}>
            <GlobalProgressToast />

            <nav className="product-nav">
                <button onClick={() => navigate("/dashboard")} className="nav-btn-back">
                    <ArrowLeft size={15} /> Dashboard
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {lessonKeys.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <div style={{ width: 80, height: 3, background: "var(--border-strong)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 3, transition: "width 0.5s ease" }} />
                            </div>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-accent)", fontFamily: "var(--font-mono)" }}>{pct}%</span>
                        </div>
                    )}

                    {/* Synchronized Global Theme Button */}
                    <button onClick={handleThemeToggle} className="product-theme-btn">
                        <Palette size={13} /> {themeMeta.label} Theme
                    </button>

                    {/* Localized Font Button */}
                    <button onClick={() => setFontTheme(prev => prev === 'generic' ? 'handwritten' : 'generic')} className="product-theme-btn">
                        <Type size={13} /> Font: {fontTheme === 'generic' ? 'Generic' : 'Handwritten'}
                    </button>
                </div>
            </nav>

            {/* MAIN */}
            <main className="product-main">
                <header className="product-header">
                    <h1 className="product-title">{course.topic}</h1>
                    <div className="product-meta">
                        <span>{course.subject?.toUpperCase() || "SUBJECT"}</span>
                        <div className="product-meta-sep" /><span>GRADE {course.standard || "—"}</span>
                        <div className="product-meta-sep" /><span>{lessonKeys.length} LESSONS</span>
                        {completed > 0 && (<><div className="product-meta-sep" /><span style={{ color: "var(--success)" }}>{completed} DONE</span></>)}
                    </div>
                </header>

                <div className="product-layout">
                    {/* LEFT: Overview */}
                    <div className="overview-section">
                        <div className="overview-card">
                            <div className="overview-header"><BookOpen size={12} /> Course Overview</div>
                            <div className="overview-text" dangerouslySetInnerHTML={{ __html: cleanOverview(course.intro) }} />
                            {studyLinks.length > 0 && (
                                <>
                                    <div className="overview-links-title">Study Resources</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                        {studyLinks.map((link, i) => (
                                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", color: "var(--text-accent)", padding: "0.325rem 0.5rem", borderRadius: "var(--radius-sm)", background: "var(--accent-dim)", textDecoration: "none", overflow: "hidden", transition: "var(--transition)" }}>
                                                <ExternalLink size={9} style={{ flexShrink: 0 }} />
                                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Lessons */}
                    {/* RIGHT: Lessons */}
                    <div className="lessons-section">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <h2 className="lessons-title" style={{ margin: 0 }}>Curriculum</h2>

                            {/* Toggle Complete/Incomplete Button */}
                            {lessonKeys.length > 0 && (
                                <button
                                    onClick={handleToggleAllComplete}
                                    className="complete-all-btn"
                                    title={allDone ? "Mark all lessons as incomplete" : "Mark all lessons as complete"}
                                    style={allDone ? {
                                        background: "transparent",
                                        borderColor: "var(--border-strong)",
                                        color: "var(--text-secondary)"
                                    } : {}}
                                >
                                    {allDone ? <X size={14} /> : <CheckCircle size={14} />}
                                    {allDone ? "Mark All Incomplete" : "Mark All Complete"}
                                </button>
                            )}
                        </div>

                        {lessonKeys.length > 0 ? lessonKeys.map((title, i) => {
                            const isOpen = !!expandedLessons[title];
                            const isDone = !!completedLessons[title];
                            return (
                                <div key={i} className={`lesson-card${isOpen ? " is-open" : ""}${isDone ? " is-done" : ""}`}>
                                    <div className="lesson-header" onClick={() => toggleLesson(title)}>
                                        <div className="lesson-header-content">
                                            <button className={`lesson-complete-btn${isDone ? " done" : ""}`}
                                                onClick={e => toggleComplete(e, title)}
                                                title={isDone ? "Mark incomplete" : "Mark complete"}>
                                                {isDone ? <Check size={9} /> : formatNum(i + 1)}
                                            </button>
                                            <h3 style={{ color: isDone ? "var(--text-muted)" : undefined, textDecoration: isDone ? "line-through" : undefined }}>
                                                {cleanTitle(title)}
                                            </h3>
                                        </div>
                                        <ChevronDown size={15} className="lesson-chevron" />
                                    </div>
                                    {isOpen && (
                                        <div className="lesson-body">
                                            <div className="html-content" dangerouslySetInnerHTML={{ __html: cleanContent(course.lessons[title]) }} />
                                            {course.tests?.[title] && (
                                                <div className="quiz-box">
                                                    <div className="quiz-header"><BookOpen size={13} /><span>Knowledge Check</span></div>
                                                    <div className="html-content" dangerouslySetInnerHTML={{ __html: course.tests[title] }} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.875rem" }}>No lessons available.</p>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="product-footer">
                    <button onClick={() => navigate("/dashboard")} className="btn-dashboard">
                        <LayoutGrid size={14} /> Dashboard
                    </button>
                    {/* PDF download buttons */}
                    <div className="pdf-btn-group">
                        <button onClick={() => downloadPDF(course, lessonKeys)} className="pdf-btn" title="Download PDF">
                            <FileText size={14} /> Download PDF
                        </button>
                    </div>
                    <button onClick={() => navigate("/dashboard", { state: { activeTab: "generate", resetForm: true } })} className="btn-new-course">
                        <PlusCircle size={14} /> New Course
                    </button>
                </div>
            </main>
        </div>
    );
}