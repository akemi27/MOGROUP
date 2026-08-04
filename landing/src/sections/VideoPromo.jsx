import { useEffect } from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { EMPRESA } from '../config';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.54V6.78a4.85 4.85 0 01-1.07-.09z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const REDES = [
  { key: 'instagram', Icon: Instagram,   handle: '@mogroup_import',  desc: 'Productos nuevos' },
  { key: 'tiktok',    Icon: TikTokIcon,  handle: '@importacionesmo', desc: 'Videos en acción' },
  { key: 'facebook',  Icon: FacebookIcon, handle: 'Mo Group',        desc: 'Precios y ofertas' },
];

const INSTAGRAM_POST = 'https://www.instagram.com/p/DObun_Akalw/';

const TIKTOK_POSTS = [
  { handle: '@importacionesmo', videoId: '7579004363411148049', label: 'Mo Importaciones' },
  { handle: '@fernandaimportaciones', videoId: '7649876762796543250', label: 'Fernanda Importaciones' },
];

export default function VideoPromo() {
  useEffect(() => {
    const loadIG = () => {
      if (window.instgrm) window.instgrm.Embeds.process();
      else {
        const s = document.createElement('script');
        s.src = 'https://www.instagram.com/embed.js';
        s.async = true;
        document.body.appendChild(s);
      }
    };

    const loadTT = () => {
      if (!document.getElementById('tiktok-embed-script')) {
        const s = document.createElement('script');
        s.id = 'tiktok-embed-script';
        s.src = 'https://www.tiktok.com/embed.js';
        s.async = true;
        document.body.appendChild(s);
      }
    };

    const t1 = setTimeout(loadIG, 200);
    const t2 = setTimeout(loadTT, 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const redes = REDES.filter(r => EMPRESA.redes[r.key]);

  return (
    <section id="redes" className="py-20 bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 data-reveal className="font-bold text-slate-800 text-2xl md:text-3xl mb-1">
              Síguenos en <em className="text-[#ff5500] not-italic" style={{ fontStyle: 'italic' }}>redes</em>
            </h2>
            <p className="text-slate-400 text-sm">
              Contenido real, clientes reales. Chiclayo hacia todo el Perú.
            </p>
          </div>
          {EMPRESA.redes.linktree && (
            <a href={EMPRESA.redes.linktree} target="_blank" rel="noopener"
               className="flex items-center gap-2 bg-[#ff5500] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#e64d00] transition-colors">
              Ver todos los links
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Embeds grid — IG + 2 TikToks */}
        <div data-reveal className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {/* Instagram */}
          <div className="rounded-2xl overflow-hidden bg-white border border-slate-100">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={INSTAGRAM_POST}
              data-instgrm-version="14"
              style={{ background: 'transparent', border: 0, margin: 0, maxWidth: '100%', minWidth: '250px', width: '100%' }}
            />
          </div>

          {/* TikTok embeds */}
          {TIKTOK_POSTS.map(t => (
            <div key={t.videoId} className="rounded-2xl overflow-hidden bg-white border border-slate-100">
              <blockquote className="tiktok-embed"
                cite={`https://www.tiktok.com/${t.handle}/video/${t.videoId}`}
                data-video-id={t.videoId}
                style={{ maxWidth: '100%', minWidth: '250px' }}>
                <section>
                  <a target="_blank" rel="noopener" href={`https://www.tiktok.com/${t.handle}/video/${t.videoId}`}>
                    {t.label}
                  </a>
                </section>
              </blockquote>
            </div>
          ))}
        </div>

        {/* Social links — compact row */}
        <div data-reveal className="flex flex-col sm:flex-row gap-3">
          {redes.map(({ key, Icon, handle, desc }) => (
            <a key={key} href={EMPRESA.redes[key]} target="_blank" rel="noopener"
               className="group flex-1 flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 hover:border-[#ff5500]/30 hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-[#ff5500] group-hover:text-white transition-colors">
                <Icon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-700 truncate">{handle}</p>
                <p className="text-slate-400 text-xs">{desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#ff5500] transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
