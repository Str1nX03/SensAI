/* src/components/DatabaseWithRestApi.jsx - WATERFALL VERSION */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Globe, 
  Database, 
  Bot, 
  GraduationCap, 
  ClipboardCheck, 
  Sparkles 
} from "lucide-react";
import { cn } from "../utils/animation";

const AgentNode = ({ icon: Icon, title, subtitle, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay, duration: 0.5 }}
      className="relative z-10 flex w-[260px] items-center gap-3 rounded-xl border border-zinc-800 bg-[#09090b]/90 p-2.5 shadow-lg backdrop-blur-md"
    >
      {/* Icon Box */}
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg border bg-zinc-900/50",
        color === "blue" ? "border-blue-500/20 text-blue-400" :
        color === "amber" ? "border-amber-500/20 text-amber-400" :
        "border-emerald-500/20 text-emerald-400"
      )}>
        <Icon size={18} />
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className="text-xs font-bold text-zinc-100">{title}</span>
        <span className="text-[10px] text-zinc-500 font-mono">{subtitle}</span>
      </div>

      {/* Status Indicator */}
      <div className="absolute right-3 flex items-center gap-1.5">
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }} 
          transition={{ duration: 1.5, repeat: Infinity, delay: delay }}
          className={cn(
            "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]",
             color === "blue" ? "bg-blue-500 text-blue-500" :
             color === "amber" ? "bg-amber-500 text-amber-500" :
             "bg-emerald-500 text-emerald-500"
          )} 
        />
      </div>
    </motion.div>
  );
};

const CompactGenerationCard = ({ className }) => {
  return (
    <div
      className={cn(
        "relative flex h-[340px] w-full max-w-[500px] flex-col items-center justify-center font-sans overflow-hidden rounded-2xl border border-zinc-800 bg-[#050505]",
        className
      )}
    >
      {/* --- BACKGROUND GRID --- */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* --- TOP SECTION: INTERNET & DATABASE SYNC --- */}
      <div className="relative z-10 mb-6 flex w-[280px] items-center justify-between px-2">
        
        {/* Internet Node */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <Globe size={20} className="text-sky-400" />
            <motion.div 
              className="absolute inset-0 rounded-full border border-sky-400/50"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-[9px] font-bold text-sky-500 tracking-wider">INTERNET</span>
        </div>

        {/* Sync Animation Lines */}
        <div className="relative flex flex-1 items-center justify-center px-2">
          {/* Static Line */}
          <div className="h-[1px] w-full bg-zinc-800" />
          
          {/* Moving Packet (Left to Right) */}
          <motion.div 
             className="absolute h-1.5 w-8 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 blur-[1px]"
             animate={{ x: [-30, 30], opacity: [0, 1, 0] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Connection Text */}
          <div className="absolute -top-3 rounded-md bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">
             <span className="text-[8px] text-zinc-500 font-mono">SYNCING</span>
          </div>
        </div>

        {/* Database Node */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Database size={20} className="text-purple-400" />
          </div>
          <span className="text-[9px] font-bold text-purple-500 tracking-wider">DATABASE</span>
        </div>
      </div>

      {/* --- WATERFALL SECTION --- */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        
        {/* Vertical Connector Line (Background) */}
        <div className="absolute top-[-24px] bottom-4 left-1/2 w-[2px] -translate-x-1/2 bg-zinc-800">
           {/* Moving Light Beam Down */}
           <motion.div 
             className="absolute top-0 left-0 w-full bg-gradient-to-b from-transparent via-emerald-500 to-transparent opacity-70"
             style={{ height: "50%" }}
             animate={{ top: ["-50%", "100%"] }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           />
        </div>

        {/* 1. ASSISTANT AGENT */}
        <div className="relative">
          {/* Connector Dot */}
          <div className="absolute -top-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-700 ring-4 ring-[#050505]" />
          <AgentNode 
            icon={Bot} 
            title="Assistant Agent" 
            subtitle="Processing Schedule..." 
            color="blue" 
            delay={0.2} 
          />
        </div>

        {/* 2. TUTOR AGENT */}
        <div className="relative">
           <div className="absolute -top-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-700 ring-4 ring-[#050505]" />
          <AgentNode 
            icon={GraduationCap} 
            title="Tutor Agent" 
            subtitle="Generating Lesson..." 
            color="amber" 
            delay={0.8} 
          />
        </div>

        {/* 3. TESTING AGENT */}
        <div className="relative">
           <div className="absolute -top-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-700 ring-4 ring-[#050505]" />
          <AgentNode 
            icon={ClipboardCheck} 
            title="Testing Agent" 
            subtitle="Validating Knowledge..." 
            color="emerald" 
            delay={1.4} 
          />
          {/* Final Output Node */}
          <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center">
             <div className="h-4 w-[2px] bg-emerald-500/50" />
             <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5">
                <Sparkles size={10} className="text-emerald-400" />
                <span className="text-[8px] font-bold text-emerald-400">READY</span>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CompactGenerationCard;