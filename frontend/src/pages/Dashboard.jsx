import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutGrid, LogOut, PlusCircle, BookOpen, Activity, Cpu, Clock, Sparkles,
    Loader2, CheckCircle, Trash2, AlertTriangle, X, ServerCrash, ArrowLeft,
    Palette, TrendingUp, GripVertical, List, Check, ChevronRight
} from "lucide-react";
import CpuArchitecture from "../components/CpuArchitecture";
import GlobalProgressToast from "../components/GlobalProgressToast";
import { initTheme, cycleTheme, getTheme, THEME_META } from "../utils/theme";
import "../styles/dashboard.css";

// ─── Constants ───────────────────────────────────────────────
const CATALOG_DATA = {
    "Mathematics":      ["Calculus","Matrix","Multiplication","Trigonometry","Mensuration","Algebra","Geometry","Statistics"],
    "Physics":          ["Kinematics","Thermodynamics","Electromagnetism","Optics","Quantum Mechanics","Nuclear Physics","Astrophysics"],
    "Chemistry":        ["Organic Chemistry","Inorganic Chemistry","Physical Chemistry","Nuclear Chemistry","Analytical Chemistry","Environmental Chemistry"],
    "Biology":          ["Genetics","Cell Biology","Ecology","Evolution","Molecular Biology","Immunity","Neuroscience"],
    "Computer Science": ["Data Structures","Algorithms","Web Development","Artificial Intelligence","Database Management","Cybersecurity","Operating Systems","Machine Learning","Cloud Computing"]
};

const MOCK_USAGE_LOGS = [
    { id:1, agent:"RAG+",  action:"Better Accuracy",       tokens:"Beta",            time:"Active",      status:"free" },
    { id:2, agent:"Usage", action:"Token and Log Count",   tokens:"under progress",  time:"coming soon", status:"warn" },
    { id:3, agent:"PDF",   action:"Download PDF",          tokens:"ongoing",         time:"coming soon", status:"warn" },
];

const GENERATION_DURATION_MS = 3 * 60 * 1000;

// ─── Progress helpers (localStorage) ─────────────────────────
const getProgress = () => { try { return JSON.parse(localStorage.getItem("sensai_progress") || "{}"); } catch { return {}; } };
const setProgress = (p) => localStorage.setItem("sensai_progress", JSON.stringify(p));
const getLessonsCache = (id) => { try { return JSON.parse(localStorage.getItem(`sensai_lessons_${id}`) || "null"); } catch { return null; } };
const getCardOrder = () => { try { return JSON.parse(localStorage.getItem("sensai_card_order") || "null"); } catch { return null; } };
const setCardOrder = (o) => localStorage.setItem("sensai_card_order", JSON.stringify(o));

// ─── Subcomponents ────────────────────────────────────────────

/** Progress card with subway-map lesson nodes */
function ProgressCourseCard({ course, onOpenCourse }) {
    const lessonKeys = getLessonsCache(course.id) || [];
    const allProgress = getProgress();
    const courseProgress = allProgress[course.id] || {};

    const [localProg, setLocalProg] = useState(courseProgress);

    const toggleLesson = (key) => {
        const updated = { ...localProg, [key]: !localProg[key] };
        setLocalProg(updated);
        const all = getProgress();
        all[course.id] = updated;
        setProgress(all);
    };

    const completed = Object.values(localProg).filter(Boolean).length;
    const total = lessonKeys.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const circumference = 2 * Math.PI * 18;

    return (
        <div className="progress-course-card">
            <div className="progress-card-header">
                <div>
                    <div className="progress-course-subject">{course.subject}</div>
                    <h3 className="progress-course-title">{course.topic}</h3>
                    <div className="progress-grade-badge">Grade {course.standard}</div>
                </div>
                {/* Progress ring */}
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
                    <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border-strong)" strokeWidth="2.5" />
                    <circle
                        cx="22" cy="22" r="18" fill="none"
                        stroke="var(--accent)" strokeWidth="2.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - pct / 100)}
                        transform="rotate(-90 22 22)"
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                    <text x="22" y="26" textAnchor="middle" fontSize="9"
                        fill="var(--text-primary)" fontWeight="700"
                        fontFamily="'Plus Jakarta Sans', sans-serif">
                        {pct}%
                    </text>
                </svg>
            </div>

            {total > 0 ? (
                <div className="lesson-map-container">
                    <div className="lesson-map">
                        {lessonKeys.map((key, i) => {
                            const done = !!localProg[key];
                            const isLast = i === lessonKeys.length - 1;
                            // Break every 10 nodes into a new visual row segment
                            const needsBreak = i > 0 && i % 10 === 0;
                            return (
                                <React.Fragment key={i}>
                                    {needsBreak && <div className="map-break" />}
                                    <div className="map-station">
                                        <button
                                            className={`station-node ${done ? "complete" : ""}`}
                                            onClick={() => toggleLesson(key)}
                                            title={key.replace(/^Lesson \d+:\s*/i, "")}
                                        >
                                            {done ? <Check size={9} /> : i + 1}
                                        </button>
                                        {!isLast && i % 10 !== 9 && (
                                            <div className={`station-connector ${done ? "complete" : ""}`} />
                                        )}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className="progress-track" style={{ marginTop: "0.625rem" }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            ) : (
                <div className="progress-empty-state">
                    Open course to start tracking progress
                </div>
            )}

            <div className="progress-card-footer">
                <span>{completed}/{total} lessons complete</span>
                <button className="btn btn-ghost btn-sm" onClick={onOpenCourse}>
                    Study <ChevronRight size={12} />
                </button>
            </div>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    // ── Core state ──
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || "courses");
    const [courses, setCourses] = useState([]);
    const [currentTheme, setCurrentTheme] = useState(getTheme);

    // ── Generation state ──
    const [generationStatus, setGenerationStatus] = useState(() => localStorage.getItem("dash_genStatus") || "idle");
    const [generatedCourseId, setGeneratedCourseId] = useState(() => {
        const s = localStorage.getItem("dash_genId");
        return s && s !== "null" && s !== "undefined" ? parseInt(s, 10) : null;
    });
    const [newlyCreatedId, setNewlyCreatedId] = useState(() => {
        const s = localStorage.getItem("dash_newId");
        return s && s !== "null" && s !== "undefined" ? parseInt(s, 10) : null;
    });
    const [progress, setProgress_] = useState(() => parseInt(localStorage.getItem("dash_progress") || "0", 10));
    const progressInterval = useRef(null);
    const [form, setForm] = useState({ subject: "", topic: "", standard: "" });

    // ── Courses UI state ──
    const [sortBy, setSortBy]           = useState("date");   // date | name | subject
    const [groupBySub, setGroupBySub]   = useState(false);
    const [viewMode, setViewMode]       = useState("card");   // card | list
    const [cardOrder, setCardOrder_]    = useState(getCardOrder);

    // ── Drag state ──
    const [draggedId, setDraggedId]   = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    // ── Modals ──
    const [deleteModal, setDeleteModal]   = useState({ show: false, id: null });
    const [errorModal, setErrorModal]     = useState({ show: false, message: "" });
    const [catalogModal, setCatalogModal] = useState(false);
    const [catalogStep, setCatalogStep]   = useState("subject");
    const [selectedSubject, setSelectedSubject] = useState(null);

    // ── Init ──
    useEffect(() => { initTheme(); }, []);

    const handleThemeToggle = () => { const next = cycleTheme(); setCurrentTheme(next); };

    // ── Auth / fetch ──
    const handleLogout = useCallback(() => { localStorage.clear(); sessionStorage.clear(); navigate("/login"); }, [navigate]);

    const fetchCourses = useCallback(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        axios.get("http://localhost:5000/api/courses", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => { if (res.data.courses) setCourses(res.data.courses); })
            .catch(err => { if (err.response?.status === 401 || err.response?.status === 403) handleLogout(); });
    }, [navigate, handleLogout]);

    // ── Generation helpers ──
    const resetGenerator = useCallback(() => {
        setGenerationStatus("idle");
        setForm({ subject: "", topic: "", standard: "" });
        ["dash_genStatus","dash_genId","dash_progress","dash_startTime","dash_backendReady","dash_tempId"]
            .forEach(k => localStorage.removeItem(k));
        sessionStorage.removeItem("dash_session_active");
    }, []);

    const completeGeneration = useCallback(() => {
        clearInterval(progressInterval.current);
        setProgress_(100); localStorage.setItem("dash_progress", "100");
        const storedId = localStorage.getItem("dash_tempId");
        if (storedId) {
            const newId = parseInt(storedId, 10);
            setGeneratedCourseId(newId); setNewlyCreatedId(newId);
            localStorage.setItem("dash_genId", newId); localStorage.setItem("dash_newId", newId);
        }
        setGenerationStatus("completed"); localStorage.setItem("dash_genStatus", "completed");
        ["dash_startTime","dash_backendReady","dash_tempId"].forEach(k => localStorage.removeItem(k));
        fetchCourses();
    }, [fetchCourses]);

    const startProgressLoop = useCallback(() => {
        clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
            const startTime = parseInt(localStorage.getItem("dash_startTime") || "0", 10);
            if (!startTime) return;
            if (localStorage.getItem("dash_backendReady") === "true") { completeGeneration(); return; }
            const elapsed = Date.now() - startTime;
            let calc = Math.min(99, Math.floor((elapsed / GENERATION_DURATION_MS) * 100));
            if (elapsed >= GENERATION_DURATION_MS) {
                setProgress_(99); localStorage.setItem("dash_progress", "99");
                setGenerationStatus("finalizing"); localStorage.setItem("dash_genStatus", "finalizing");
            } else {
                setProgress_(calc); localStorage.setItem("dash_progress", calc.toString());
            }
        }, 1000);
    }, [completeGeneration]);

    // ── Init effect ──
    useEffect(() => {
        if (location.state?.activeTab) window.history.replaceState({}, document.title);
        const savedStatus = localStorage.getItem("dash_genStatus");
        if (savedStatus === "running" || savedStatus === "finalizing") {
            if (!sessionStorage.getItem("dash_session_active")) { setTimeout(() => resetGenerator(), 0); }
            else { setTimeout(() => { setGenerationStatus(savedStatus); startProgressLoop(); }, 0); }
        } else if (location.state?.resetForm && savedStatus !== "running" && savedStatus !== "finalizing") {
            setTimeout(() => resetGenerator(), 0);
        } else if (savedStatus === "completed") {
            setTimeout(() => { setGenerationStatus("completed"); setProgress_(100); }, 0);
        }
        fetchCourses();
        return () => clearInterval(progressInterval.current);
    }, [fetchCourses, location.state, startProgressLoop, resetGenerator]);

    useEffect(() => {
        const guard = (e) => { if (generationStatus === "running" || generationStatus === "finalizing") { e.preventDefault(); e.returnValue = ""; } };
        window.addEventListener("beforeunload", guard);
        return () => window.removeEventListener("beforeunload", guard);
    }, [generationStatus]);

    // ── Form ──
    const updateForm = (e) => {
        let { name, value } = e.target;
        if (name === "standard") { if (value > 12) value = "12"; if (value < 0) value = "1"; }
        setForm({ ...form, [name]: value });
    };

    // ── Generate ──
    const generateCourse = async (e) => {
        e.preventDefault();
        if (!form.topic || !form.subject || !form.standard) return alert("Please fill all fields");
        sessionStorage.setItem("dash_session_active", "true");
        localStorage.removeItem("dash_backendReady"); localStorage.removeItem("dash_tempId");
        localStorage.setItem("dash_startTime", Date.now().toString());
        setGenerationStatus("running"); setProgress_(0);
        localStorage.setItem("dash_progress", "0"); localStorage.setItem("dash_genStatus", "running");
        startProgressLoop();
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:5000/api/generate", form, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) {
                localStorage.setItem("dash_backendReady", "true");
                localStorage.setItem("dash_tempId", res.data.course_id || res.data.id || res.data.courseId);
            }
        } catch { clearInterval(progressInterval.current); setTimeout(() => resetGenerator(), 0); setErrorModal({ show: true, message: "Generation failed. Please try again." }); }
    };

    // ── Delete ──
    const confirmDelete = (e, id) => { e.stopPropagation(); setDeleteModal({ show: true, id }); };
    const executeDelete = async () => {
        const id = deleteModal.id; if (!id) return;
        try {
            const token = localStorage.getItem("token");
            setCourses(prev => prev.filter(c => c.id !== id));
            setDeleteModal({ show: false, id: null });
            if (id === newlyCreatedId) { setNewlyCreatedId(null); localStorage.removeItem("dash_newId"); }
            if (id === generatedCourseId) setTimeout(() => resetGenerator(), 0);
            await axios.delete(`http://localhost:5000/api/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        } catch { setDeleteModal({ show: false, id: null }); setErrorModal({ show: true, message: "Failed to delete course." }); fetchCourses(); }
    };

    const openCourse = (id) => {
        const targetId = id || localStorage.getItem("dash_genId");
        if (targetId && targetId !== "null") navigate(`/product/${targetId}`);
        else setErrorModal({ show: true, message: "Course ID missing." });
    };

    // ── Catalog ──
    const openCatalog   = () => { setCatalogStep("subject"); setCatalogModal(true); };
    const selectSubject = (s) => { setSelectedSubject(s); setCatalogStep("topic"); };
    const selectTopic   = (t) => { setForm(p => ({ ...p, subject: selectedSubject, topic: t })); setCatalogModal(false); };
    const catalogBack   = () => { setCatalogStep("subject"); setSelectedSubject(null); };

    // ── Sorting / ordering ──
    const orderedCourses = useMemo(() => {
        if (!cardOrder || cardOrder.length === 0) return courses;
        const map = Object.fromEntries(courses.map(c => [c.id, c]));
        const ordered = cardOrder.filter(id => map[id]).map(id => map[id]);
        const unordered = courses.filter(c => !cardOrder.includes(c.id));
        return [...ordered, ...unordered];
    }, [courses, cardOrder]);

    const sortedCourses = useMemo(() => {
        const arr = [...orderedCourses];
        if (sortBy === "name")    return arr.sort((a, b) => a.topic.localeCompare(b.topic));
        if (sortBy === "subject") return arr.sort((a, b) => a.subject.localeCompare(b.subject));
        return arr; // date = insertion/api order
    }, [orderedCourses, sortBy]);

    const groupedCourses = useMemo(() => {
        if (!groupBySub) return null;
        return sortedCourses.reduce((acc, c) => {
            if (!acc[c.subject]) acc[c.subject] = [];
            acc[c.subject].push(c);
            return acc;
        }, {});
    }, [sortedCourses, groupBySub]);

    // ── Drag & drop ──
    const handleDragStart = (e, id) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = "move";
    };
    const handleDragOver = (e, id) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (id !== draggedId) setDragOverId(id);
    };
    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }
        const currentOrder = sortedCourses.map(c => c.id);
        const fromIdx = currentOrder.indexOf(draggedId);
        const toIdx   = currentOrder.indexOf(targetId);
        if (fromIdx === -1 || toIdx === -1) { setDraggedId(null); setDragOverId(null); return; }
        const newOrder = [...currentOrder];
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, draggedId);
        setCardOrder_(newOrder);
        setCardOrder(newOrder);
        setDraggedId(null); setDragOverId(null);
    };
    const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };

    // ── Helpers for rendering ──
    const themeMeta = THEME_META[currentTheme] || THEME_META.dark;
    const isRunning = generationStatus === "running" || generationStatus === "finalizing";

    // Course card (shared between card + list views)
    const CourseCardGrid = ({ course }) => (
        <div
            key={course.id}
            className={`bento-card dashboard-course-card
                ${draggedId === course.id ? "is-dragging" : ""}
                ${dragOverId === course.id ? "drag-over" : ""}`}
            onClick={() => openCourse(course.id)}
            draggable
            onDragStart={e => handleDragStart(e, course.id)}
            onDragOver={e => handleDragOver(e, course.id)}
            onDrop={e => handleDrop(e, course.id)}
            onDragEnd={handleDragEnd}
        >
            {course.id === newlyCreatedId && <div className="dashboard-course-new-badge">NEW</div>}

            {/* Action buttons */}
            <div className="card-actions" onClick={e => e.stopPropagation()}>
                <div className="card-action-btn drag-handle" title="Drag to reorder">
                    <GripVertical size={12} />
                </div>
                <button className="card-action-btn danger" onClick={e => confirmDelete(e, course.id)} title="Delete course">
                    <Trash2 size={12} />
                </button>
            </div>

            <div className="card-top">
                <div className="dashboard-course-meta"><BookOpen size={10} />{course.subject}</div>
                <h4>{course.topic}</h4>
            </div>
            <span className="card-badge">Grade {course.standard}</span>
        </div>
    );

    const CourseRowList = ({ course }) => {
        const lessonKeys = getLessonsCache(course.id) || [];
        const courseProgress = (getProgress()[course.id]) || {};
        const done = Object.values(courseProgress).filter(Boolean).length;
        const pct = lessonKeys.length > 0 ? (done / lessonKeys.length) * 100 : 0;
        return (
            <div
                className={`list-course-row
                    ${draggedId === course.id ? "is-dragging" : ""}
                    ${dragOverId === course.id ? "drag-over" : ""}`}
                onClick={() => openCourse(course.id)}
                draggable
                onDragStart={e => handleDragStart(e, course.id)}
                onDragOver={e => handleDragOver(e, course.id)}
                onDrop={e => handleDrop(e, course.id)}
                onDragEnd={handleDragEnd}
            >
                <div className="list-drag-handle" onClick={e => e.stopPropagation()} title="Drag to reorder">
                    <GripVertical size={14} />
                </div>
                <span className="list-course-subject">{course.subject}</span>
                <span className="list-course-topic">{course.topic}</span>
                <div className="list-progress-bar-wrap" title={`${Math.round(pct)}% complete`}>
                    <div className="list-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="list-course-grade">Grade {course.standard}</span>
                <div className="list-course-actions" onClick={e => e.stopPropagation()}>
                    <button className="card-action-btn danger" onClick={e => confirmDelete(e, course.id)} title="Delete">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        );
    };

    // Render courses section
    const renderCourses = () => {
        if (groupedCourses) {
            return (
                <>
                    {Object.entries(groupedCourses).map(([subject, items]) => (
                        <div key={subject} className="subject-group">
                            <div className="subject-group-header">
                                <span className="subject-group-title">{subject}</span>
                                <span className="subject-group-count">{items.length}</span>
                            </div>
                            {viewMode === "card" ? (
                                <div className="bento-grid">
                                    {items.map(c => <CourseCardGrid key={c.id} course={c} />)}
                                </div>
                            ) : (
                                <div className="courses-list">
                                    {items.map(c => <CourseRowList key={c.id} course={c} />)}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            );
        }

        if (viewMode === "card") {
            return (
                <div className="bento-grid">
                    {/* Create card */}
                    <div className="bento-card create-card" onClick={() => setActiveTab("generate")}>
                        <div className="dashboard-create-card-icon"><PlusCircle size={18} /></div>
                        <span className="dashboard-create-card-label">New Course</span>
                    </div>
                    {sortedCourses.map(c => <CourseCardGrid key={c.id} course={c} />)}
                </div>
            );
        }

        return (
            <div className="courses-list">
                {sortedCourses.map(c => <CourseRowList key={c.id} course={c} />)}
            </div>
        );
    };

    // ═══════════════════════════════════════════════════════════
    return (
        <div className="app-container">

            {/* ── CATALOG MODAL ── */}
            {catalogModal && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal dashboard-catalog-modal">
                        <button onClick={() => setCatalogModal(false)} className="dashboard-modal-close"><X size={17} /></button>
                        {catalogStep === "subject" ? (
                            <>
                                <h3 className="dashboard-modal-title" style={{ textAlign:"left", marginBottom:"2px" }}>Browse Catalog</h3>
                                <p style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginBottom:0 }}>Pick a subject</p>
                                <div className="catalog-grid">
                                    {Object.keys(CATALOG_DATA).map(s => (
                                        <button key={s} className="catalog-item-btn" onClick={() => selectSubject(s)}>{s}</button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"2px" }}>
                                    <button onClick={catalogBack} className="btn-icon-text"><ArrowLeft size={14} /></button>
                                    <h3 className="dashboard-modal-title" style={{ margin:0, textAlign:"left" }}>{selectedSubject}</h3>
                                </div>
                                <p style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginBottom:0 }}>Pick a topic</p>
                                <div className="catalog-grid">
                                    {CATALOG_DATA[selectedSubject]?.map(t => (
                                        <button key={t} className="catalog-item-btn" onClick={() => selectTopic(t)}>{t}</button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── ERROR MODAL ── */}
            {errorModal.show && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal">
                        <button onClick={() => setErrorModal({ show:false })} className="dashboard-modal-close"><X size={17} /></button>
                        <div className="dashboard-modal-icon dashboard-modal-icon-error"><ServerCrash size={26} /></div>
                        <h3 className="dashboard-modal-title">Something went wrong</h3>
                        <p className="dashboard-modal-text">{errorModal.message}</p>
                        <button onClick={() => setErrorModal({ show:false })} className="btn dashboard-modal-primary-btn">Dismiss</button>
                    </div>
                </div>
            )}

            {/* ── DELETE MODAL ── */}
            {deleteModal.show && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal">
                        <div className="dashboard-modal-icon dashboard-modal-icon-warning"><AlertTriangle size={26} /></div>
                        <h3 className="dashboard-modal-title">Delete this course?</h3>
                        <p className="dashboard-modal-text">All lessons and tests will be permanently removed. This cannot be undone.</p>
                        <div className="dashboard-modal-actions">
                            <button onClick={() => setDeleteModal({ show:false })} className="btn dashboard-modal-btn dashboard-modal-btn-cancel">Cancel</button>
                            <button onClick={executeDelete} className="btn dashboard-modal-btn dashboard-modal-btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ SIDEBAR ══════════════ */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">S</div>
                    <span className="sidebar-brand-name">SensAI</span>
                </div>

                <div className="user-profile">
                    <img src="https://ui-avatars.com/api/?name=S&background=2C2926&color=D4A853&size=64&bold=true" alt="Avatar" className="avatar" />
                    <div className="user-info">
                        <h3>Student</h3>
                        <p>Pro Plan</p>
                    </div>
                </div>

                <nav className="nav-menu">
                    <button className={`nav-item ${activeTab === "courses" ? "active" : ""}`} onClick={() => setActiveTab("courses")}>
                        <LayoutGrid size={15} /> My Courses
                    </button>

                    <div className="dashboard-sidebar-divider" />

                    <button className={`nav-item ${activeTab === "generate" ? "active" : ""}`} onClick={() => setActiveTab("generate")}>
                        {isRunning ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />}
                        Generate Course
                    </button>

                    <button className={`nav-item ${activeTab === "progress" ? "active" : ""}`} onClick={() => setActiveTab("progress")}>
                        <TrendingUp size={15} /> Progress
                    </button>

                    <button className={`nav-item ${activeTab === "usage" ? "active" : ""}`} onClick={() => setActiveTab("usage")}>
                        <Activity size={15} /> Upcoming
                    </button>

                    <div className="dashboard-nav-spacer" />
                </nav>

                <div className="sidebar-bottom">
                    <button className="theme-toggle-btn" onClick={handleThemeToggle} title={`Theme: ${themeMeta.label}`}>
                        <Palette size={14} style={{ opacity:0.7 }} />
                        <span>{themeMeta.label} theme</span>
                    </button>
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <LogOut size={15} /> Logout
                    </button>
                </div>
            </aside>

            {/* ══════════════ MAIN ══════════════ */}
            <main className="main-content-area">
                <GlobalProgressToast />

                {/* ── COURSES ── */}
                {activeTab === "courses" && (
                    <div className="fade-in">
                        <div className="dashboard-header">
                            <h1 className="dashboard-page-title">My Courses</h1>
                            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab("generate")}>
                                <PlusCircle size={13} /> New Course
                            </button>
                        </div>

                        {/* Sort / view toolbar */}
                        <div className="courses-toolbar">
                            <div className="toolbar-left">
                                <span className="toolbar-label">Sort</span>
                                {[["date","Date"],["name","Name"],["subject","Subject"]].map(([key, label]) => (
                                    <button key={key} className={`sort-pill ${sortBy === key ? "active" : ""}`} onClick={() => setSortBy(key)}>
                                        {label}
                                    </button>
                                ))}
                                <div className="toolbar-sep" />
                                <button className={`group-btn ${groupBySub ? "active" : ""}`} onClick={() => setGroupBySub(p => !p)}>
                                    {groupBySub ? "✓ " : ""}Group by Subject
                                </button>
                            </div>
                            <div className="toolbar-right">
                                <button className={`view-btn ${viewMode === "card" ? "active" : ""}`} title="Card view" onClick={() => setViewMode("card")}>
                                    <LayoutGrid size={13} />
                                </button>
                                <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} title="List view" onClick={() => setViewMode("list")}>
                                    <List size={13} />
                                </button>
                            </div>
                        </div>

                        {renderCourses()}
                    </div>
                )}

                {/* ── GENERATE ── */}
                {activeTab === "generate" && (
                    <div className="fade-in dashboard-generate-root">
                        {generationStatus === "idle" && (
                            <div className="dashboard-generate-form-shell">
                                <div className="dashboard-header dashboard-generate-header">
                                    <div className="dashboard-generate-icon"><Sparkles size={20} /></div>
                                    <h1 className="dashboard-generate-title">Build a New Course</h1>
                                    <p className="dashboard-generate-subtitle">Define a topic and let the AI agents do the rest.</p>
                                </div>
                                <div className="glass-card dashboard-generate-card">
                                    <form onSubmit={generateCourse}>
                                        <button type="button" onClick={openCatalog} className="catalog-trigger-btn">
                                            <BookOpen size={15} /> Browse Subject &amp; Topic Catalog
                                        </button>
                                        <div className="form-group">
                                            <label className="form-label">Subject</label>
                                            <input name="subject" className="form-input" placeholder="e.g. Computer Science" onChange={updateForm} value={form.subject} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Topic</label>
                                            <input name="topic" className="form-input" placeholder="e.g. Neural Networks" onChange={updateForm} value={form.topic} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Grade / Standard</label>
                                            <input name="standard" type="number" className="form-input" placeholder="1 – 12" onChange={updateForm} value={form.standard} min="1" max="12" required />
                                        </div>
                                        <button type="submit" className="btn btn-primary dashboard-generate-submit">
                                            <Sparkles size={15} /> Initialize Agents
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* RUNNING — dark shell isolates animation from theme */}
                        {isRunning && (
                            <div className="dashboard-running-view">
                                <div className="running-view-dark-shell">
                                    <div className="dashboard-running-visual">
                                        <CpuArchitecture height="240px" centralLogoUrl="/gojo.png" />
                                    </div>
                                    <h2 className="dashboard-running-title">
                                        {generationStatus === "finalizing" ? "Almost There…" : "Building Your Curriculum"}
                                    </h2>
                                    <p className="dashboard-running-text">
                                        {generationStatus === "finalizing"
                                            ? "Agents are finalising your course content…"
                                            : `Researching ${form.topic || "your topic"} across the web…`}
                                    </p>
                                    <div className="dashboard-progress-wrapper">
                                        <div className="dashboard-progress-track">
                                            <div className="dashboard-progress-fill"
                                                style={{ width: generationStatus === "finalizing" ? "100%" : `${progress}%` }} />
                                        </div>
                                        <span className="dashboard-progress-label">
                                            {generationStatus === "finalizing" ? "…" : `${Math.round(progress)}%`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {generationStatus === "completed" && (
                            <div className="dashboard-completed-view">
                                <div className="dashboard-completed-icon"><CheckCircle size={42} /></div>
                                <h2 className="dashboard-completed-title">Course Ready!</h2>
                                <p className="dashboard-completed-text">Your personalised course has been generated and saved.</p>
                                <div className="dashboard-completed-actions">
                                    <button className="btn btn-primary" style={{ padding:"0 1.75rem", fontWeight:600 }} onClick={() => openCourse(generatedCourseId)}>
                                        Start Learning
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setTimeout(() => resetGenerator(), 0)}>
                                        Create Another
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── PROGRESS ── */}
                {activeTab === "progress" && (
                    <div className="fade-in">
                        <div className="dashboard-header">
                            <h1 className="dashboard-page-title">Learning Progress</h1>
                        </div>

                        {courses.length === 0 ? (
                            <div className="progress-empty-page">
                                <div className="progress-empty-icon">◎</div>
                                <p style={{ marginBottom:"1rem" }}>No courses yet. Generate one to start tracking your progress.</p>
                                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab("generate")}>
                                    <PlusCircle size={13} /> Create first course
                                </button>
                            </div>
                        ) : (
                            <>
                                <p style={{ fontSize:"0.82rem", color:"var(--text-muted)", marginBottom:"1.25rem" }}>
                                    Click any lesson node to mark it complete. Open a course first to load its lessons.
                                </p>
                                <div className="progress-grid">
                                    {courses.map(course => (
                                        <ProgressCourseCard
                                            key={course.id}
                                            course={course}
                                            onOpenCourse={() => openCourse(course.id)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── UPCOMING ── */}
                {activeTab === "usage" && (
                    <div className="fade-in">
                        <div className="dashboard-header">
                            <h1 className="dashboard-page-title">Upcoming Features</h1>
                        </div>
                        <div className="dashboard-usage-list">
                            {MOCK_USAGE_LOGS.map(log => (
                                <div key={log.id} className="dashboard-usage-row">
                                    <div className="dashboard-usage-icon"><Cpu size={15} /></div>
                                    <div>
                                        <h4 className="dashboard-usage-agent">{log.agent}</h4>
                                        <span className="dashboard-usage-id">ID: 00{log.id}</span>
                                    </div>
                                    <div className="dashboard-usage-action">{log.action}</div>
                                    <div className="dashboard-usage-time"><Clock size={12} /> {log.time}</div>
                                    <div className={`dashboard-usage-tokens ${log.status === "free" ? "dashboard-usage-tokens--success" : "dashboard-usage-tokens--warning"}`}>
                                        {log.tokens}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}