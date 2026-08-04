const ITEMS = [
  'PRODUCTOS', 'TECNOLOGÍA', 'iPHONE', 'MAC', 'DRONES',
  'IMPORTACIÓN DIRECTA', 'USA & CHINA', 'CHICLAYO', 'GARANTÍA REAL',
  'TODO EL PERÚ', 'CALIDAD', 'POTENCIA',
];

const DOUBLE = [...ITEMS, ...ITEMS];

export default function Ticker() {
  return (
    <div className="overflow-hidden bg-[#0a0a0a]"
         style={{ borderTop: '1px solid rgba(255,85,0,0.15)', borderBottom: '1px solid rgba(255,85,0,0.15)' }}>
      <div className="animate-marquee inline-flex py-3.5 whitespace-nowrap">
        {DOUBLE.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 mx-5 font-mono-jb text-[10px] font-medium tracking-[0.22em] uppercase text-white/30 whitespace-nowrap select-none">
            <span className="w-1.5 h-1.5 bg-[#ff5500] shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
