'use client';

import { Truck, ShieldCheck, Headphones, FileCheck, ArrowRight } from 'lucide-react';
import { WHATSAPP } from '../config';

const VENTAJAS = [
  { icon: Truck,        title: 'Envío Directo',   desc: 'De fábrica a tu puerta.' },
  { icon: ShieldCheck,  title: 'Garantía Real',    desc: 'Cero preocupaciones.' },
  { icon: Headphones,   title: 'Soporte Total',    desc: 'Te asesoramos en todo.' },
  { icon: FileCheck,    title: 'Cero Trámites',    desc: 'Aduanas resuelto.' },
];

export default function Importar() {
  return (
    <section className="py-20 bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div data-reveal>
            <h2 className="font-bold text-slate-800 text-2xl md:text-3xl leading-tight mb-4">
              Aprende a importar con nuestro{' '}
              <em className="text-[#ff5500] not-italic" style={{ fontStyle: 'italic' }}>respaldo</em>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-md">
              Te guiamos en todo el proceso de importación desde China y USA. Encuentra el mejor precio de fábrica y la ruta más eficiente.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {VENTAJAS.map(v => (
                <div key={v.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                    <v.icon className="w-5 h-5 text-[#ff5500]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{v.title}</p>
                    <p className="text-xs text-slate-400">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — CTA card */}
          <div data-reveal className="relative">
            <div className="bg-slate-900 rounded-2xl p-8 md:p-10">
              <span className="inline-block bg-[#ff5500] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
                Asesórate gratis
              </span>

              <h3 className="text-white font-bold text-xl md:text-2xl mb-3">
                ¿Quieres importar a lo grande?
              </h3>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">
                Nuestro equipo de expertos te ayudará a encontrar el mejor precio de fábrica y la ruta más eficiente. ¡No pierdas tiempo!
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                const nombre = e.target.nombre?.value || '';
                const producto = e.target.producto?.value || '';
                const text = `Hola, soy ${nombre}. Quiero importar: ${producto}`;
                window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank');
              }} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/40 text-xs font-medium uppercase tracking-wide">Tu nombre completo</label>
                  <input name="nombre" type="text" placeholder="Ej: Juan Pérez"
                    className="bg-white/10 border border-white/10 text-white px-4 py-3 text-sm rounded-lg placeholder-white/25 focus:outline-none focus:border-[#ff5500] transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/40 text-xs font-medium uppercase tracking-wide">¿Qué buscas traer?</label>
                  <input name="producto" type="text" placeholder="Motos, iPhones, MacBooks..."
                    className="bg-white/10 border border-white/10 text-white px-4 py-3 text-sm rounded-lg placeholder-white/25 focus:outline-none focus:border-[#ff5500] transition-colors" />
                </div>
                <button type="submit"
                  className="group mt-2 bg-[#ff5500] text-white py-4 font-bold text-base rounded-lg hover:bg-[#e64d00] transition-colors flex items-center justify-center gap-2">
                  Quiero una asesoría
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
