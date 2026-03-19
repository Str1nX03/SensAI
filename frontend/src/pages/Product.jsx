import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft, BookOpen, ChevronDown, PlusCircle, LayoutGrid, Palette, ExternalLink, Check
} from "lucide-react";
import GlobalProgressToast from "../components/GlobalProgressToast";
import { initTheme, cycleTheme, getTheme, THEME_META } from "../utils/theme";
import "../styles/product.css";

// ── Progress helpers (same keys as Dashboard) ─────────────────
const getProgress = () => {
    try { return JSON.parse(localStorage.getItem("sensai_progress") || "{}"); } catch { return {}; }
};
const saveProgress = (courseId, lessonKey) => {
    const all = getProgress();
    if (!all[courseId]) all[courseId] = {};
    all[courseId][lessonKey] = !all[courseId][lessonKey];
    localStorage.setItem("sensai_progress", JSON.stringify(all));
    return !!all[courseId][lessonKey];
};
const cacheLessons = (courseId, lessonKeys) => {
    localStorage.setItem(`sensai_lessons_${courseId}`, JSON.stringify(lessonKeys));
};

export default function Product() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse]               = useState(null);
    const [loading, setLoading]             = useState(true);
    const [expandedLessons, setExpandedLessons] = useState({});
    const [completedLessons, setCompletedLessons] = useState({});
    const [currentTheme, setCurrentTheme]   = useState(getTheme);

    // Init theme
    useEffect(() => { initTheme(); }, []);
    const handleThemeToggle = () => { const n = cycleTheme(); setCurrentTheme(n); };

    // Load progress from localStorage
    useEffect(() => {
        const all = getProgress();
        setCompletedLessons(all[id] || {});
    }, [id]);

    // Fetch course
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        axios.get(`http://localhost:5000/api/course/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const data = res.data.course || res.data;
            setCourse(data);
            setLoading(false);
        })
        .catch(err => { console.error(err); setLoading(false); });
    }, [id, navigate]);

    // Cache lesson keys once course loads (for progress page)
    useEffect(() => {
        if (!course?.lessons) return;
        const keys = Object.keys(course.lessons).sort((a, b) => {
            const n = t => { const m = t.match(/Lesson\s+(\d+)/i) || t.match(/(\d+)/); return m ? parseInt(m[1], 10) : 999; };
            return n(a) - n(b);
        });
        cacheLessons(id, keys);
    }, [course, id]);

    // ── Helpers ──
    const toggleLesson = (title) =>
        setExpandedLessons(prev => ({ ...prev, [title]: !prev[title] }));

    const toggleComplete = (e, lessonKey) => {
        e.stopPropagation();
        const newVal = saveProgress(id, lessonKey);
        setCompletedLessons(prev => ({ ...prev, [lessonKey]: newVal }));
    };

    const formatLessonNumber = n => String(n).padStart(2, "0");

    const cleanTitle = (title) => {
        const boldMatch = title.match(/\*\*(.*?)\*\*/);
        if (boldMatch?.[1]) return boldMatch[1].trim();
        return title.replace(/^[#\s]+/, '').replace(/\*\*/g, '').trim();
    };

    const cleanOverview = (text) => {
        if (!text) return "";
        return text
            .replace(/^[#]+\s*/gm, '')
            .replace(/\*\*/g, '')
            .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
            .trim();
    };

    const cleanLessonContent = (content) => {
        if (!content) return "";
        let c = content;
        c = c.replace(/^\s*(###|\*\*|##)\s*Lesson.*$/im, '');
        c = c.replace(/^\s*Lesson\s+\d+[:.].*$/im, '');
        c = c.replace(/Lesson\s+\d+:.*Lesson\s+\d+:.*\n?/i, '');
        c = c.replace(/^\s*###\s*/, '');
        return c.trim();
    };

    const extractLinks = (html) => {
        if (!html) return [];
        const matches = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi)];
        return matches.slice(0, 6).map(m => ({
            url: m[1],
            title: m[2].replace(/<[^>]+>/g, '').trim() || 'Resource'
        }));
    };

    const handleStartNewCourse = () =>
        navigate("/dashboard", { state: { activeTab: "generate", resetForm: true } });

    // ── Derived data ──
    if (loading) return (
        <div className="product-container">
            <div className="loading-container">
                <div style={{ fontSize:"1.5rem", marginBottom:"0.5rem", opacity:0.3 }}>◐</div>
                Loading course content…
            </div>
        </div>
    );
    if (!course) return (
        <div className="product-container">
            <div className="loading-container">Course unavailable. Please go back and try again.</div>
        </div>
    );

    const lessonKeys = course.lessons
        ? Object.keys(course.lessons).sort((a, b) => {
            const n = t => { const m = t.match(/Lesson\s+(\d+)/i) || t.match(/(\d+)/); return m ? parseInt(m[1], 10) : 999; };
            return n(a) - n(b);
        })
        : [];

    const completedCount = lessonKeys.filter(k => completedLessons[k]).length;
    const progressPct = lessonKeys.length > 0 ? Math.round((completedCount / lessonKeys.length) * 100) : 0;
    const studyLinks  = extractLinks(course.intro);
    const themeMeta   = THEME_META[currentTheme] || THEME_META.dark;

    return (
        <div className="product-container">
            <GlobalProgressToast />

            {/* ── NAV ── */}
            <nav className="product-nav">
                <button onClick={() => navigate("/dashboard")} className="nav-btn-back">
                    <ArrowLeft size={15} /> Dashboard
                </button>

                {/* Mini progress indicator */}
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    {lessonKeys.length > 0 && (
                        <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                            <div style={{
                                width: 80, height: 3,
                                background: "var(--border-strong)",
                                borderRadius: 3, overflow:"hidden"
                            }}>
                                <div style={{
                                    height:"100%", width:`${progressPct}%`,
                                    background:"var(--accent)", borderRadius:3,
                                    transition:"width 0.5s ease"
                                }} />
                            </div>
                            <span style={{ fontSize:"0.72rem", color:"var(--text-accent)", fontFamily:"var(--font-mono)" }}>
                                {progressPct}%
                            </span>
                        </div>
                    )}
                    <button onClick={handleThemeToggle} className="product-theme-btn" title={`Theme: ${themeMeta.label}`}>
                        <Palette size={13} />
                        {themeMeta.label}
                        <div className="product-theme-swatch" />
                    </button>
                </div>
            </nav>

            {/* ── MAIN ── */}
            <main className="product-main">
                <header className="product-header">
                    <h1 className="product-title">{course.topic}</h1>
                    <div className="product-meta">
                        <span>{course.subject?.toUpperCase() || "SUBJECT"}</span>
                        <div className="product-meta-sep" />
                        <span>GRADE {course.standard || "—"}</span>
                        <div className="product-meta-sep" />
                        <span>{lessonKeys.length} LESSONS</span>
                        {completedCount > 0 && (
                            <>
                                <div className="product-meta-sep" />
                                <span style={{ color:"var(--success)" }}>{completedCount} DONE</span>
                            </>
                        )}
                    </div>
                </header>

                <div className="product-layout">
                    {/* ── LEFT: Overview ── */}
                    <div className="overview-section">
                        <div className="overview-card">
                            <div className="overview-header">
                                <BookOpen size={12} />
                                Course Overview
                            </div>

                            <div className="overview-text" dangerouslySetInnerHTML={{ __html: cleanOverview(course.intro) }} />

                            {studyLinks.length > 0 && (
                                <>
                                    <div className="overview-links-title">Study Resources</div>
                                    <div style={{ display:"flex", flexDirection:"column", gap:"0.3rem" }}>
                                        {studyLinks.map((link, i) => (
                                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                               style={{
                                                   display:"flex", alignItems:"center", gap:"5px",
                                                   fontSize:"0.78rem", color:"var(--text-accent)",
                                                   padding:"0.325rem 0.5rem", borderRadius:"var(--radius-sm)",
                                                   background:"var(--accent-dim)", textDecoration:"none",
                                                   overflow:"hidden", transition:"var(--transition)",
                                               }}>
                                                <ExternalLink size={9} style={{ flexShrink:0 }} />
                                                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                                    {link.title}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Lessons ── */}
                    <div className="lessons-section">
                        <h2 className="lessons-title">Curriculum</h2>

                        {lessonKeys.length > 0 ? lessonKeys.map((title, i) => {
                            const isOpen = !!expandedLessons[title];
                            const isDone = !!completedLessons[title];
                            return (
                                <div key={i} className={`lesson-card ${isOpen ? "is-open" : ""} ${isDone ? "is-done" : ""}`}>
                                    <div className="lesson-header" onClick={() => toggleLesson(title)}>
                                        <div className="lesson-header-content">
                                            {/* Completion toggle button */}
                                            <button
                                                className={`lesson-complete-btn ${isDone ? "done" : ""}`}
                                                onClick={e => toggleComplete(e, title)}
                                                title={isDone ? "Mark as incomplete" : "Mark as complete"}
                                            >
                                                {isDone ? <Check size={9} /> : formatLessonNumber(i + 1)}
                                            </button>
                                            <h3 style={{ color: isDone ? "var(--text-muted)" : undefined,
                                                         textDecoration: isDone ? "line-through" : undefined }}>
                                                {cleanTitle(title)}
                                            </h3>
                                        </div>
                                        <ChevronDown size={15} className="lesson-chevron" />
                                    </div>

                                    {isOpen && (
                                        <div className="lesson-body">
                                            <div className="html-content"
                                                dangerouslySetInnerHTML={{ __html: cleanLessonContent(course.lessons[title]) }} />

                                            {course.tests?.[title] && (
                                                <div className="quiz-box">
                                                    <div className="quiz-header">
                                                        <BookOpen size={13} />
                                                        <span>Knowledge Check</span>
                                                    </div>
                                                    <div className="html-content"
                                                        dangerouslySetInnerHTML={{ __html: course.tests[title] }} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <p style={{ color:"var(--text-muted)", fontStyle:"italic", fontSize:"0.875rem" }}>
                                No lessons available for this course yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="product-footer">
                    <button onClick={() => navigate("/dashboard")} className="btn-dashboard">
                        <LayoutGrid size={14} /> Dashboard
                    </button>
                    <button onClick={handleStartNewCourse} className="btn-new-course">
                        <PlusCircle size={14} /> New Course
                    </button>
                </div>
            </main>
        </div>
    );
}