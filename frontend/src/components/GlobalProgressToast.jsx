import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GlobalProgressToast() {
    const navigate = useNavigate();
    const [genState, setGenState] = useState({ status: 'idle', progress: 0, id: null });
    const [visible, setVisible] = useState(true);

    // Poll localStorage to sync the generation state across tabs/pages
    useEffect(() => {
        const checkStorage = () => {
            const status = localStorage.getItem('dash_genStatus') || 'idle';
            const progress = parseInt(localStorage.getItem('dash_progress') || '0', 10);
            const id = localStorage.getItem('dash_genId');
            setGenState({ status, progress, id });
        };
        checkStorage();
        const interval = setInterval(checkStorage, 500);
        return () => clearInterval(interval);
    }, []);

    // 25-Second Auto-Hide Timer
    useEffect(() => {
        if (genState.status === 'completed') {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                // Clear storage so it doesn't pop back up on page refresh
                localStorage.removeItem('dash_genStatus');
                localStorage.removeItem('dash_genId');
            }, 25000); // 25 seconds

            return () => clearTimeout(timer);
        } else {
            setVisible(true);
        }
    }, [genState.status]);

    if (genState.status === 'idle' || !visible) return null;

    const isDone = genState.status === 'completed';

    // Click to Redirect Handler
    // Inside GlobalProgressToast.jsx

    const handleClick = () => {
        if (isDone && genState.id) {
            // 1. CLEAR the status so the toast disappears immediately
            localStorage.removeItem('dash_genStatus');
            localStorage.removeItem('dash_genId');
            localStorage.removeItem('dash_progress');
            localStorage.removeItem('dash_tempId');
            localStorage.removeItem('dash_backendReady');

            // 2. Update local state so it stops rendering before the navigate happens
            setGenState({ status: 'idle', progress: 0, id: null });
            setVisible(false);

            // 3. Navigate to the course
            navigate(`/product/${genState.id}`);
        }
    };

    return (
        <div
            className={`floating-status ${isDone ? 'floating-status--completed' : 'floating-status--running'}`}
            onClick={isDone ? handleClick : undefined}
            style={{
                cursor: isDone ? 'pointer' : 'default',
                paddingBottom: isDone ? '1rem' : '0.75rem' // Extra space for the timer bar
            }}
        >
            {isDone ? (
                <CheckCircle size={20} color="var(--success)" style={{ flexShrink: 0 }} />
            ) : (
                <Loader2 size={20} className="animate-spin" color="var(--accent)" style={{ flexShrink: 0 }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {isDone ? 'Course Ready!' : 'Generating Course...'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {isDone
                        ? 'Click to start learning'
                        : (genState.status === 'finalizing' || genState.progress >= 99)
                            ? 'Adding finishing touches...'
                            : `${genState.progress}% complete`}
                </span>
            </div>

            {/* Hint Arrow to show it's a clickable button */}
            {isDone && <ArrowRight size={16} color="var(--text-secondary)" style={{ flexShrink: 0, marginLeft: '5px' }} />}

            {/* The 25-second fading timeout bar */}
            {isDone && <div className="toast-timeout-bar" />}
        </div>
    );
}