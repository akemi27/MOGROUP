export default function sitemap() {
    const SITE_URL = 'https://moimportaciones.vercel.app';

    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ];
}
