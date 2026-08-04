import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, ShoppingCart, MessageCircle } from 'lucide-react';
import { WHATSAPP, WHATSAPP_MSG_PRODUCTO, WHATSAPP_MSG_GENERAL, API_BASE } from '../config';

const fmt = (v) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(v);

const PRODUCTOS_DEMO = [
  { id: 'd1', nombre: 'Moto Eléctrica Sport 3000W', categoria: 'Vehículos', precio_ref: 6500, disponibles: 3, img: '/prod-moto-sport.png', sub: 'Motor 3000W · 80 km/h' },
  { id: 'd2', nombre: 'Moto Eléctrica City 2000W', categoria: 'Vehículos', precio_ref: 4200, disponibles: 5, img: '/prod-moto-naked.png', sub: 'Motor 2000W · 55 km/h' },
  { id: 'd3', nombre: 'Moto Cross Eléctrica', categoria: 'Vehículos', precio_ref: 2800, disponibles: 8, img: '/prod-moto-dirt.png', sub: 'Motor 800W · Todo terreno' },
  { id: 'd4', nombre: 'Moto Deportiva Pro', categoria: 'Vehículos', precio_ref: 3500, disponibles: 2, img: '/prod-moto-detail.png', sub: 'Alta gama · Importada' },
  { id: 'd5', nombre: 'iPhone 15 Pro Max 256GB', categoria: 'iPhones', precio_ref: 5200, disponibles: 4, img: '/prod-iphone-pro.png', sub: 'Chip A17 Pro · 48 MP' },
  { id: 'd6', nombre: 'iPhone 15 128GB', categoria: 'iPhones', precio_ref: 3400, disponibles: 6, img: '/prod-phones.png', sub: 'Chip A16 · 6.1" OLED' },
  { id: 'd7', nombre: 'iPhone 14 128GB', categoria: 'iPhones', precio_ref: 2600, disponibles: 3, img: '/prod-iphone-pro.png', sub: 'Chip A15 · 6.1" OLED' },
  { id: 'd8', nombre: 'iPhone SE 64GB', categoria: 'iPhones', precio_ref: 1800, disponibles: 0, img: '/prod-phones-dark.png', sub: 'Chip A15 · Touch ID' },
  { id: 'd9', nombre: 'MacBook Air M2 256GB', categoria: 'MacBooks', precio_ref: 4800, disponibles: 2, img: '/prod-laptop.png', sub: 'Apple M2 · 8 GB RAM' },
  { id: 'd10', nombre: 'MacBook Pro M3 512GB', categoria: 'MacBooks', precio_ref: 7200, disponibles: 1, img: '/prod-laptop.png', sub: 'Apple M3 · 18 GB RAM' },
  { id: 'd11', nombre: 'MacBook Air M1 256GB', categoria: 'MacBooks', precio_ref: 3200, disponibles: 4, img: '/prod-laptop.png', sub: 'Apple M1 · 8 GB RAM' },
  { id: 'd12', nombre: 'MacBook Pro M2 Pro 512GB', categoria: 'MacBooks', precio_ref: 8500, disponibles: 0, img: '/prod-laptop.png', sub: 'Apple M2 Pro · 16 GB' },
  { id: 'd13', nombre: 'Cable USB-C a Lightning 1m', categoria: 'Accesorios', precio_ref: 85, disponibles: 20, img: '/prod-phones.png', sub: 'Nylon trenzado · Carga rápida' },
  { id: 'd14', nombre: 'Cargador MagSafe 20W', categoria: 'Accesorios', precio_ref: 180, disponibles: 12, img: '/prod-phones-dark.png', sub: 'Inalámbrico · iPhone 12+' },
  { id: 'd15', nombre: 'AirPods Pro 2da Gen', categoria: 'Accesorios', precio_ref: 950, disponibles: 3, img: '/prod-iphone-pro.png', sub: 'Chip H2 · ANC' },
  { id: 'd16', nombre: 'Funda Silicona iPhone 15', categoria: 'Accesorios', precio_ref: 120, disponibles: 15, img: '/prod-phones.png', sub: 'Silicona líquida · MagSafe' },
];

function ProductCard({ p }) {
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG_PRODUCTO(p.nombre))}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-52 bg-white overflow-hidden">
        <img src={p.img} alt={p.nombre}
             className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" />
        {p.disponibles > 0 && (
          <span className="absolute top-3 left-3 bg-[#ff5500] text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
            Disponible
          </span>
        )}
        {p.disponibles === 0 && (
          <span className="absolute top-3 left-3 bg-slate-600 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
            Por encargo
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-slate-800 leading-snug mb-0.5">{p.nombre}</h3>
        <p className="text-xs text-slate-400 mb-3">{p.sub}</p>

        <div className="mt-auto flex items-end justify-between">
          <p className="font-bold text-xl text-[#ff5500]">{fmt(p.precio_ref)}</p>
          <a href={waUrl} target="_blank" rel="noopener"
             className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#ff5500] hover:text-white transition-colors">
            <ShoppingCart className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catActiva, setCatActiva] = useState('Todos');

  useEffect(() => {
    fetch(`${API_BASE}/api/publico/catalogo`)
      .then(r => r.json())
      .then(data => { setProductos(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allProducts = productos.length > 0
    ? productos.map(p => ({ ...p, sub: p.specs?.map(s => s.v).join(' · ') || '', img: p.img || '/cable-usb.jpg' }))
    : PRODUCTOS_DEMO;
  const categorias = ['Todos', ...new Set(allProducts.map(p => p.categoria).filter(Boolean))];
  const filtrados = catActiva !== 'Todos'
    ? allProducts.filter(p => p.categoria === catActiva)
    : allProducts;

  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG_GENERAL)}`;

  return (
    <section id="productos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <h2 data-reveal className="text-2xl md:text-3xl font-bold text-slate-800">
            Productos <em className="text-[#ff5500] not-italic" style={{ fontStyle: 'italic' }}>destacados</em>
          </h2>
          <div className="flex items-center gap-3">
            <a href={waUrl} target="_blank" rel="noopener"
               className="hidden md:flex items-center gap-2 text-sm font-bold text-white bg-[#25d366] px-5 py-2 rounded-full hover:bg-[#1fb855] transition-colors">
              <MessageCircle className="w-4 h-4" />
              Catálogo WhatsApp
            </a>
            <div className="flex gap-1.5">
              <button onClick={() => scroll('left')}
                      className="w-9 h-9 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-500 hover:text-[#ff5500] hover:border-[#ff5500] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scroll('right')}
                      className="w-9 h-9 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-500 hover:text-[#ff5500] hover:border-[#ff5500] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categorias.map(cat => (
            <button key={cat} onClick={() => setCatActiva(cat)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                      catActiva === cat
                        ? 'text-white bg-[#ff5500]'
                        : 'text-slate-500 bg-white border border-slate-200 hover:border-[#ff5500] hover:text-[#ff5500]'
                    }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div ref={scrollRef}
             className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
             style={{ scrollbarWidth: 'none' }}>
          {filtrados.map(p => (
            <div key={p.id} className="snap-start shrink-0 w-[260px]">
              <ProductCard p={p} />
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Precios referenciales · Incluye IGV · Sujetos a disponibilidad
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Métodos de pago:</span>
            <div className="flex items-center gap-2">
              {/* Yape */}
              <div className="bg-[#f5f5f5] rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <img src="/yape-logo.png" alt="Yape" className="h-5 w-auto" />
              </div>
              {/* Plin */}
              <div className="bg-[#f5f5f5] rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <img src="/plin-logo.png" alt="Plin" className="h-5 w-auto" />
              </div>
              {/* BCP */}
              <div className="bg-[#f5f5f5] rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.8582 14.427C18.4013 18.351 11.699 22.8238 9.79985 23.4946C6.10638 25.04 3.60596 22.1739 3.39248 21.8733C2.70343 20.9859 2.53606 20.7984 2.20259 20.151C2.13754 20.2584 9.2927 16.9299 11.8563 12.6238C14.6327 8.92531 14.8746 1.67036 11.8424 0.306152C12.7594 0.767837 14.9201 2.00826 16.8697 3.74573C18.815 5.39478 20.4963 7.55731 20.4603 7.52952C20.6655 7.80805 23.1022 10.8409 20.8582 14.427Z" fill="#FF7800"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M13.0396 10.492C14.6192 6.64315 14.3627 1.43957 11.8427 0.305884C9.53559 -0.776643 6.91264 2.30546 6.79011 2.46525C6.79011 2.46525 5.92422 3.52188 5.26611 5.00104C5.71769 5.24736 6.58232 5.6762 6.58232 5.6762C8.35706 6.52757 10.7608 8.02125 13.0396 10.492Z" fill="#002A8D"/>
                </svg>
                <span className="text-[10px] font-bold text-[#002A8D]">BCP</span>
              </div>
              {/* BBVA */}
              <div className="bg-[#f5f5f5] rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <svg viewBox="0 0 600 179.8" className="h-4 w-auto">
                  <path fill="#004481" d="M432.2,24.4l-51.6,98.2c-1.1,2.1-4.3,2.1-5.4,0l-51.6-98.2c-0.5-1-1.5-1.6-2.6-1.6h-25c-1.7,0-2.8,1.8-2,3.3l81.3,152.2c1.1,2.1,4.1,2.1,5.3,0l81.3-152.2c0.8-1.5-0.3-3.3-2-3.3h-25C433.7,22.8,432.7,23.4,432.2,24.4z"/>
                  <path fill="#004481" d="M461.5,155.5l51.6-98.2c1.1-2.1,4.3-2.1,5.4,0l51.6,98.2c0.5,1,1.5,1.6,2.6,1.6h25c1.7,0,2.8-1.8,2-3.3L518.4,1.6c-1.1-2.1-4.1-2.1-5.3,0l-81.3,152.2c-0.8,1.5,0.3,3.3,2,3.3h25C459.9,157,461,156.4,461.5,155.5z"/>
                  <path fill="#004481" d="M108.8,95.2c10.8-5.4,17.5-17.1,17.5-31.4c0-24.5-19.1-41.1-46-41.1H3c-1.7,0-3,1.3-3,3v151.1c0,1.7,1.3,3,3,3h74c37,0,56.5-15.9,56.5-47.1C133.5,102.3,108.8,95.2,108.8,95.2zM29,45.5h45.9c16.9,0,25.5,7.2,25.5,20.6c0,13.4-8.6,20.6-25.5,20.6H29c-1.6,0-3-1.3-3-3V48.5C26,46.8,27.3,45.5,29,45.5zM75.5,157l-46.5,0c-1.7,0-3-1.3-3-3l0-41.7c0-1.6,1.3-3,3-3h46.5c22.2,0,32.1,6.3,32.1,23.8C107.5,150.8,97.9,157,75.5,157z"/>
                  <path fill="#004481" d="M267.5,95.2c10.8-5.4,17.5-17.1,17.5-31.4c0-24.5-19.1-41.1-46-41.1h-77.4c-1.7,0-3,1.3-3,3v151.1c0,1.7,1.3,3,3,3h74c37,0,56.5-15.9,56.5-47.1C292.2,102.3,267.5,95.2,267.5,95.2zM187.7,45.5h45.9c16.9,0,25.5,7.2,25.5,20.6c0,13.4-8.6,20.6-25.5,20.6h-45.9c-1.7,0-3-1.3-3-3V48.5C184.7,46.8,186,45.5,187.7,45.5zM234.1,157l-46.5,0c-1.6,0-3-1.3-3-3v-41.7c0-1.6,1.3-3,3-3h46.5c22.2,0,32.1,6.3,32.1,23.8C266.2,150.8,256.5,157,234.1,157z"/>
                </svg>
              </div>
              {/* Efectivo */}
              <div className="bg-[#f5f5f5] rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-[9px]">$</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">Efectivo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
