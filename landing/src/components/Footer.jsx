import Image from 'next/image';
import { Instagram, Facebook, MapPin, Mail, Phone, ShieldCheck, FileText, Truck } from 'lucide-react';
import { EMPRESA, WHATSAPP, WHATSAPP_MSG_GENERAL } from '../config';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.54V6.78a4.85 4.85 0 01-1.07-.09z"/>
  </svg>
);

const SOCIAL = [
  { key: 'instagram', Icon: Instagram, label: 'Instagram' },
  { key: 'facebook',  Icon: Facebook,  label: 'Facebook' },
  { key: 'tiktok',    Icon: TikTokIcon, label: 'TikTok' },
];

const BADGES = [
  { Icon: ShieldCheck, title: EMPRESA.nombre, sub: 'Importación directa' },
  { Icon: FileText,    title: 'Factura electrónica', sub: 'Boleta y factura SUNAT' },
  { Icon: ShieldCheck, title: 'Garantía oficial', sub: 'En todos los productos' },
  { Icon: Truck,       title: 'Envío nacional', sub: 'A todo el Perú' },
];

const CATEGORIAS = ['Vehículos', 'iPhones', 'MacBooks', 'Accesorios'];

const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#productos', label: 'Productos' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#contacto', label: 'Contacto' },
];

export default function Footer() {
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG_GENERAL)}`;
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0">
        <Image src="/prod-moto-detail.png" alt="" fill sizes="100vw" className="object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-900/80" />
      </div>

      <div className="relative z-10">

        {/* Badges strip */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {BADGES.map(b => (
              <div key={b.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <b.Icon className="w-5 h-5 text-[#ff5500]" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{b.title}</p>
                  <p className="text-white/40 text-[11px]">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main footer */}
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <Image src="/chine.png" alt="" width={100} height={40} className="h-10 w-auto object-contain" style={{ mixBlendMode: 'screen' }} />
            <div>
              <p className="text-white font-bold text-lg">{EMPRESA.nombre}</p>
              <p className="text-white/30 text-xs">{EMPRESA.tagline}</p>
            </div>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

            {/* Oficina */}
            <div>
              <h4 className="text-white/50 font-bold text-xs uppercase tracking-wider mb-4">Oficina Principal</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />
                  {EMPRESA.direccion}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#ff5500] shrink-0" />
                  {EMPRESA.telefono}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#ff5500] shrink-0" />
                  <a href={`mailto:${EMPRESA.email}`} className="hover:text-[#ff5500] transition-colors">{EMPRESA.email}</a>
                </li>
              </ul>
            </div>

            {/* Categorías */}
            <div>
              <h4 className="text-white/50 font-bold text-xs uppercase tracking-wider mb-4">Categorías</h4>
              <ul className="space-y-2">
                {CATEGORIAS.map(c => (
                  <li key={c}>
                    <a href="#productos" className="text-sm text-white/50 hover:text-[#ff5500] transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500]" /> {c}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navegación */}
            <div>
              <h4 className="text-white/50 font-bold text-xs uppercase tracking-wider mb-4">Navegación</h4>
              <ul className="space-y-2">
                {NAV_LINKS.map(l => (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm text-white/50 hover:text-[#ff5500] transition-colors">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Redes */}
            <div>
              <h4 className="text-white/50 font-bold text-xs uppercase tracking-wider mb-4">Redes Sociales</h4>
              <div className="flex gap-2 mb-6">
                {SOCIAL.map(({ key, Icon, label }) => {
                  const url = EMPRESA.redes[key];
                  if (!url) return null;
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener" aria-label={label}
                       className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-[#ff5500] hover:text-white transition-all">
                      <Icon />
                    </a>
                  );
                })}
              </div>
              <a href={waUrl} target="_blank" rel="noopener"
                 className="inline-flex items-center gap-2 bg-[#ff5500] text-white text-xs font-bold uppercase tracking-wide px-5 py-2.5 rounded-full hover:bg-[#e64d00] transition-colors">
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[11px] text-white/20">
              Copyright © {year} — {EMPRESA.razonSocial} · RUC {EMPRESA.ruc}
            </span>
            <span className="text-[11px] text-white/20">
              {EMPRESA.ciudad}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
