import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Hero from './sections/Hero';
import Categorias from './sections/Categorias';
import Catalogo from './sections/Catalogo';
import CTABand from './sections/CTABand';
import VideoPromo from './sections/VideoPromo';
import SobreNosotros from './sections/SobreNosotros';
import Testimonios from './sections/Testimonios';
import Importar from './sections/Importar';
import FAQ from './sections/FAQ';
import Contacto from './sections/Contacto';

function useRevealObserver() {
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
}

export default function App() {
  useRevealObserver();

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Categorias />
        <Catalogo />
        <CTABand />
        <VideoPromo />
        <SobreNosotros />
        <Testimonios />
        <Importar />
        <Contacto />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
