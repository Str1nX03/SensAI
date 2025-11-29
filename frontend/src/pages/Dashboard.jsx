import React, { useEffect, useState } from "react";
import "../styles/dashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/navbar.css";
import { Home, User, FileText, Briefcase } from "lucide-react";

const NAV_ITEMS = [
  { name:"Home", url:"/", icon:Home },
  { name:"Login", url:"/login", icon:User },
  { name:"Register", url:"/register", icon:FileText },
  { name:"About", url:"/about", icon:Briefcase }
];

export default function Dashboard() {

  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    topic: "",
    subject: "",
    standard: ""
  });

  // Fetch saved courses on page load
  useEffect(() => {
    axios.get("http://localhost:5000/api/courses")
      .then(res => {
        if (res.data.courses) setCourses(res.data.courses);
      })
      .catch(() => alert("Failed to load courses"));
  }, []);

  // Handle form input
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle Course Generation
  const generateCourse = async () => {
    if(!form.topic || !form.subject || !form.standard) return alert("Fill all fields");

    try {
      const res = await axios.post("http://localhost:5000/api/generate", form);

      if (res.data.success){
        alert("Course generated!");
        navigate(`/product/${res.data.course_id}`);
      }
      else alert("Generation failed");
      
    } catch (err){
      alert("Server error");
      console.log(err);
    }
  };

  return (
    
    <div className="dashboard-page">

      {/* HEADER */}
      <nav className="navbar">
        <h2>Dashboard</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/login")}>Logout</button>
      </nav>

      {/* NEW COURSE FORM */}
      <div className="generate-box glass-card">
        <h3>Create New Learning Course</h3>

        <input name="topic" placeholder="Topic" onChange={update} />
        <input name="subject" placeholder="Subject" onChange={update} />
        <input name="standard" type="number" placeholder="Grade" onChange={update} />

        <button className="btn btn-primary" onClick={generateCourse}>Generate Course →</button>
      </div>

      {/* COURSE HISTORY */}
      <section className="course-history">
        <h3>Your Courses</h3>

        {courses.length === 0 && <p>No saved courses yet.</p>}

        <div className="course-list">
          {courses.map(course => (
            <div 
              className="course-card"
              key={course.id}
              onClick={() => navigate(`/product/${course.id}`)}
            >
              <h4>{course.topic}</h4>
              <p>{course.subject} | Grade {course.standard}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
