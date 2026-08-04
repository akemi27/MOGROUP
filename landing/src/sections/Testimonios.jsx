import { Star } from 'lucide-react';
import { TESTIMONIOS } from '../config';

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function Testimonios() {
  return (
    <section id="testimonios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-12">
          <h2 data-reveal className="font-bold text-slate-800 text-2xl md:text-3xl mb-2">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-slate-400 text-sm">
            Experiencias reales de compradores en todo el Perú
          </p>
        </div>

        <div data-reveal className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIOS.map(t => (
            <div key={t.nombre}
                 className="bg-white rounded-xl p-6 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <StarRating count={t.estrellas} />
              <p className="text-slate-600 text-sm leading-relaxed flex-1">
                &ldquo;{t.texto}&rdquo;
              </p>
              <div className="pt-3 border-t border-slate-100">
                <p className="font-bold text-sm text-slate-700">{t.nombre}</p>
                <p className="text-xs text-slate-400">{t.ciudad}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
