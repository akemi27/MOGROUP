import Hero from '../sections/Hero';
import Categorias from '../sections/Categorias';
import Catalogo from '../sections/Catalogo';
import CTABand from '../sections/CTABand';
import VideoPromo from '../sections/VideoPromo';
import SobreNosotros from '../sections/SobreNosotros';
import Testimonios from '../sections/Testimonios';
import Importar from '../sections/Importar';
import Contacto from '../sections/Contacto';
import FAQ from '../sections/FAQ';

export default function Home() {
    return (
        <>
            <Hero />
            <Categorias />
            <Catalogo />
            <CTABand />
            <VideoPromo />
            <SobreNosotros />
            <Testimonios />
            <Importar />
            <Contacto />
            <FAQ />
        </>
    );
}
