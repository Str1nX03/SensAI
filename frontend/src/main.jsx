import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Landing from "./pages/Landing.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import About from "./pages/About.jsx"
import Product from "./pages/Product.jsx"
import "./styles/global.css"

import CpuArchitecture from "./components/CpuArchitecture.jsx"
import gsap from "gsap";
gsap.config({ nullTargetWarn: false });


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/product/:id" element={<Product />} />

      {/* 2. ADD THIS TEMPORARY DEV ROUTE */}
      <Route 
        path="/dev-cpu" 
        element={
          <div style={{ 
            width: "100vw", 
            height: "100vh", 
            backgroundColor: "#050505",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <CpuArchitecture width="80%" height="60%" />
          </div>
        } 
      />

    </Routes>
  </BrowserRouter>
)