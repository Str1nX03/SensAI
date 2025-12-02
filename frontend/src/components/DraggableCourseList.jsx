"use client";

import React, { useState } from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { GripVertical, Trash2, Edit2, Check, BookOpen } from "lucide-react";
import { cn } from "../utils/animation";

const DraggableCourseList = () => {
  const [courses, setCourses] = useState([
    { id: "1", title: "Advanced React Patterns", progress: "80%" },
    { id: "2", title: "Python for Data Science", progress: "45%" },
    { id: "3", title: "UI/UX Fundamentals", progress: "12%" },
    { id: "4", title: "Docker & Kubernetes", progress: "0%" },
  ]);

  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = (id) => {
    setCourses((prev) => prev.filter((course) => course.id !== id));
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white">Active Courses</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
            isEditing
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          )}
        >
          {isEditing ? (
            <>
              <Check className="size-3" /> Done
            </>
          ) : (
            <>
              <Edit2 className="size-3" /> Edit
            </>
          )}
        </button>
      </div>

      {/* Reorderable List */}
      <Reorder.Group
        axis="y"
        values={courses}
        onReorder={setCourses}
        className="space-y-3"
      >
        <AnimatePresence initial={false}>
          {courses.map((course) => (
            <Reorder.Item
              key={course.id}
              value={course}
              dragListener={isEditing}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileDrag={{ scale: 1.02, zIndex: 10 }}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#18181B] p-3 shadow-sm transition-colors",
                isEditing ? "cursor-grab active:cursor-grabbing hover:border-zinc-700" : ""
              )}
            >
              {/* Drag Handle */}
              {isEditing && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="text-zinc-500"
                >
                  <GripVertical className="size-5" />
                </motion.div>
              )}

              {/* Course Icon */}
              <div className="grid size-10 place-items-center rounded-lg bg-zinc-900 text-zinc-400">
                <BookOpen className="size-5" />
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <h3 className="truncate text-sm font-medium text-white">
                  {course.title}
                </h3>
                <p className="text-xs text-zinc-500">Progress: {course.progress}</p>
              </div>

              {isEditing && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => handleDelete(course.id)}
                  className="rounded-lg bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="size-4" />
                </motion.button>
              )}
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
};

export default DraggableCourseList;