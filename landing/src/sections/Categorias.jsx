import { ArrowRight, MessageCircle } from 'lucide-react';
import { WHATSAPP, WHATSAPP_MSG_GENERAL } from '../config';

const CATS = [
  {
    title: 'MINIMOTOS',
    desc: 'Cruza la ciudad con estilo. Potencia compacta directamente de fábrica.',
    img: '/prod-moto-dirt.png',
  },
  {
    title: 'TECH & GADGETS',
    desc: 'Lo último en iPhones, MacBooks y accesorios originales.',
    img: '/prod-laptop.png',
  },
  {
    title: 'SMARTPHONES',
    desc: 'iPhones originales, importación directa.',
    img: '/prod-phones-dark.png',
  },
];

export default function Categorias() {
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG_GENERAL)}`;

  return (
    <section className="py-20 bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <h2 data-reveal className="text-2xl md:text-3xl font-bold text-slate-800">
            Nuestras <em className="text-[#ff5500] not-italic" style={{ fontStyle: 'italic' }}>categorías</em>
          </h2>
          <p data-reveal data-delay="1" className="text-slate-400 text-sm max-w-xs text-right">
            Lo más pedido por la gente. Calidad garantizada de USA y China.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ gridTemplateRows: 'auto' }}>

          {/* Large — Motos */}
          <a href="#productos" data-reveal
             className="group relative rounded-2xl overflow-hidden h-[320px] md:h-full md:row-span-2 block">
            <img src={CATS[0].img} alt={CATS[0].title}
                 className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white font-bold text-xl uppercase mb-1">{CATS[0].title}</h3>
              <p className="text-white/70 text-sm mb-3 max-w-xs">{CATS[0].desc}</p>
              <span className="inline-flex items-center gap-1 text-[#ff5500] text-sm font-bold uppercase group-hover:gap-2 transition-all">
                Ver todo <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </a>

          {/* Right column */}
          <div className="grid grid-rows-2 gap-4">

            {/* Tech */}
            <a href="#productos" data-reveal data-delay="1"
               className="group relative rounded-2xl overflow-hidden h-[250px] block">
              <img src={CATS[1].img} alt={CATS[1].title}
                   className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-lg uppercase mb-1">{CATS[1].title}</h3>
                <p className="text-white/60 text-xs">{CATS[1].desc}</p>
              </div>
            </a>

            {/* Bottom row — Accesorios + CTA */}
            <div className="grid grid-cols-2 gap-4">

              {/* Accesorios */}
              <a href="#productos" data-reveal data-delay="2"
                 className="group relative rounded-2xl overflow-hidden block">
                <img src={CATS[2].img} alt={CATS[2].title}
                     className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-sm uppercase mb-0.5">{CATS[2].title}</h3>
                  <p className="text-white/60 text-[11px]">{CATS[2].desc}</p>
                </div>
              </a>

              {/* WhatsApp CTA card */}
              <div data-reveal data-delay="3"
                   className="bg-[#ff5500] rounded-2xl p-5 flex flex-col justify-center items-center text-center">
                <MessageCircle className="w-8 h-8 text-white/80 mb-3" />
                <h3 className="text-white font-bold text-sm uppercase mb-2">
                  ¿Buscas algo específico?
                </h3>
                <p className="text-white/70 text-[11px] mb-4 leading-relaxed">
                  Importamos cualquier producto de USA o China bajo pedido. Consúltanos sin compromiso.
                </p>
                <a href={waUrl} target="_blank" rel="noopener"
                   className="bg-white text-slate-800 font-bold text-xs uppercase tracking-wide px-4 py-2.5 rounded-full hover:bg-slate-100 transition-colors">
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
