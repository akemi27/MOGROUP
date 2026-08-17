import Image from 'next/image';
import { ShieldCheck, Truck, Zap, MessageCircle } from 'lucide-react';
import { EMPRESA, BENEFICIOS, WHATSAPP, WHATSAPP_MSG_GENERAL } from '../config';

const ICONS = { ShieldCheck, Truck, Zap, MessageCircle };

export default function SobreNosotros() {
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG_GENERAL)}`;

  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 data-reveal className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Detrás de <em className="text-[#ff5500] not-italic" style={{ fontStyle: 'italic' }}>Mo Group</em>
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Empresa peruana registrada ante SUNAT. Importación directa sin intermediarios.
          </p>
        </div>

        <div data-reveal className="grid lg:grid-cols-5 gap-8 items-start">

          {/* Left — compact collage (2 cols) */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              <Image src="/prod-moto-sport.png" alt="Motos" fill sizes="20vw" className="object-cover" />
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              <Image src="/prod-iphone-pro.png" alt="iPhones" fill sizes="20vw" className="object-cover" />
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              <Image src="/prod-laptop.png" alt="MacBooks" fill sizes="20vw" className="object-cover" />
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              <Image src="/prod-phones.png" alt="Accesorios" fill sizes="20vw" className="object-cover" />
            </div>
          </div>

          {/* Right — content (3 cols) */}
          <div className="lg:col-span-3">
            {/* Misión */}
            <div className="mb-5">
              <h3 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#ff5500] rounded-full" />
                Nuestra Misión
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed pl-4">
                Importar y comercializar productos de alta calidad desde USA y China, ofreciendo a nuestros clientes los mejores precios del mercado peruano con garantía real y atención personalizada.
              </p>
            </div>

            {/* Visión */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#ff5500] rounded-full" />
                Nuestra Visión
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed pl-4">
                Ser la empresa importadora líder en el norte del Perú, reconocida por la confianza, calidad y variedad de productos que ofrecemos a nivel nacional.
              </p>
            </div>

            {/* Data pills */}
            <div className="flex flex-wrap gap-3 mb-4">
              {[
                { label: 'RUC', val: EMPRESA.ruc },
                { label: 'Sede', val: EMPRESA.ciudad },
                { label: 'Desde', val: EMPRESA.constitucion },
              ].map(d => (
                <div key={d.label} className="bg-[#f5f5f5] rounded-full px-4 py-2 flex items-center gap-2">
                  <span className="text-xs text-slate-400">{d.label}:</span>
                  <span className="text-xs font-bold text-slate-700">{d.val}</span>
                </div>
              ))}
            </div>

            {/* Benefits pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {BENEFICIOS.map((b, i) => {
                const Icon = ICONS[b.icon];
                return (
                  <div key={i} className="bg-[#f5f5f5] rounded-full px-4 py-2 flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-[#ff5500]" />}
                    <span className="text-xs font-bold text-slate-700">{b.titulo}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <a href={waUrl} target="_blank" rel="noopener"
               className="inline-flex items-center gap-2 bg-[#ff5500] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#e64d00] transition-colors">
              <MessageCircle className="w-4 h-4" />
              Contáctanos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
