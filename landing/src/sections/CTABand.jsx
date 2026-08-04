import { ArrowRight } from 'lucide-react';
import { WHATSAPP, WHATSAPP_MSG_GENERAL } from '../config';

export default function CTABand() {
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG_GENERAL)}`;

  return (
    <section className="relative bg-[#ff5500] py-16 overflow-hidden">
      {/* Animated bg circles */}
      <div className="absolute -left-20 -top-20 w-60 h-60 bg-white/10 rounded-full animate-float" />
      <div className="absolute -right-10 -bottom-16 w-40 h-40 bg-white/10 rounded-full animate-float-delay" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="font-bold text-white text-2xl md:text-3xl mb-2">
            ¿Listo para importar?
          </h2>
          <p className="text-white/80 text-base">
            Escríbenos por WhatsApp y te cotizamos en minutos.
          </p>
        </div>
        <a href={waUrl} target="_blank" rel="noopener"
           className="group flex items-center gap-3 bg-white text-slate-800 px-8 py-4 font-bold rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl animate-pulse-glow">
          Escribir por WhatsApp
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </section>
  );
}
