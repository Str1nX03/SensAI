import React, { useEffect, useState } from "react";
import "../styles/product.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function Product() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [openLesson, setOpenLesson] = useState(null);
  const [showResources, setShowResources] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/course/${id}`)
      .then(res => {
        setCourse(res.data.course);
      })
      .catch(err => {
        console.log(err);
        alert("Failed to load course");
      });
  }, [id]);


  if (!course) return <h2 className="loading">Loading course...</h2>;

  const { topic, subject, standard, intro, links, lessons, tests } = course;

  return (
    <div className="product-container">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate("/dashboard")}>
          AI LEARNING PLATFORM
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
          Exit to Dashboard
        </button>
      </nav>


      {/* HEADER */}
      <header className="product-header">
        <h1>{topic}</h1>
        <p>SUBJECT: {subject}  •  GRADE {standard}</p>
      </header>


      <div className="product-layout">

        <div className="overview-section">

          <div className="glass-card mb-3">
            <h3>Overview</h3>
            <p dangerouslySetInnerHTML={{ __html: intro }} /> 
          </div>

          <div className="glass-card">
            <h3>Resources</h3>
            <button
              className="btn btn-secondary"
              style={{ width:"100%", marginBottom:"1rem" }}
              onClick={() => setShowResources(prev => !prev)}
            >
              📚 View Materials  {showResources ? "▲" : "▼"}
            </button>

            {showResources && (
              <div className="resource-list">
                {links?.split("\n").map((l,i) => (
                  <a href={l} key={i} target="_blank" className="resource-item">
                    🔗 {l.length > 30 ? l.slice(0,30)+"..." : l}
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>


        <div className="lessons-section">
          <h2>Learning Path</h2>

          {Object.keys(lessons).map((lesson, index) => (
            <div key={index} className="lesson-card">

              <div
                className="lesson-header"
                onClick={() => setOpenLesson(openLesson === index ? null : index)}
              >
                <span>{lesson}</span>
                <span className="lesson-arrow">{openLesson === index ? "▲" : "▼"}</span>
              </div>

              {openLesson === index && (
                <div className="lesson-content">
                  <div dangerouslySetInnerHTML={{ __html: lessons[lesson] }} />

                  {tests?.[lesson] && (
                    <div className="quiz-section">
                      <h4>📝 Knowledge Check</h4>
                      <div dangerouslySetInnerHTML={{ __html: tests[lesson] }} />
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}

        </div>
      </div>


      <button className="fab" onClick={() => navigate("/dashboard")}>
        <span className="fab-icon">＋</span>
        <span className="fab-text">New Course</span>
      </button>

    </div>
  );
}
