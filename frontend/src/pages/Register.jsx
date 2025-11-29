import { useEffect, useState } from "react";
import { initBackground } from "../utils/scene";
import "../styles/login.css";          // ⬅ use SAME styling file
import Navbar from "../components/Navbar";
import "../styles/navbar.css";
import { Home, User, FileText, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { name:"Home", url:"/", icon:Home },
  { name:"Login", url:"/login", icon:User },
  { name:"Register", url:"/register", icon:FileText },
  { name:"About", url:"/about", icon:Briefcase }
];

export default function Register(){

  const navigate = useNavigate();
  const [form, setForm] = useState({ username:"", password:"" });

  useEffect(()=>{ setTimeout(()=>initBackground(),60); },[]);

  async function handleRegister(e){
    e.preventDefault();
    const res = await fetch("http://localhost:5000/register",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify(form)
    });

    const data = await res.json();
    if(res.ok){
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else alert(data.message || "Registration failed");
  }

  return(
  <>
  <Navbar items={NAV_ITEMS}/>

  <main className="auth-container auth-animate"> {/* entrance animation like login */}

    <div className="auth-card">

      <h2 className="auth-title">Create Account</h2>
      <p className="auth-sub">Start learning smarter ✦</p>

      <form onSubmit={handleRegister}>

        <div className="form-group">
          <label>Username</label>
          <input type="text" 
          className="form-input"
          placeholder="Enter username"
          onChange={(e)=>setForm({...form,username:e.target.value})} required/>
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password"
          className="form-input"
          placeholder="••••••••"
          onChange={(e)=>setForm({...form,password:e.target.value})} required/>
        </div>

        <button className="btn btn-primary login-btn">Create Account</button>
      </form>

      <p className="auth-switch">
        Already have an account?
        <a href="/login"> Sign in</a>
      </p>
    
    </div>
  </main>
  </>
  );
}
