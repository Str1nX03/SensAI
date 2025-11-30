import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Home, User, LogOut, BookOpen, Plus } from "lucide-react";
import "../styles/dashboard.css";

const NAV_ITEMS = [
  { name: "Home", url: "/", icon: Home },
  { name: "Logout", url: "/login", icon: LogOut }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  
  const [loading, setLoading] = useState(false); 
  
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    standard: ""
  });

  // 1. Fetch Courses on Load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if(!token) navigate("/login");

    axios.get("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        if (res.data.courses) setCourses(res.data.courses);
    })
    .catch(err => console.error(err));
  }, [navigate]);

  const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 2. The Agent Trigger
  const generateCourse = async (e) => {
    e.preventDefault();
    if(!form.topic || !form.subject || !form.standard) return alert("Please fill all fields");

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/generate", form, {
          headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success){
        setLoading(false);
        navigate(`/product/${res.data.course_id}`);
      }
    } catch (err){
      setLoading(false);
      alert("Agent failed to generate course. Check console.");
      console.log(err);
    }
  };

  return (
    <>
      <Navbar items={NAV_ITEMS} />

      <main id="main-content" className="dashboard-page">
        
        <div className="welcome-section" style={{ marginBottom: "2rem" }}>
            <h1>Dashboard</h1>
            <p>Manage your learning agents and active sessions.</p>
        </div>

        <div className="dashboard-layout">
            
            <div className="glass-card">
                <h2>Initialize Course</h2>
                <p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>Configure AI parameters for a new study session.</p>

                {!loading ? (
                    <form onSubmit={generateCourse}>
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input 
                                name="subject" 
                                className="form-input" 
                                placeholder="e.g. Physics" 
                                onChange={updateForm} 
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Topic</label>
                            <input 
                                name="topic" 
                                className="form-input" 
                                placeholder="e.g. Thermodynamics" 
                                onChange={updateForm} 
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Grade Level</label>
                            <input 
                                name="standard" 
                                type="number" 
                                className="form-input" 
                                placeholder="1-12" 
                                min="1" max="12"
                                onChange={updateForm} 
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                            Generate Course
                        </button>
                    </form>
                ) : (
                    /* --- THIS SHOWS WHEN AGENT IS WORKING --- */
                    <div className="loading-container active" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem" }}>
                        <div className="spinner" style={{ marginBottom: "1rem" }}></div>
                        <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#03ae00" }}>
                            AGENTS COLLABORATING...
                        </span>
                        <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
                            Generating Lessons & Quizzes
                        </p>
                    </div>
                )}
            </div>

            <div>
                <h2 style={{ fontSize: "1.5rem", borderBottom: "1px solid #333", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                    Active Courses
                </h2>

                {courses.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                        {courses.map(course => (
                            <div key={course.id} className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div>
                                    <h4 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>{course.topic}</h4>
                                    <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem", color: "#888" }}>
                                        {course.subject} • Grade {course.standard}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => navigate(`/product/${course.id}`)} 
                                    className="btn btn-secondary"
                                    style={{ width: "100%" }}
                                >
                                    Resume Session
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card" style={{ textAlign: "center", borderStyle: "dashed", padding: "3rem" }}>
                        <p style={{ margin: 0, color: "#666" }}>No active courses found. Initialize one on the left.</p>
                    </div>
                )}
            </div>

        </div>
      </main>
    </>
  );
}