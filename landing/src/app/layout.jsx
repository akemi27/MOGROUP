import { Montserrat } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import { EMPRESA } from '../config';

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
    variable: '--font-montserrat',
    display: 'swap',
});

const SITE_URL = 'https://moimportaciones.vercel.app';

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: 'Mo Group — Importaciones de Calidad',
    description: 'Mo Importaciones — Productos importados de calidad desde USA y China. Envíos a todo el Perú con garantía real.',
    keywords: ['importaciones peru', 'productos importados chiclayo', 'tecnologia peru', 'mo group', 'garantia real'],
    robots: { index: true, follow: true },
    icons: {
        icon: [
            { url: '/chine.png', sizes: '32x32', type: 'image/png' },
            { url: '/chine.png', sizes: '16x16', type: 'image/png' },
        ],
        apple: '/chine.png',
    },
    openGraph: {
        title: 'Mo Importaciones — Chiclayo, Perú',
        description: 'Importación directa desde USA y China. Productos de calidad con garantía real. Envíos a todo el Perú.',
        url: SITE_URL,
        siteName: EMPRESA.nombre,
        images: ['/chine.png'],
        type: 'website',
        locale: 'es_PE',
    },
    twitter: {
        card: 'summary',
        title: 'Mo Importaciones — Chiclayo, Perú',
        description: 'Importación directa desde USA y China. Productos de calidad con garantía real.',
        images: ['/chine.png'],
    },
};

export const viewport = {
    themeColor: '#ff5500',
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({ children }) {
    return (
        <html lang="es" className={montserrat.variable}>
            <body className="min-h-screen bg-white text-slate-800 overflow-x-hidden">
                <ScrollReveal />
                <Navbar />
                <main>{children}</main>
                <Footer />
                <WhatsAppButton />
            </body>
        </html>
    );
}
