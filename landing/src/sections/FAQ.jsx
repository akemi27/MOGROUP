'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  { q: '¿Cómo funciona la importación directa?', a: 'Trabajamos directamente con fábricas y distribuidores en China y USA. Tú eliges el producto, nosotros nos encargamos del envío, aduanas y entrega hasta tu puerta.' },
  { q: '¿Los productos tienen garantía?', a: 'Sí, todos nuestros productos incluyen garantía del fabricante. Emitimos boletas y facturas electrónicas con respaldo ante SUNAT.' },
  { q: '¿Cuánto tarda en llegar mi pedido?', a: 'Los productos en stock se despachan en 1-3 días hábiles. Para importaciones bajo pedido, el tiempo estimado es de 15-30 días dependiendo del origen.' },
  { q: '¿Hacen envíos a todo el Perú?', a: 'Sí, despachamos a cualquier región del país mediante agencias de transporte de confianza. El costo de envío varía según destino.' },
  { q: '¿Puedo importar un producto específico?', a: 'Por supuesto. Si no lo tenemos en catálogo, podemos traerlo bajo pedido. Contáctanos por WhatsApp y te cotizamos.' },
  { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos transferencias bancarias, Yape, Plin y efectivo. Para montos mayores ofrecemos facilidades de pago.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200">
      <button onClick={() => setOpen(v => !v)}
              className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className={`font-bold text-sm uppercase tracking-wide ${open ? 'text-[#ff5500]' : 'text-slate-700'}`}>
          {q}
        </span>
        {open
          ? <Minus className="w-5 h-5 text-[#ff5500] shrink-0" />
          : <Plus className="w-5 h-5 text-slate-400 shrink-0" />
        }
      </button>
      {open && (
        <p className="text-slate-500 text-sm leading-relaxed pb-5">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  const half = Math.ceil(FAQS.length / 2);

  return (
    <section className="py-20 bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <h2 data-reveal className="font-bold text-slate-800 text-2xl md:text-3xl uppercase">
            Preguntas frecuentes
          </h2>
          <p className="text-slate-400 text-sm max-w-xs md:text-right">
            ¿Listo para dar el siguiente paso? Resolvemos tus dudas.
          </p>
        </div>

        {/* Two columns */}
        <div data-reveal className="grid md:grid-cols-2 gap-x-12">
          <div>
            {FAQS.slice(0, half).map(f => <FAQItem key={f.q} {...f} />)}
          </div>
          <div>
            {FAQS.slice(half).map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
