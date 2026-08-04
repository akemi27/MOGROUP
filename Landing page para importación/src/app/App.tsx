import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronRight, Zap, Shield, Truck, Star, Phone, Mail, MapPin, ArrowRight, Battery, Wrench } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/image.png";

const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Productos", href: "#productos" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Contacto", href: "#contacto" },
];

const PRODUCTS = [
  {
    category: "Motos Eléctricas",
    items: [
      { name: "E-Rider Pro 3000", price: "S/ 8,500", spec: "Autonomía 120 km · Motor 3000W", img: "photo-1558618666-fcd25c85cd64", tag: "MÁS VENDIDA" },
      { name: "VoltMoto Urban", price: "S/ 6,200", spec: "Autonomía 90 km · Carga rápida", img: "photo-1593078165899-c7d2ac0d6aea", tag: "NUEVA" },
      { name: "EcoRider 1500", price: "S/ 4,800", spec: "Autonomía 70 km · Motor 1500W", img: "photo-1568772585407-9f217a3f7d1f", tag: "" },
    ],
  },
  {
    category: "Motocross",
    items: [
      { name: "CrossX Enduro 250", price: "S/ 12,900", spec: "Motor 250cc · 4 tiempos · Off-road", img: "photo-1449426468159-d96dbf08f19f", tag: "TOP" },
      { name: "MX Ranger 150", price: "S/ 7,800", spec: "Motor 150cc · Suspensión sport", img: "photo-1558981285-6f0c9b8a6e1b", tag: "" },
      { name: "CrossX Junior 110", price: "S/ 5,400", spec: "Motor 110cc · Ideal iniciantes", img: "photo-1558981806-ec527fa84c39", tag: "OFERTA" },
    ],
  },
  {
    category: "Bicimotos",
    items: [
      { name: "Bicimoto BT Pro", price: "S/ 3,200", spec: "Con Bluetooth · Bocina integrada", img: "photo-1596461404969-9ae70f2830c1", tag: "CON BLUETOOTH" },
      { name: "Bicimoto Classic 50", price: "S/ 2,400", spec: "Motor 50cc · Bajo consumo", img: "photo-1571068316344-75bc76f77890", tag: "" },
      { name: "Bicimoto Cargo", price: "S/ 2,900", spec: "Canasta trasera · Motor 70cc", img: "photo-1449426468159-d96dbf08f19f", tag: "" },
    ],
  },
];

const FEATURES = [
  { icon: <Shield className="w-8 h-8" />, title: "Garantía de Fábrica", desc: "Todos los vehículos cuentan con garantía de fábrica y emitimos boletas y facturas electrónicas con respaldo legal ante SUNAT." },
  { icon: <Truck className="w-8 h-8" />, title: "Envío a Todo el Perú", desc: "Despachamos a cualquier región del país mediante agencias de transporte de confianza. Coordinación rápida y segura." },
  { icon: <Zap className="w-8 h-8" />, title: "Importación Directa", desc: "Importamos directamente desde USA y China. Sin intermediarios — mejores precios y acceso a modelos exclusivos para el mercado peruano." },
  { icon: <Wrench className="w-8 h-8" />, title: "Cadena Ágil y Confiable", desc: "Nuestra misión es una cadena de suministro transparente. Desde la orden hasta la entrega, te mantenemos informado en cada paso." },
];

const TESTIMONIALS = [
  { name: "Carlos Llontop", city: "Chiclayo", stars: 5, text: "Compré una moto eléctrica para mis entregas y cambió todo. Cero gasto en combustible. El proceso fue rápido y me dieron factura al instante." },
  { name: "Rosa Huamán", city: "Trujillo", stars: 5, text: "La bicimoto con Bluetooth llegó en perfectas condiciones hasta Trujillo. Muy buena atención y el precio no lo encontré en ningún otro lado." },
  { name: "Miguel Ángel Díaz", city: "Lima", stars: 5, text: "Pedí una motocross CrossX para mi hijo. Llegó embalada, con garantía y el trámite fue sencillo. Recomiendo MO GROUP al 100%." },
  { name: "Lucía Fernández", city: "Piura", stars: 5, text: "Empresa nueva pero muy seria. Me contactaron al momento, resolvieron mis dudas y el envío llegó antes de lo prometido. Volvería a comprar." },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#ff5500] text-[#ff5500]" />
      ))}
    </div>
  );
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = Math.ceil(target / 60);
          const iv = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(iv); }
            else setCount(start);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString("es-PE")}{suffix}</span>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-[Barlow,sans-serif] overflow-x-hidden">

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/96 backdrop-blur-md border-b border-[#ff5500]/20" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <a href="#inicio" className="flex items-center">
            <ImageWithFallback
              src={logoImg}
              alt="MO GROUP IMPORT S.A.C. — Importaciones de USA y China"
              className="h-10 w-auto object-contain"
            />
          </a>

          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm font-['Barlow_Condensed',sans-serif] font-600 tracking-widest uppercase text-[#f5f0ea]/70 hover:text-[#ff5500] transition-colors duration-200">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <a href="#contacto" className="hidden md:flex items-center gap-2 bg-[#ff5500] text-white px-5 py-2 text-sm font-['Barlow_Condensed',sans-serif] font-700 tracking-widest uppercase hover:bg-[#e64d00] transition-colors duration-200">
            Cotizar Ahora
          </a>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-1">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-t border-[#ff5500]/20 px-6 py-6 flex flex-col gap-5">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                className="font-['Barlow_Condensed',sans-serif] font-700 tracking-widest uppercase text-[#f5f0ea]/80 hover:text-[#ff5500] transition-colors text-lg">
                {l.label}
              </a>
            ))}
            <a href="#contacto" onClick={() => setMenuOpen(false)}
              className="bg-[#ff5500] text-white px-5 py-3 text-center font-['Barlow_Condensed',sans-serif] font-700 tracking-widest uppercase mt-2">
              Cotizar Ahora
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&auto=format"
            alt="Moto eléctrica de alta gama"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/88 to-[#0a0a0a]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff5500]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#ff5500]/40 px-3 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse" />
              <span className="font-['JetBrains_Mono',monospace] text-xs tracking-widest text-[#ff5500] uppercase">Importación Directa · USA y China · RUC 20614282518</span>
            </div>

            <h1 className="font-['Barlow_Condensed',sans-serif] font-900 text-[clamp(3rem,8vw,6.5rem)] leading-none tracking-tight uppercase text-white mb-6">
              Vehículos de<br />
              <span className="text-[#ff5500]">Importación</span><br />
              Para el Perú
            </h1>

            <p className="text-[#f5f0ea]/70 text-lg leading-relaxed max-w-md mb-8 font-['Barlow',sans-serif]">
              Motos eléctricas, motocross y bicimotos importados directamente desde USA y China. Precios competitivos, garantía de fábrica y envío a todo el país desde Chiclayo.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#productos" className="flex items-center gap-2 bg-[#ff5500] text-white px-7 py-4 font-['Barlow_Condensed',sans-serif] font-700 text-lg tracking-widest uppercase hover:bg-[#e64d00] transition-colors group">
                Ver Catálogo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#contacto" className="flex items-center gap-2 border border-[#f5f0ea]/30 text-[#f5f0ea] px-7 py-4 font-['Barlow_Condensed',sans-serif] font-700 text-lg tracking-widest uppercase hover:border-[#ff5500] hover:text-[#ff5500] transition-colors">
                WhatsApp
              </a>
            </div>

            {/* Logo display in hero */}
            <div className="mt-12 flex items-center gap-4">
              <div className="w-px h-10 bg-[#ff5500]/40" />
              <ImageWithFallback
                src={logoImg}
                alt="MO GROUP IMPORT S.A.C."
                className="h-12 w-auto object-contain opacity-80"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="hidden lg:grid grid-cols-2 gap-px bg-[#ff5500]/15">
            {[
              { label: "Clientes Atendidos", val: 320, suffix: "+" },
              { label: "Unidades Importadas", val: 850, suffix: "+" },
              { label: "Regiones con Cobertura", val: 18, suffix: "" },
              { label: "Meses en Operación", val: 1, suffix: " año" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0a] p-8 flex flex-col justify-end gap-2">
                <span className="font-['Barlow_Condensed',sans-serif] font-900 text-[clamp(2.5rem,4vw,3.5rem)] leading-none text-[#ff5500]">
                  <CountUp target={s.val} suffix={s.suffix} />
                </span>
                <span className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/50">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#f5f0ea]/30 animate-bounce">
          <span className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 bg-[#ff5500]/40" />
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="productos" className="py-28 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#ff5500] block mb-3">— Catálogo de Importación</span>
              <h2 className="font-['Barlow_Condensed',sans-serif] font-900 text-[clamp(2.5rem,5vw,4rem)] leading-none uppercase text-white">
                Nuestros<br /><span className="text-[#ff5500]">Vehículos</span>
              </h2>
            </div>
            <div className="flex gap-0 flex-wrap">
              {PRODUCTS.map((cat, i) => (
                <button key={cat.category} onClick={() => setActiveCategory(i)}
                  className={`px-5 py-3 font-['Barlow_Condensed',sans-serif] font-700 text-sm tracking-widest uppercase transition-all duration-200 border-b-2 ${activeCategory === i ? "text-[#ff5500] border-[#ff5500] bg-[#ff5500]/5" : "text-[#f5f0ea]/40 border-transparent hover:text-[#f5f0ea]/70"}`}>
                  {cat.category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-[#ff5500]/10">
            {PRODUCTS[activeCategory].items.map((item) => (
              <div key={item.name} className="bg-[#111111] group flex flex-col overflow-hidden">
                <div className="relative overflow-hidden aspect-[4/3] bg-[#1a1a1a]">
                  <img
                    src={`https://images.unsplash.com/${item.img}?w=600&h=450&fit=crop&auto=format`}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  {item.tag && (
                    <div className="absolute top-4 left-0 bg-[#ff5500] px-3 py-1">
                      <span className="font-['JetBrains_Mono',monospace] text-xs font-500 tracking-widest text-white">{item.tag}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h3 className="font-['Barlow_Condensed',sans-serif] font-800 text-2xl uppercase text-white leading-tight">{item.name}</h3>
                  <p className="font-['JetBrains_Mono',monospace] text-xs tracking-wide text-[#f5f0ea]/50">{item.spec}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#ff5500]/15">
                    <span className="font-['Barlow_Condensed',sans-serif] font-900 text-2xl text-[#ff5500]">{item.price}</span>
                    <a href="#contacto" className="flex items-center gap-1.5 text-sm font-['Barlow_Condensed',sans-serif] font-700 tracking-widest uppercase text-[#f5f0ea]/60 hover:text-[#ff5500] transition-colors group/btn">
                      Cotizar <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 font-['JetBrains_Mono',monospace] text-xs tracking-widest text-[#f5f0ea]/30 text-center uppercase">
            Precios referenciales · Incluye IGV · Sujetos a disponibilidad de stock
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section id="nosotros" className="py-28 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#ff5500] block mb-3">— Quiénes Somos</span>
              <h2 className="font-['Barlow_Condensed',sans-serif] font-900 text-[clamp(2.5rem,5vw,4rem)] leading-none uppercase text-white mb-6">
                Importación<br /><span className="text-[#ff5500]">Con Respaldo</span>
              </h2>
              <p className="text-[#f5f0ea]/65 text-lg leading-relaxed font-['Barlow',sans-serif] mb-6">
                MO GROUP IMPORT S.A.C. es una empresa peruana registrada ante SUNAT (RUC 20614282518), dedicada a la importación y comercialización de vehículos menores de alta calidad desde USA y China.
              </p>
              <p className="text-[#f5f0ea]/55 text-base leading-relaxed font-['Barlow',sans-serif] mb-8">
                Nuestra misión es proveer al mercado peruano productos de importación con precios competitivos y un servicio de excelencia, mediante una cadena de suministro ágil, transparente y confiable.
              </p>

              <div className="flex flex-wrap gap-6">
                {[
                  { label: "RUC", val: "20614282518" },
                  { label: "Constitución", val: "29 may 2025" },
                  { label: "Sede", val: "Chiclayo, Perú" },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/35 mb-0.5">{d.label}</p>
                    <p className="font-['Barlow_Condensed',sans-serif] font-700 text-base uppercase text-[#ff5500]">{d.val}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 relative aspect-[16/9] overflow-hidden bg-[#1a1a1a]">
                <img
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=700&h=394&fit=crop&auto=format"
                  alt="Motos importadas en almacén"
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="font-['Barlow_Condensed',sans-serif] font-700 text-2xl text-white uppercase">Chiclayo, Lambayeque</span>
                  <br />
                  <span className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#ff5500]">Alfredo Lapoint 1149 · Sede Principal</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#ff5500]/10">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-[#0a0a0a] p-8 flex flex-col gap-4 hover:bg-[#ff5500]/5 transition-colors duration-300">
                  <div className="text-[#ff5500]">{f.icon}</div>
                  <h3 className="font-['Barlow_Condensed',sans-serif] font-800 text-xl uppercase text-white">{f.title}</h3>
                  <p className="text-[#f5f0ea]/55 text-sm leading-relaxed font-['Barlow',sans-serif]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA ORANGE BREAK */}
      <section className="bg-[#ff5500] py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-['Barlow_Condensed',sans-serif] font-900 text-[clamp(2rem,4vw,3.5rem)] leading-none uppercase text-white">
              ¿Listo para importar tu vehículo?
            </h2>
            <p className="text-white/70 font-['Barlow',sans-serif] text-base mt-2">Escríbenos por WhatsApp y te cotizamos en minutos.</p>
          </div>
          <a href="https://wa.me/51965130970" target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-3 bg-[#0a0a0a] text-white px-8 py-5 font-['Barlow_Condensed',sans-serif] font-700 text-lg tracking-widest uppercase hover:bg-[#1a1a1a] transition-colors group">
            Escribir por WhatsApp
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonios" className="py-28 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14">
            <span className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#ff5500] block mb-3">— Clientes Satisfechos</span>
            <h2 className="font-['Barlow_Condensed',sans-serif] font-900 text-[clamp(2.5rem,5vw,4rem)] leading-none uppercase text-white">
              Lo Que Dicen<br /><span className="text-[#ff5500]">Nuestros Clientes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#ff5500]/10">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#111111] p-7 flex flex-col gap-4 hover:bg-[#ff5500]/5 transition-colors duration-300">
                <StarRating count={t.stars} />
                <p className="text-[#f5f0ea]/70 text-sm leading-relaxed font-['Barlow',sans-serif] flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="border-t border-[#ff5500]/15 pt-4">
                  <p className="font-['Barlow_Condensed',sans-serif] font-700 text-base uppercase text-white">{t.name}</p>
                  <p className="font-['JetBrains_Mono',monospace] text-xs tracking-widest text-[#ff5500]">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacto" className="py-28 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
          <div>
            <span className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#ff5500] block mb-3">— Contáctanos</span>
            <h2 className="font-['Barlow_Condensed',sans-serif] font-900 text-[clamp(2.5rem,5vw,4rem)] leading-none uppercase text-white mb-6">
              Solicita Tu<br /><span className="text-[#ff5500]">Cotización</span>
            </h2>
            <p className="text-[#f5f0ea]/60 text-lg leading-relaxed font-['Barlow',sans-serif] mb-10">
              Cuéntanos qué vehículo te interesa y te respondemos de inmediato. Emitimos boletas y facturas electrónicas. Sin costos ocultos.
            </p>

            <div className="flex flex-col gap-5 mb-10">
              {[
                { icon: <Phone className="w-5 h-5" />, label: "WhatsApp / Llamadas", val: "965 130 970" },
                { icon: <Mail className="w-5 h-5" />, label: "Correo Electrónico", val: "importacionesmo10@gmail.com" },
                { icon: <MapPin className="w-5 h-5" />, label: "Dirección", val: "Alfredo Lapoint 1149, Chiclayo, Lambayeque" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#ff5500]/15 flex items-center justify-center text-[#ff5500] flex-shrink-0">{c.icon}</div>
                  <div>
                    <p className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/40 mb-0.5">{c.label}</p>
                    <p className="font-['Barlow',sans-serif] font-600 text-[#f5f0ea]">{c.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-[#ff5500]/20 p-6">
              <ImageWithFallback
                src={logoImg}
                alt="MO GROUP IMPORT S.A.C."
                className="h-16 w-auto object-contain mb-4"
              />
              <p className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/40">
                MO GROUP IMPORT S.A.C.<br />
                RUC: 20614282518 · S.A.C. Privada<br />
                Inscrita: 29 de mayo de 2025
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/50">Nombre</label>
                <input type="text" placeholder="Tu nombre completo"
                  className="bg-[#0a0a0a] border border-[#ff5500]/20 text-[#f5f0ea] px-4 py-3 text-sm font-['Barlow',sans-serif] placeholder-[#f5f0ea]/20 focus:outline-none focus:border-[#ff5500] transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/50">Teléfono</label>
                <input type="tel" placeholder="985 000 000"
                  className="bg-[#0a0a0a] border border-[#ff5500]/20 text-[#f5f0ea] px-4 py-3 text-sm font-['Barlow',sans-serif] placeholder-[#f5f0ea]/20 focus:outline-none focus:border-[#ff5500] transition-colors" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/50">Correo Electrónico</label>
              <input type="email" placeholder="tucorreo@gmail.com"
                className="bg-[#0a0a0a] border border-[#ff5500]/20 text-[#f5f0ea] px-4 py-3 text-sm font-['Barlow',sans-serif] placeholder-[#f5f0ea]/20 focus:outline-none focus:border-[#ff5500] transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/50">Ciudad / Región</label>
              <input type="text" placeholder="Ej: Chiclayo, Lima, Trujillo..."
                className="bg-[#0a0a0a] border border-[#ff5500]/20 text-[#f5f0ea] px-4 py-3 text-sm font-['Barlow',sans-serif] placeholder-[#f5f0ea]/20 focus:outline-none focus:border-[#ff5500] transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/50">Tipo de Vehículo</label>
              <select className="bg-[#0a0a0a] border border-[#ff5500]/20 text-[#f5f0ea] px-4 py-3 text-sm font-['Barlow',sans-serif] focus:outline-none focus:border-[#ff5500] transition-colors appearance-none">
                <option value="">Selecciona una categoría</option>
                <option>Moto Eléctrica</option>
                <option>Motocross</option>
                <option>Bicimoto con Bluetooth</option>
                <option>Bicimoto Clásica</option>
                <option>Otro / Consulta general</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/50">Mensaje</label>
              <textarea rows={4} placeholder="Cuéntanos qué modelo te interesa, cantidad, si necesitas factura o boleta..."
                className="bg-[#0a0a0a] border border-[#ff5500]/20 text-[#f5f0ea] px-4 py-3 text-sm font-['Barlow',sans-serif] placeholder-[#f5f0ea]/20 focus:outline-none focus:border-[#ff5500] transition-colors resize-none" />
            </div>
            <button type="submit"
              className="mt-2 bg-[#ff5500] text-white py-4 px-8 font-['Barlow_Condensed',sans-serif] font-700 text-lg tracking-widest uppercase hover:bg-[#e64d00] transition-colors flex items-center justify-center gap-2 group">
              Enviar Cotización
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="font-['JetBrains_Mono',monospace] text-xs tracking-widest text-[#f5f0ea]/25 text-center uppercase">
              También puedes escribirnos directamente al 965 130 970
            </p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0a] border-t border-[#ff5500]/15 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <ImageWithFallback
            src={logoImg}
            alt="MO GROUP IMPORT S.A.C."
            className="h-10 w-auto object-contain opacity-70"
          />
          <p className="font-['JetBrains_Mono',monospace] text-xs tracking-widest text-[#f5f0ea]/25 uppercase text-center">
            © 2025 MO GROUP IMPORT S.A.C. · RUC 20614282518<br className="sm:hidden" />
            {" "}· Alfredo Lapoint 1149, Chiclayo, Lambayeque, Perú
          </p>
          <div className="flex items-center gap-6">
            {["Garantías", "Envíos", "Devoluciones"].map((l) => (
              <a key={l} href="#" className="font-['JetBrains_Mono',monospace] text-xs tracking-widest uppercase text-[#f5f0ea]/25 hover:text-[#ff5500] transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
