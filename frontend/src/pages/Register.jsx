import { useState } from "react";
import "../styles/register.css";
import Navbar from "../components/Navbar";
import "../styles/navbar.css";
import { Home, User, FileText, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ShootingStar from "../components/ShootingStar";

const NAV_ITEMS = [
  { name:"Home", url:"/", icon:Home },
  { name:"Login", url:"/login", icon:User },
  { name:"Register", url:"/register", icon:FileText },
  { name:"About", url:"/about", icon:Briefcase }
];

export default function Register(){

  const navigate = useNavigate();
  const [form, setForm] = useState({ username:"", password:"" });

  async function handleRegister(e){
    e.preventDefault();
    try {
        const res = await fetch("http://localhost:5000/register",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(form)
        });

        const data = await res.json();
        if(res.ok){
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
        } else {
        alert(data.message || "Registration failed");
        }
    } catch (error) {
        console.error("Register Error:", error);
        alert("Something went wrong. Is the server running?");
    }
  }

  return(
  <>
    <Navbar items={NAV_ITEMS}/>

    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
        
        {/* BACKGROUND LAYER */}
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0 
        }}>
            <ShootingStar />
        </div>

        <main id="main-content" className="auth-container" style={{ position: "relative", zIndex: 1 }}>
            
            <div className="auth-left auth-animate">
                <p className="hero-subtitle" style={{ marginTop: "1rem", textAlign: "left" }}>“Anything that could give rise to smarter-than-human intelligence—in the form of Artificial Intelligence, brain-computer interfaces, or neuroscience-based human intelligence enhancement – wins hands down beyond contest as doing the most to change the world. Nothing else is even in the same league.”</p>
                <p className="hero-subtitle" style={{ marginTop: "1rem", textAlign: "right" }}>—Eliezer Yudkowsky, AI Researcher</p>
            </div>

            <div className="auth-right">
                <div className="auth-card auth-animate-delay">

                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-sub">Start learning smarter ✦</p>

                    <form onSubmit={handleRegister}>

                        <div className="form-group">
                            <label>Username</label>
                            <input 
                                type="text" 
                                className="form-input"
                                placeholder="Enter username"
                                value={form.username}
                                onChange={(e)=>setForm({...form,username:e.target.value})} 
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e)=>setForm({...form,password:e.target.value})} 
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary login-btn">Create Account</button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?
                        <a href="/login"> Sign in</a>
                    </p>

                    <a href="/" className="back-home">← Back to Home</a>
                
                </div>
            </div>
        </main>
    </div>
  </>
  );
}