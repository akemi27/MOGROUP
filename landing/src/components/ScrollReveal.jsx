'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    io.unobserve(e.target);
                }
            }),
            { threshold: 0.01, rootMargin: '0px 0px -10px 0px' }
        );

        const observe = () => {
            document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(el => {
                io.observe(el);
                const r = el.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
            });
        };

        observe();

        const mo = new MutationObserver(() => observe());
        mo.observe(document.body, { childList: true, subtree: true });

        return () => { io.disconnect(); mo.disconnect(); };
    }, []);

    return null;
}
