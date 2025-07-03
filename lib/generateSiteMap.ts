const fs = require('fs');
const path = require('path');

const generateSitemap = async () => {
    // Import Contentful function
    const { getAllBlogPostSlugs } = require('./contentful');
    
    let blogSlugs = [];
    try {
        blogSlugs = await getAllBlogPostSlugs();
    } catch (error) {
        console.warn('Could not fetch blog slugs from Contentful:', error.message);
        // Fallback to empty array if Contentful is not available during build
        blogSlugs = [];
    }

    const staticUrls = [
        {
            url: 'https://ezlift.app',
            lastModified: new Date().toISOString(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: 'https://ezlift.app/contact',
            lastModified: new Date().toISOString(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: 'https://ezlift.app/privacy',
            lastModified: new Date().toISOString(),
            changeFrequency: 'yearly',
            priority: 0.8,
        },
        {
            url: 'https://ezlift.app/terms',
            lastModified: new Date().toISOString(),
            changeFrequency: 'yearly',
            priority: 0.8,
        },
        {
            url: 'https://ezlift.app/blog',
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: 'https://ezlift.app/about',
            lastModified: new Date().toISOString(),
            changeFrequency: 'yearly',
            priority: 0.8,
        },
    ];

    // Add dynamic blog post URLs
    const blogUrls = blogSlugs.map(slug => ({
        url: `https://ezlift.app/blog/${slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.9,
    }));

    const allUrls = [...staticUrls, ...blogUrls];

    const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allUrls
            .map(
                (url) => `
    <url>
        <loc>${url.url}</loc>
        <lastmod>${url.lastModified}</lastmod>
        <changefreq>${url.changeFrequency}</changefreq>
        <priority>${url.priority}</priority>
    </url>`
            )
            .join('')}
</urlset>`;

    fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemapXML, 'utf8');
    console.log('Sitemap generated with', allUrls.length, 'URLs!');
};

generateSitemap().catch(console.error);