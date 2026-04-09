import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutGrid, LogOut, PlusCircle, BookOpen, Activity, Cpu, Clock, Sparkles,
    Loader2, CheckCircle, Trash2, AlertTriangle, X, ServerCrash, ArrowLeft,
    Palette, TrendingUp, GripVertical, List, Check, ChevronRight,
    BookMarked, User, Camera
} from "lucide-react";
import CpuArchitecture from "../components/CpuArchitecture";
import GlobalProgressToast from "../components/GlobalProgressToast";
import Notebook from "../components/Notebook";
import { initTheme, cycleTheme, getTheme, THEME_META } from "../utils/theme";
import "../styles/dashboard.css";

/* ─── Constants ─────────────────────────────────────────── */
const CATALOG_DATA = {
    "Mathematics": ["Calculus", "Matrix", "Multiplication", "Trigonometry", "Mensuration", "Algebra", "Geometry", "Statistics"],
    "Physics": ["Kinematics", "Thermodynamics", "Electromagnetism", "Optics", "Quantum Mechanics", "Nuclear Physics", "Astrophysics"],
    "Chemistry": ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Nuclear Chemistry", "Analytical Chemistry", "Environmental Chemistry"],
    "Biology": ["Genetics", "Cell Biology", "Ecology", "Evolution", "Molecular Biology", "Immunity", "Neuroscience"],
    "Computer Science": ["Data Structures", "Algorithms", "Web Development", "Artificial Intelligence", "Database Management", "Cybersecurity", "Operating Systems", "Machine Learning", "Cloud Computing"]
};
const MOCK_USAGE_LOGS = [
    { id: 1, agent: "RAG+", action: "Better Accuracy", tokens: "Beta", time: "Active", status: "free" },
    { id: 2, agent: "Usage", action: "Token and Log Count", tokens: "in progress", time: "coming soon", status: "warn" },
    { id: 3, agent: "PDF", action: "Download PDF", tokens: "ongoing", time: "coming soon", status: "warn" },
];
const GENERATION_DURATION_MS = 3 * 60 * 1000;

/* ─── Storage helpers ───────────────────────────────────── */
const getProgress = () => { try { return JSON.parse(localStorage.getItem("sensai_progress") || "{}"); } catch { return {}; } };
const setProgressLS = (p) => localStorage.setItem("sensai_progress", JSON.stringify(p));
const getLessonsCache = (id) => { try { return JSON.parse(localStorage.getItem(`sensai_lessons_${id}`) || "null"); } catch { return null; } };
const getCardOrder = () => { try { return JSON.parse(localStorage.getItem("sensai_card_order") || "null"); } catch { return null; } };
const setCardOrder = (o) => localStorage.setItem("sensai_card_order", JSON.stringify(o));
const getProfile = () => { try { return JSON.parse(localStorage.getItem("sensai_profile") || "null"); } catch { return null; } };
const saveProfile = (p) => localStorage.setItem("sensai_profile", JSON.stringify(p));

/* ─── Progress Course Card ───────────────────────────────── */
function ProgressCourseCard({ course, onOpenCourse }) {
    const lessonKeys = getLessonsCache(course.id) || [];
    const [localProg, setLocalProg] = useState(() => (getProgress()[course.id] || {}));

    const toggleLesson = (key) => {
        const updated = { ...localProg, [key]: !localProg[key] };
        setLocalProg(updated);
        const all = getProgress(); all[course.id] = updated; setProgressLS(all);
    };

    const completed = Object.values(localProg).filter(Boolean).length;
    const total = lessonKeys.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const circ = 2 * Math.PI * 18;

    return (
        <div className="progress-course-card">
            <div className="progress-card-header">
                <div>
                    <div className="progress-course-subject">{course.subject}</div>
                    <h3 className="progress-course-title">{course.topic}</h3>
                    <div className="progress-grade-badge">Grade {course.standard}</div>
                </div>
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
                    <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border-strong)" strokeWidth="2.5" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke="var(--accent)" strokeWidth="2.5"
                        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
                        transform="rotate(-90 22 22)" strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                    <text x="22" y="26" textAnchor="middle" fontSize="9" fill="var(--text-primary)"
                        fontWeight="700" fontFamily="'Plus Jakarta Sans',sans-serif">{pct}%</text>
                </svg>
            </div>

            {total > 0 ? (
                <div className="lesson-map-container">
                    <div className="lesson-map">
                        {lessonKeys.map((key, i) => {
                            const done = !!localProg[key];
                            const isLast = i === lessonKeys.length - 1;
                            const needsBreak = i > 0 && i % 10 === 0;
                            return (
                                <React.Fragment key={i}>
                                    {needsBreak && <div className="map-break" />}
                                    <div className="map-station">
                                        <button className={`station-node ${done ? "complete" : ""}`}
                                            onClick={() => toggleLesson(key)} title={key.replace(/^Lesson \d+:\s*/i, "")}>
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
                <div className="progress-empty-state">Open course once to load lessons</div>
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

/* ─── Profile Modal ──────────────────────────────────────── */
function ProfileModal({ onClose }) {
    const saved = getProfile();
    const [name, setName] = useState(saved?.name || "Student");
    const [bio, setBio] = useState(saved?.bio || "");
    const [interests, setInterests] = useState(saved?.interests || "");
    const [avatar, setAvatar] = useState(saved?.avatar || null);
    const fileRef = useRef();

    const handleFile = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAvatar(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        saveProfile({ name, bio, interests, avatar });
        onClose();
    };

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2C2926&color=D4A853&size=128&bold=true`;

    return (
        <div className="dashboard-modal-overlay">
            <div className="dashboard-modal profile-modal" style={{ maxWidth: 440 }}>
                <button onClick={onClose} className="dashboard-modal-close"><X size={17} /></button>
                <h3 className="dashboard-modal-title" style={{ textAlign: "left", marginBottom: "1.25rem" }}>Edit Profile</h3>

                {/* Avatar */}
                <div className="profile-avatar-section">
                    <div className="profile-avatar-wrap" onClick={() => fileRef.current?.click()}>
                        <img src={avatar || defaultAvatar} alt="Avatar" />
                        <div className="profile-avatar-overlay">
                            <span><Camera size={14} style={{ display: "block", margin: "0 auto 2px" }} />Change</span>
                        </div>
                    </div>
                    <div className="profile-avatar-btns">
                        <button className="profile-avatar-btn" onClick={() => fileRef.current?.click()}>Upload photo</button>
                        {avatar && <button className="profile-avatar-btn danger" onClick={() => setAvatar(null)}>Remove</button>}
                        <button className="profile-avatar-btn" onClick={() => setAvatar(null)}>Use default</button>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                </div>

                <div className="profile-field">
                    <label>Display Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="profile-field">
                    <label>Interests</label>
                    <input value={interests} onChange={e => setInterests(e.target.value)} placeholder="e.g. Physics, AI, History…" />
                </div>
                <div className="profile-field">
                    <label>Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="A little about yourself…" />
                </div>

                <button className="profile-save-btn" onClick={handleSave}>Save Profile</button>
            </div>
        </div>
    );
}

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || "courses");
    const [courses, setCourses] = useState([]);
    const [currentTheme, setCurrentTheme] = useState(getTheme);
    const [profileData, setProfileData] = useState(getProfile);

    /* generation */
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

    /* ui */
    const [sortBy, setSortBy] = useState("date");
    const [groupBySub, setGroupBySub] = useState(false);
    const [viewMode, setViewMode] = useState("card");
    const [cardOrder_, setCardOrder_] = useState(getCardOrder);

    /* drag */
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    /* modals */
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [errorModal, setErrorModal] = useState({ show: false, message: "" });
    const [catalogModal, setCatalogModal] = useState(false);
    const [catalogStep, setCatalogStep] = useState("subject");
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [profileModal, setProfileModal] = useState(false);

    /* init */
    useEffect(() => { initTheme(); }, []);

    const handleThemeToggle = () => { const next = cycleTheme(); setCurrentTheme(next); };

    const handleLogout = useCallback(() => {
        // 1. Remove ONLY the authentication token
        localStorage.removeItem("token");

        // 2. Clear temporary generation data so it doesn't leak to the next login
        localStorage.removeItem("dash_genStatus");
        localStorage.removeItem("dash_genId");
        localStorage.removeItem("dash_newId");
        localStorage.removeItem("dash_progress");
        localStorage.removeItem("dash_startTime");
        localStorage.removeItem("dash_backendReady");
        localStorage.removeItem("dash_tempId");

        // 3. Clear ONLY the dashboard session (Do not use .clear()!)
        sessionStorage.removeItem("dash_session_active");

        // 4. Redirect
        navigate("/login");
    }, [navigate]);

    const fetchCourses = useCallback(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        axios.get("http://localhost:5000/api/courses", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => { if (res.data.courses) setCourses(res.data.courses); })
            .catch(err => { if (err.response?.status === 401 || err.response?.status === 403) handleLogout(); });
    }, [navigate, handleLogout]);

    const resetGenerator = useCallback(() => {
        setGenerationStatus("idle"); setForm({ subject: "", topic: "", standard: "" });
        ["dash_genStatus", "dash_genId", "dash_progress", "dash_startTime", "dash_backendReady", "dash_tempId"]
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
        ["dash_startTime", "dash_backendReady", "dash_tempId"].forEach(k => localStorage.removeItem(k));
        fetchCourses();
    }, [fetchCourses]);

    const startProgressLoop = useCallback(() => {
        clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
            const startTime = parseInt(localStorage.getItem("dash_startTime") || "0", 10);
            if (!startTime) return;

            // 1. Check if backend is actually ready
            if (localStorage.getItem("dash_backendReady") === "true") {
                // Move state to finalizing for the comment change
                setGenerationStatus("finalizing");

                // Artificial 2-second delay for the final jump to 100%
                setTimeout(() => {
                    completeGeneration();
                }, 2000);
                return;
            }

            const elapsed = Date.now() - startTime;

            /* 2. ASYMPTOTIC FORMULA 
               This starts fast but hits a "soft ceiling" at 90%.
               It will crawl from 88% to 89% very slowly, preventing the "99% freeze".
            */
            const targetMax = 90;
            const decayConstant = 60000; // Adjust speed (higher = slower)
            let calc = targetMax * (1 - Math.exp(-elapsed / decayConstant));

            const finalVal = Math.floor(calc);
            setProgress_(finalVal);
            localStorage.setItem("dash_progress", finalVal.toString());

            // Trigger 'finalizing' text early if it takes too long
            if (finalVal > 85) {
                setGenerationStatus("finalizing");
                localStorage.setItem("dash_genStatus", "finalizing");
            }
        }, 1000);
    }, [completeGeneration]);

    useEffect(() => {
        if (location.state?.activeTab) window.history.replaceState({}, document.title);
        const s = localStorage.getItem("dash_genStatus");
        if (s === "running" || s === "finalizing") {
            if (!sessionStorage.getItem("dash_session_active")) { setTimeout(() => resetGenerator(), 0); }
            else { setTimeout(() => { setGenerationStatus(s); startProgressLoop(); }, 0); }
        } else if (location.state?.resetForm && s !== "running" && s !== "finalizing") {
            setTimeout(() => resetGenerator(), 0);
        } else if (s === "completed") {
            setTimeout(() => { setGenerationStatus("completed"); setProgress_(100); }, 0);
        }
        fetchCourses();
        return () => clearInterval(progressInterval.current);
    }, [fetchCourses, location.state, startProgressLoop, resetGenerator]);

    useEffect(() => {
        const guard = e => { if (generationStatus === "running" || generationStatus === "finalizing") { e.preventDefault(); e.returnValue = ""; } };
        window.addEventListener("beforeunload", guard);
        return () => window.removeEventListener("beforeunload", guard);
    }, [generationStatus]);

    const updateForm = e => {
        let { name, value } = e.target;
        if (name === "standard") { if (value > 12) value = "12"; if (value < 0) value = "1"; }
        setForm({ ...form, [name]: value });
    };

    const generateCourse = async e => {
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

    const confirmDelete = (e, id) => { e.stopPropagation(); setDeleteModal({ show: true, id }); };
    const executeDelete = async () => {
        const id = deleteModal.id; if (!id) return;
        try {
            const token = localStorage.getItem("token");
            setCourses(prev => prev.filter(c => c.id !== id)); setDeleteModal({ show: false, id: null });
            if (id === newlyCreatedId) { setNewlyCreatedId(null); localStorage.removeItem("dash_newId"); }
            if (id === generatedCourseId) setTimeout(() => resetGenerator(), 0);
            await axios.delete(`http://localhost:5000/api/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        } catch { setDeleteModal({ show: false, id: null }); setErrorModal({ show: true, message: "Failed to delete course." }); fetchCourses(); }
    };

    const openCourse = id => {
        // 1. If they click the newly created course, clear the sticker data!
        if (id === newlyCreatedId) {
            setNewlyCreatedId(null);
            localStorage.removeItem("dash_newId");
        }

        // 2. Proceed with navigation
        const tid = id || localStorage.getItem("dash_genId");
        if (tid && tid !== "null") navigate(`/product/${tid}`);
        else setErrorModal({ show: true, message: "Course ID missing." });
    };

    const openCatalog = () => { setCatalogStep("subject"); setCatalogModal(true); };
    const selectSubject = s => { setSelectedSubject(s); setCatalogStep("topic"); };
    const selectTopic = t => { setForm(p => ({ ...p, subject: selectedSubject, topic: t })); setCatalogModal(false); };
    const catalogBack = () => { setCatalogStep("subject"); setSelectedSubject(null); };

    /* Sorting */
    const orderedCourses = useMemo(() => {
        if (!cardOrder_ || cardOrder_.length === 0) return courses;
        const map = Object.fromEntries(courses.map(c => [c.id, c]));
        return [...cardOrder_.filter(id => map[id]).map(id => map[id]), ...courses.filter(c => !cardOrder_.includes(c.id))];
    }, [courses, cardOrder_]);

    const sortedCourses = useMemo(() => {
        const arr = [...orderedCourses];
        if (sortBy === "name") return arr.sort((a, b) => a.topic.localeCompare(b.topic));
        if (sortBy === "subject") return arr.sort((a, b) => a.subject.localeCompare(b.subject));
        return arr;
    }, [orderedCourses, sortBy]);

    const groupedCourses = useMemo(() => {
        if (!groupBySub) return null;
        return sortedCourses.reduce((acc, c) => { if (!acc[c.subject]) acc[c.subject] = []; acc[c.subject].push(c); return acc; }, {});
    }, [sortedCourses, groupBySub]);

    /* Drag */
    const handleDragStart = (e, id) => { setDraggedId(id); e.dataTransfer.effectAllowed = "move"; };
    const handleDragOver = (e, id) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (id !== draggedId) setDragOverId(id); };
    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }
        const cur = sortedCourses.map(c => c.id);
        const fi = cur.indexOf(draggedId), ti = cur.indexOf(targetId);
        if (fi === -1 || ti === -1) { setDraggedId(null); setDragOverId(null); return; }
        const no = [...cur]; no.splice(fi, 1); no.splice(ti, 0, draggedId);
        setCardOrder_(no); setCardOrder(no); setDraggedId(null); setDragOverId(null);
    };
    const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };

    /* Derived */
    const isRunning = generationStatus === "running" || generationStatus === "finalizing";
    const themeMeta = THEME_META[currentTheme] || THEME_META.dark;
    const profile = profileData || getProfile();
    const displayName = profile?.name || "Student";
    const avatarSrc = profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2C2926&color=D4A853&size=64&bold=true`;

    const CourseCardGrid = ({ course }) => (
        <div
            className={`bento-card${draggedId === course.id ? " is-dragging" : ""}${dragOverId === course.id ? " drag-over" : ""}`}
            onClick={() => openCourse(course.id)}
            draggable onDragStart={e => handleDragStart(e, course.id)} onDragOver={e => handleDragOver(e, course.id)}
            onDrop={e => handleDrop(e, course.id)} onDragEnd={handleDragEnd}
        >
            <div className="card-actions" onClick={e => e.stopPropagation()}>
                <div className="card-action-btn drag-handle" title="Drag to reorder"><GripVertical size={12} /></div>
                <button className="card-action-btn danger" onClick={e => confirmDelete(e, course.id)} title="Delete"><Trash2 size={12} /></button>
            </div>
            <div className="card-top">
                <div className="dashboard-course-meta"><BookOpen size={10} />{course.subject}</div>
                <h4>{course.topic}</h4>
            </div>
            <span className="card-badge">Grade {course.standard}</span>
            {course.id === newlyCreatedId && <div className="dashboard-course-new-badge">NEW</div>}
        </div>
    );

    const CourseRowList = ({ course }) => {
        const lessonKeys = getLessonsCache(course.id) || [];
        const done = Object.values(getProgress()[course.id] || {}).filter(Boolean).length;
        const pct = lessonKeys.length > 0 ? (done / lessonKeys.length) * 100 : 0;
        return (
            <div className={`list-course-row${draggedId === course.id ? " is-dragging" : ""}${dragOverId === course.id ? " drag-over" : ""}`}
                onClick={() => openCourse(course.id)} draggable
                onDragStart={e => handleDragStart(e, course.id)} onDragOver={e => handleDragOver(e, course.id)}
                onDrop={e => handleDrop(e, course.id)} onDragEnd={handleDragEnd}>
                <div className="list-drag-handle" onClick={e => e.stopPropagation()}><GripVertical size={14} /></div>
                <span className="list-course-subject">{course.subject}</span>
                <span className="list-course-topic">{course.topic}</span>
                <div className="list-progress-bar-wrap"><div className="list-progress-fill" style={{ width: `${pct}%` }} /></div>
                <span className="list-course-grade">Grade {course.standard}</span>
                <div className="list-course-actions" onClick={e => e.stopPropagation()}>
                    <button className="card-action-btn danger" onClick={e => confirmDelete(e, course.id)}><Trash2 size={12} /></button>
                </div>
            </div>
        );
    };

    const renderCourses = () => {
        if (groupedCourses) return (
            <>
                {Object.entries(groupedCourses).map(([subj, items]) => (
                    <div key={subj} className="subject-group">
                        <div className="subject-group-header">
                            <span className="subject-group-title">{subj}</span>
                            <span className="subject-group-count">{items.length}</span>
                        </div>
                        {viewMode === "card"
                            ? <div className="bento-grid">{items.map(c => <CourseCardGrid key={c.id} course={c} />)}</div>
                            : <div className="courses-list">{items.map(c => <CourseRowList key={c.id} course={c} />)}</div>}
                    </div>
                ))}
            </>
        );
        if (viewMode === "card") return (
            <div className="bento-grid">
                <div className="bento-card create-card" onClick={() => setActiveTab("generate")}>
                    <div className="dashboard-create-card-icon"><PlusCircle size={18} /></div>
                    <span className="dashboard-create-card-label">Check out our Agents</span>
                </div>
                {sortedCourses.map(c => <CourseCardGrid key={c.id} course={c} />)}
            </div>
        );
        return <div className="courses-list">{sortedCourses.map(c => <CourseRowList key={c.id} course={c} />)}</div>;
    };

    return (
        <div className="app-container">
            {/* ── Modals ── */}
            {catalogModal && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal dashboard-catalog-modal">
                        <button onClick={() => setCatalogModal(false)} className="dashboard-modal-close"><X size={17} /></button>
                        {catalogStep === "subject" ? (
                            <><h3 className="dashboard-modal-title" style={{ textAlign: "left", marginBottom: "2px" }}>Browse Catalog</h3>
                                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 0 }}>Pick a subject</p>
                                <div className="catalog-grid">{Object.keys(CATALOG_DATA).map(s => (
                                    <button key={s} className="catalog-item-btn" onClick={() => selectSubject(s)}>{s}</button>
                                ))}</div></>
                        ) : (
                            <><div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                                <button onClick={catalogBack} className="btn-icon-text"><ArrowLeft size={14} /></button>
                                <h3 className="dashboard-modal-title" style={{ margin: 0, textAlign: "left" }}>{selectedSubject}</h3>
                            </div>
                                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 0 }}>Pick a topic</p>
                                <div className="catalog-grid">{CATALOG_DATA[selectedSubject]?.map(t => (
                                    <button key={t} className="catalog-item-btn" onClick={() => selectTopic(t)}>{t}</button>
                                ))}</div></>
                        )}
                    </div>
                </div>
            )}
            {errorModal.show && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal">
                        <button onClick={() => setErrorModal({ show: false })} className="dashboard-modal-close"><X size={17} /></button>
                        <div className="dashboard-modal-icon dashboard-modal-icon-error"><ServerCrash size={26} /></div>
                        <h3 className="dashboard-modal-title">Something went wrong</h3>
                        <p className="dashboard-modal-text">{errorModal.message}</p>
                        <button onClick={() => setErrorModal({ show: false })} className="btn dashboard-modal-primary-btn">Dismiss</button>
                    </div>
                </div>
            )}
            {deleteModal.show && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal">
                        <div className="dashboard-modal-icon dashboard-modal-icon-warning"><AlertTriangle size={26} /></div>
                        <h3 className="dashboard-modal-title">Delete this course?</h3>
                        <p className="dashboard-modal-text">All lessons and tests will be permanently removed.</p>
                        <div className="dashboard-modal-actions">
                            <button onClick={() => setDeleteModal({ show: false })} className="btn dashboard-modal-btn dashboard-modal-btn-cancel">Cancel</button>
                            <button onClick={executeDelete} className="btn dashboard-modal-btn dashboard-modal-btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            {profileModal && (
                <ProfileModal onClose={() => {
                    setProfileData(getProfile());
                    setProfileModal(false);
                }} />
            )}

            {/* ── SIDEBAR ── */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">S</div>
                    <span className="sidebar-brand-name">SensAI</span>
                </div>

                {/* Profile — clickable */}
                <div className="user-profile" onClick={() => setProfileModal(true)} title="Edit profile">
                    <img src={avatarSrc} alt="Avatar" className="avatar" />
                    <div className="user-info">
                        <h3>{displayName}</h3>
                        <p>Pro Plan</p>
                    </div>
                </div>

                <nav className="nav-menu">
                    <button className={`nav-item ${activeTab === "courses" ? "active" : ""}`} onClick={() => setActiveTab("courses")}>
                        <LayoutGrid size={15} /> My Courses
                    </button>
                    <div className="dashboard-sidebar-divider" />
                    <button className={`nav-item ${activeTab === "generate" ? "active" : ""}`} onClick={() => setActiveTab("generate")}>
                        {isRunning ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />} Generate Course
                    </button>
                    <button className={`nav-item ${activeTab === "progress" ? "active" : ""}`} onClick={() => setActiveTab("progress")}>
                        <TrendingUp size={15} /> Progress
                    </button>
                    <button className={`nav-item ${activeTab === "notebook" ? "active" : ""}`} onClick={() => setActiveTab("notebook")}>
                        <BookMarked size={15} /> Notebook
                    </button>
                    <button className={`nav-item ${activeTab === "usage" ? "active" : ""}`} onClick={() => setActiveTab("usage")}>
                        <Activity size={15} /> Upcoming
                    </button>
                    <div className="dashboard-nav-spacer" />
                </nav>

                <div className="sidebar-bottom">
                    <button className="theme-toggle-btn" onClick={handleThemeToggle} title={`Theme: ${themeMeta.label}`}>
                        <Palette size={14} style={{ opacity: 0.7 }} /> {themeMeta.label} theme
                    </button>
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <LogOut size={15} /> Logout
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <main className="main-content-area">
                <GlobalProgressToast />

                {/* COURSES */}
                {activeTab === "courses" && (
                    <div className="fade-in">
                        <div className="dashboard-header">
                            <h1 className="dashboard-page-title">My Courses</h1>

                            {/* REPURPOSED BUTTON */}
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    setCardOrder_(null);
                                    localStorage.removeItem("sensai_card_order");
                                }}
                            >
                                <LayoutGrid size={13} /> Reset Layout
                            </button>
                        </div>
                        <div className="courses-toolbar">
                            <div className="toolbar-left">
                                <span className="toolbar-label">Sort</span>
                                {[["date", "Date"], ["name", "Name"], ["subject", "Subject"]].map(([k, l]) => (
                                    <button key={k} className={`sort-pill ${sortBy === k ? "active" : ""}`} onClick={() => setSortBy(k)}>{l}</button>
                                ))}
                                <div className="toolbar-sep" />
                                <button className={`group-btn ${groupBySub ? "active" : ""}`} onClick={() => setGroupBySub(p => !p)}>
                                    {groupBySub ? "✓ " : ""}Group by Subject
                                </button>
                            </div>
                            <div className="toolbar-right">
                                <button className={`view-btn ${viewMode === "card" ? "active" : ""}`} title="Card view" onClick={() => setViewMode("card")}><LayoutGrid size={13} /></button>
                                <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} title="List view" onClick={() => setViewMode("list")}><List size={13} /></button>
                            </div>
                        </div>
                        {renderCourses()}
                    </div>
                )}

                {/* GENERATE */}
                {activeTab === "generate" && (
                    <div className="fade-in dashboard-generate-root">
                        {generationStatus === "idle" && (
                            <div className="dashboard-generate-form-shell">
                                <div className="dashboard-header dashboard-generate-header">
                                    <div className="dashboard-generate-icon"><Sparkles size={20} /></div>
                                    <h1 className="dashboard-generate-title">Build a New Course</h1>
                                    <p className="dashboard-generate-subtitle">Define a topic and let the agents do the rest.</p>
                                </div>
                                <div className="glass-card dashboard-generate-card">
                                    <form onSubmit={generateCourse}>
                                        <button type="button" onClick={openCatalog} className="catalog-trigger-btn">
                                            <BookOpen size={15} /> Browse Subject &amp; Topic Catalog
                                        </button>
                                        <div className="form-group"><label className="form-label">Subject</label>
                                            <input name="subject" className="form-input" placeholder="e.g. Computer Science" onChange={updateForm} value={form.subject} required /></div>
                                        <div className="form-group"><label className="form-label">Topic</label>
                                            <input name="topic" className="form-input" placeholder="e.g. Neural Networks" onChange={updateForm} value={form.topic} required /></div>
                                        <div className="form-group"><label className="form-label">Grade / Standard</label>
                                            <input name="standard" type="number" className="form-input" placeholder="1 – 12" onChange={updateForm} value={form.standard} min="1" max="12" required /></div>
                                        <button type="submit" className="btn btn-primary dashboard-generate-submit">
                                            <Sparkles size={15} /> Initialize Agents
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Running — dark shell always */}
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
                                        {generationStatus === "finalizing" || progress >= 90
                                            ? "Adding finishing touches to your curriculum..."
                                            : `Researching ${form.topic || "your topic"} across the web…`}
                                    </p>

                                    <div className="dashboard-progress-wrapper">
                                        <div className="dashboard-progress-track">
                                            <div className="dashboard-progress-fill"
                                                style={{
                                                    width: `${progress}%`,
                                                    transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)" // Smooth gliding
                                                }} />
                                        </div>
                                        <span className="dashboard-progress-label">
                                            {progress >= 90 ? "..." : `${Math.round(progress)}%`}
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
                                    <button className="btn btn-primary" style={{ padding: "0 1.75rem", fontWeight: 600 }} onClick={() => openCourse(generatedCourseId)}>Start Learning</button>
                                    <button className="btn btn-secondary" onClick={() => setTimeout(() => resetGenerator(), 0)}>Create Another</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PROGRESS */}
                {activeTab === "progress" && (
                    <div className="fade-in">
                        <div className="dashboard-header">
                            <h1 className="dashboard-page-title">Learning Progress</h1>
                        </div>
                        {courses.length === 0 ? (
                            <div className="progress-empty-page">
                                <div className="progress-empty-icon">◎</div>
                                <p style={{ marginBottom: "1rem" }}>No courses yet.</p>
                                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab("generate")}><PlusCircle size={13} /> Create first course</button>
                            </div>
                        ) : (
                            <>
                                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                                    Click any lesson node to mark it complete. Open each course first to load its lessons into the map.
                                </p>
                                <div className="progress-grid">
                                    {courses.map(course => (
                                        <ProgressCourseCard key={course.id} course={course} onOpenCourse={() => openCourse(course.id)} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* NOTEBOOK */}
                {activeTab === "notebook" && (
                    <div style={{ margin: "-1.75rem -2rem", height: "calc(100vh - 0px)", overflow: "hidden" }}>
                        <Notebook />
                    </div>
                )}

                {/* UPCOMING */}
                {activeTab === "usage" && (
                    <div className="fade-in">
                        <div className="dashboard-header"><h1 className="dashboard-page-title">Upcoming Features</h1></div>
                        <div className="dashboard-usage-list">
                            {MOCK_USAGE_LOGS.map(log => (
                                <div key={log.id} className="dashboard-usage-row">
                                    <div className="dashboard-usage-icon"><Cpu size={15} /></div>
                                    <div><h4 className="dashboard-usage-agent">{log.agent}</h4><span className="dashboard-usage-id">ID: 00{log.id}</span></div>
                                    <div className="dashboard-usage-action">{log.action}</div>
                                    <div className="dashboard-usage-time"><Clock size={12} /> {log.time}</div>
                                    <div className={`dashboard-usage-tokens ${log.status === "free" ? "dashboard-usage-tokens--success" : "dashboard-usage-tokens--warning"}`}>{log.tokens}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}