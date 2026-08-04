export const WHATSAPP = '51965130970';
export const WHATSAPP_MSG_GENERAL = 'Hola, me interesa conocer sus productos 😊';
export const WHATSAPP_MSG_PRODUCTO = (nombre) => `Hola, me interesa el producto: *${nombre}*. ¿Está disponible?`;

export const EMPRESA = {
    nombre: 'Mo Importaciones',
    razonSocial: 'MO GROUP IMPORT S.A.C.',
    ruc: '20614282518',
    constitucion: '29 de mayo de 2025',
    tagline: 'Productos importados · USA · China',
    descripcion: 'Importaciones directas de USA y China. Productos de alta calidad y tecnología premium con garantía real. Desde Chiclayo enviamos a todo el Perú.',
    ciudad: 'Chiclayo, Lambayeque',
    direccion: 'Alfredo Lapoint 1149, Chiclayo, Lambayeque',
    telefono: '965 130 970',
    email: 'importacionesmo10@gmail.com',
    redes: {
        facebook: 'https://www.facebook.com/profile.php?id=61577169946691',
        instagram: 'https://www.instagram.com/mogroup_import/',
        tiktok: 'https://www.tiktok.com/@importacionesmo',
        linktree: 'https://linktr.ee/moimportaciones',
    }
};

export const STATS = [
    { valor: '+200', label: 'Clientes satisfechos' },
    { valor: '+50', label: 'Productos disponibles' },
    { valor: 'Todo el Perú', label: 'Cobertura de envío' },
    { valor: '100%', label: 'Productos originales' },
];

export const BENEFICIOS = [
    { icon: 'ShieldCheck', titulo: 'Garantía del fabricante', desc: 'Todos nuestros productos incluyen garantía oficial. Emitimos boletas y facturas electrónicas con respaldo ante SUNAT.' },
    { icon: 'Truck', titulo: 'Envío a todo el Perú', desc: 'Despachamos a cualquier región del país mediante agencias de transporte de confianza.' },
    { icon: 'Zap', titulo: 'Importación directa', desc: 'Sin intermediarios — mejores precios y acceso a modelos exclusivos para el mercado peruano.' },
    { icon: 'MessageCircle', titulo: 'Asesoría por WhatsApp', desc: 'Te acompañamos antes, durante y después de tu compra. Respuesta rápida.' },
];

export const TESTIMONIOS = [
    { nombre: 'Carlos Llontop', ciudad: 'Chiclayo', estrellas: 5, texto: 'El producto llegó en perfectas condiciones y el proceso fue rapidísimo. Me dieron factura al instante. Muy profesionales.' },
    { nombre: 'Rosa Huamán', ciudad: 'Trujillo', estrellas: 5, texto: 'Mi pedido llegó bien embalado hasta Trujillo. Excelente atención y el precio no lo encontré en ningún otro lado.' },
    { nombre: 'Miguel Ángel Díaz', ciudad: 'Lima', estrellas: 5, texto: 'Todo llegó con garantía y el trámite fue sencillo. Recomiendo Mo Importaciones al 100%.' },
    { nombre: 'Lucía Fernández', ciudad: 'Piura', estrellas: 5, texto: 'Empresa seria. Me contactaron al momento, resolvieron mis dudas y el envío llegó antes de lo prometido. Volvería a comprar.' },
];

export const API_BASE = import.meta.env.VITE_API_URL || '';
