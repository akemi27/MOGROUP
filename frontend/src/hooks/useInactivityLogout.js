import { useEffect, useRef } from 'react';

const IDLE_MS = 20 * 60 * 1000; // 20 minutos
const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

export function useInactivityLogout(onLogout) {
    const timerRef = useRef(null);

    useEffect(() => {
        const reset = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(onLogout, IDLE_MS);
        };
        EVENTS.forEach(ev => window.addEventListener(ev, reset, { passive: true }));
        reset();
        return () => {
            EVENTS.forEach(ev => window.removeEventListener(ev, reset));
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [onLogout]);
}
