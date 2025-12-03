import { useRef, useState, useCallback, useEffect } from "react";

export default function useGenerateCourse() {
    const [generationStatus, setGenerationStatus] = useState("idle");
    const [progress, setProgress] = useState(0);
    const [generatedCourseId, setGeneratedCourseId] = useState(null);
    const progressInterval = useRef(null);

    useEffect(() => {
        return () => clearInterval(progressInterval.current);
    }, []);

    const startProgressLoop = useCallback(() => {
        clearInterval(progressInterval.current);
        setProgress(0);
        progressInterval.current = setInterval(() => {
            setProgress((old) => {
                if (old >= 90) return 90;
                return old + (old < 50 ? 5 : 2);
            });
        }, 800);
    }, []);

    const stopProgressLoop = useCallback(() => {
        clearInterval(progressInterval.current);
        setProgress(100);
    }, []);

    const generateCourse = useCallback(async ({ subject, topic, standard }, onComplete) => {
        if (!topic || !subject || !standard) {
            throw new Error("Missing fields");
        }
        setGenerationStatus("running");
        startProgressLoop();

        try {
            await new Promise(resolve => setTimeout(resolve, 4500));

            stopProgressLoop();
            const newId = Date.now();
            setGeneratedCourseId(newId);
            setGenerationStatus("completed");

            if (typeof onComplete === "function") onComplete({ id: newId, subject, topic, standard });

            return { id: newId };
        } catch (err) {
            clearInterval(progressInterval.current);
            setGenerationStatus("idle");
            setProgress(0);
            throw err;
        }
    }, [startProgressLoop, stopProgressLoop]);

    const reset = useCallback(() => {
        setGenerationStatus("idle");
        setProgress(0);
        setGeneratedCourseId(null);
        clearInterval(progressInterval.current);
    }, []);

    return {
        generationStatus,
        progress,
        generatedCourseId,
        generateCourse,
        reset,
    };
}
