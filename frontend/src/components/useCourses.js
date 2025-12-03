import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const MOCK = [
    { id: 101, subject: "Physics", topic: "Quantum Mechanics", standard: 12 },
    { id: 102, subject: "History", topic: "The Renaissance", standard: 10 },
    { id: 103, subject: "Computer Science", topic: "React Hooks", standard: 11 },
];

export default function useCourses() {
    const [courses, setCourses] = useState([...MOCK]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function fetchCourses() {
            setLoading(true);

            try {
                const token = localStorage.getItem("token") || "";
                const res = await axios.get("http://localhost:5000/api/courses", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (mounted && res.data?.courses?.length) {
                    setCourses(res.data.courses);
                }
            } catch (err) {
                console.warn("Using mock courses (API unreachable)");
            }

            if (mounted) setLoading(false);
        }

        fetchCourses();

        return () => { mounted = false; };
    }, []);

    // ADD COURSE
    const addCourse = useCallback((course) => {
        setCourses((prev) => [...prev, course]);
    }, []);

    // DELETE COURSE(S)
    const deleteCourses = useCallback(async (ids = []) => {
        if (!Array.isArray(ids) || ids.length === 0) return;

        const token = localStorage.getItem("token") || "";

        setCourses((prev) => prev.filter((c) => !ids.includes(c.id)));

        await Promise.all(
            ids.map((id) =>
                axios
                    .delete(`http://localhost:5000/api/courses/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .catch(() => {})
            )
        );
    }, []);

    return {
        courses,
        loading,
        addCourse,
        deleteCourses,
        setCourses,
    };
}
