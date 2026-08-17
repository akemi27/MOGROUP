'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { WHATSAPP, WHATSAPP_MSG_GENERAL, EMPRESA } from '../config';

const SLIDES = [
  { img: '/prod-moto-sport.png',  tag: 'MINIMOTOS',          title: 'POTENCIA\nIMPORTADA',       sub: 'Las mejores minimotos directo de fábrica en China.' },
  { img: '/prod-iphone-pro.png',  tag: 'iPHONES',           title: 'TECNOLOGÍA\nORIGINAL',       sub: 'iPhones originales con garantía real. Importación directa de USA.' },
  { img: '/prod-laptop.png',      tag: 'MacBOOKS',          title: 'APPLE\nM-SERIES',            sub: 'MacBooks con chip Apple Silicon. Rendimiento profesional.' },
  { img: '/prod-moto-naked.png',  tag: 'MINIMOTOS',          title: 'DISEÑO Y\nRENDIMIENTO',      sub: 'Minimotos con estilo urbano. Importación directa.' },
];

export default function Hero() {
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG_GENERAL)}`;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setActive(i => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(iv);
  }, []);

  const prev = () => setActive(i => (i - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setActive(i => (i + 1) % SLIDES.length);
  const slide = SLIDES[active];

  return (
    <section id="inicio" className="relative bg-white overflow-hidden min-h-[90vh] flex flex-col">

      {/* Watermark text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[18vw] font-black text-slate-100 uppercase tracking-tighter whitespace-nowrap leading-none">
          MO GROUP
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-8 items-center py-16">

          {/* Left — Product image */}
          <div className="relative order-2 lg:order-1">
            {SLIDES.map((s, i) => (
              <div key={i}
                   className="transition-all duration-700"
                   style={{
                     opacity: i === active ? 1 : 0,
                     transform: i === active ? 'scale(1) translateX(0)' : 'scale(0.95) translateX(-20px)',
                     position: i === active ? 'relative' : 'absolute',
                     inset: i === active ? undefined : 0,
                     pointerEvents: i === active ? 'auto' : 'none',
                   }}>
                <img src={s.img} alt={s.title}
                     className="w-full max-h-[65vh] object-contain drop-shadow-2xl" />
              </div>
            ))}

            {/* Nav arrows bottom left */}
            <div className="absolute bottom-4 left-0 flex items-center gap-2">
              <button onClick={prev} className="flex items-center gap-1 text-slate-400 hover:text-[#ff5500] transition-colors text-sm">
                <ChevronLeft className="w-5 h-5" /> ANT
              </button>
              <span className="text-slate-300 mx-2">|</span>
              <button onClick={next} className="flex items-center gap-1 text-slate-400 hover:text-[#ff5500] transition-colors text-sm">
                SIG <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right — Text */}
          <div className="order-1 lg:order-2">
            <p className="text-[#ff5500] font-bold text-sm tracking-[0.3em] uppercase mb-4 transition-all duration-500"
               key={`tag-${active}`}>
              {slide.tag}
            </p>

            <h1 className="font-black text-slate-900 uppercase leading-[0.95] mb-6 whitespace-pre-line transition-all duration-500"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)' }}
                key={`title-${active}`}>
              {slide.title}
            </h1>

            <p className="text-slate-500 text-base max-w-md mb-10 leading-relaxed transition-all duration-500"
               key={`sub-${active}`}>
              {slide.sub}
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#productos"
                 className="group flex items-center gap-3 bg-[#ff5500] text-white px-8 py-4 font-bold uppercase tracking-wider hover:bg-[#e64d00] transition-all">
                Ver Productos
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href={waUrl} target="_blank" rel="noopener"
                 className="flex items-center gap-3 border-2 border-slate-900 text-slate-900 px-8 py-4 font-bold uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all">
                Contáctanos
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-8 flex gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === active ? 'w-10 bg-[#ff5500]' : 'w-4 bg-slate-200 hover:bg-slate-300'
                  }`} />
        ))}
      </div>
    </section>
  );
}
