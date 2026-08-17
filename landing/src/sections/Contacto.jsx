import Image from 'next/image';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { WHATSAPP, WHATSAPP_MSG_GENERAL, EMPRESA } from '../config';

export default function Contacto() {
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG_GENERAL)}`;

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 data-reveal className="font-bold text-slate-800 text-2xl md:text-3xl mb-2">
            Contáctanos
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Estamos en Chiclayo y despachamos a todo el Perú. Escríbenos o visítanos.
          </p>
        </div>

        <div data-reveal className="grid lg:grid-cols-2 gap-8">

          {/* Left — Map */}
          <div className="rounded-2xl overflow-hidden h-[400px] border border-slate-100">
            <iframe
              title="Ubicación Mo Group"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.123!2d-79.8404!3d-6.7714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x904cef0a1c85e24d%3A0x1234567890abcdef!2sAlfredo%20Lapoint%201149%2C%20Chiclayo!5e0!3m2!1ses!2spe!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Right — Info + CTA */}
          <div className="flex flex-col justify-between">

            {/* Contact info */}
            <div className="space-y-5 mb-8">
              {[
                { Icon: Phone,  label: 'WhatsApp / Llamadas', val: EMPRESA.telefono },
                { Icon: Mail,   label: 'Correo electrónico',  val: EMPRESA.email },
                { Icon: MapPin, label: 'Dirección',           val: EMPRESA.direccion },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#ff5500]/10 flex items-center justify-center text-[#ff5500] rounded-xl shrink-0">
                    <c.Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{c.label}</p>
                    <p className="text-sm font-bold text-slate-700">{c.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Company card */}
            <div className="bg-[#f5f5f5] rounded-xl p-5 mb-6 flex items-center gap-4">
              <Image src="/chine.png" alt="" width={100} height={40} className="h-10 w-auto object-contain" />
              <div>
                <p className="text-sm font-bold text-slate-700">{EMPRESA.razonSocial}</p>
                <p className="text-[11px] text-slate-400">RUC: {EMPRESA.ruc} · Inscrita: {EMPRESA.constitucion}</p>
              </div>
            </div>

            {/* CTA */}
            <a href={waUrl} target="_blank" rel="noopener"
               className="flex items-center justify-center gap-3 bg-[#ff5500] text-white py-4 font-bold text-lg rounded-xl hover:bg-[#e64d00] transition-colors w-full">
              <MessageCircle className="w-5 h-5" />
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
