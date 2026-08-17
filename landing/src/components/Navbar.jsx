'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { WHATSAPP, WHATSAPP_MSG_GENERAL } from '../config';

const LINKS = [
  { href: '#inicio',      label: 'Inicio',       id: 'inicio' },
  { href: '#productos',   label: 'Productos',    id: 'productos' },
  { href: '#redes',       label: 'Redes',        id: 'redes' },
  { href: '#nosotros',    label: 'Nosotros',     id: 'nosotros' },
  { href: '#testimonios', label: 'Testimonios',  id: 'testimonios' },
  { href: '#contacto',    label: 'Contacto',     id: 'contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);

      let current = 'inicio';
      for (const l of LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top <= 150) current = l.id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG_GENERAL)}`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
      scrolled ? 'shadow-sm' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        <a href="#" className="flex items-center gap-3">
          <img src="/chine.png" alt="Mo Importaciones" className="h-9 w-auto object-contain" />
          <span className="font-bold text-slate-800 text-lg hidden sm:block">Mo Group</span>
        </a>

        <ul className="hidden md:flex items-center gap-1">
          {LINKS.map(l => (
            <li key={l.href}>
              <a href={l.href}
                 className={`relative font-medium text-sm px-3 py-2 transition-colors ${
                   activeSection === l.id
                     ? 'text-[#ff5500]'
                     : 'text-slate-600 hover:text-[#ff5500]'
                 }`}>
                {l.label}
                {activeSection === l.id && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#ff5500] rounded-full" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <a href={waUrl} target="_blank" rel="noopener"
           className="hidden md:flex items-center gap-2 bg-[#ff5500] text-white px-5 py-2 font-bold text-sm rounded-full hover:bg-[#e64d00] transition-colors">
          Cotizar
        </a>

        <button className="md:hidden text-slate-700 p-1" onClick={() => setOpen(v => !v)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white px-6 py-5 flex flex-col gap-1 shadow-lg border-t border-slate-100">
          {LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
               className={`font-medium transition-colors py-3 border-b border-slate-50 ${
                 activeSection === l.id ? 'text-[#ff5500]' : 'text-slate-700 hover:text-[#ff5500]'
               }`}>
              {l.label}
            </a>
          ))}
          <a href={waUrl} target="_blank" rel="noopener" onClick={() => setOpen(false)}
             className="mt-3 bg-[#ff5500] text-white px-5 py-3 text-center font-bold rounded-full">
            Cotizar Ahora
          </a>
        </div>
      )}
    </nav>
  );
}
