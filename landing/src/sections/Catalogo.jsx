import CatalogoClient from './CatalogoClient';

async function getCatalogo() {
    try {
        const res = await fetch(`${process.env.API_URL}/api/publico/catalogo`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export default async function Catalogo() {
    const productos = await getCatalogo();
    return <CatalogoClient productos={productos} />;
}
