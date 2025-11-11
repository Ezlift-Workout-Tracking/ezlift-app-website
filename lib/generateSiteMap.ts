import fs from 'fs';
import path from 'path';
import { getAllBlogPostSlugs } from './contentful';
import exerciseDataService from './services/exercise-data';
import { EXERCISE_LIBRARY_PAGE_SIZE } from './constants/pagination';

const generateSitemap = async () => {
    let blogSlugs: string[] = [];
    try {
        blogSlugs = await getAllBlogPostSlugs();
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Could not fetch blog slugs from Contentful:', errorMessage);
        // Fallback to empty array if Contentful is not available during build
        blogSlugs = [];
    }

    // Get exercise library pagination info
    let exerciseLibraryUrls: Array<{ url: string; lastModified: string; changeFrequency: string; priority: number }> = [];
    try {
        // Get total exercise count to calculate pages
        const exerciseResponse = await exerciseDataService.getExercises({}, 1, 1);
        const totalExercises = exerciseResponse?.total || 0;
        const totalPages = Math.ceil(totalExercises / EXERCISE_LIBRARY_PAGE_SIZE);
        
        // Add main exercise library page
        exerciseLibraryUrls.push({
            url: 'https://ezlift.app/exercise-library',
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.9,
        });
        
        // Add paginated exercise library pages
        for (let page = 2; page <= totalPages; page++) {
            exerciseLibraryUrls.push({
                url: `https://ezlift.app/exercise-library?page=${page}`,
                lastModified: new Date().toISOString(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        }
        
        // Add popular muscle group filter pages (high priority)
        const popularMuscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs'];
        for (const muscleGroup of popularMuscleGroups) {
            exerciseLibraryUrls.push({
                url: `https://ezlift.app/exercise-library?muscle=${encodeURIComponent(muscleGroup)}`,
                lastModified: new Date().toISOString(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        }
        
        console.log(`Generated ${totalPages} exercise library pagination pages and ${popularMuscleGroups.length} muscle group pages`);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Could not fetch exercise data for sitemap:', errorMessage);
        // Fallback to just the main exercise library page
        exerciseLibraryUrls = [{
            url: 'https://ezlift.app/exercise-library',
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.9,
        }];
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

    const allUrls = [...staticUrls, ...blogUrls, ...exerciseLibraryUrls];

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