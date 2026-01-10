#!/usr/bin/env node

/**
 * Build-time data pre-fetch script
 * Runs during build to fetch and cache API data
 * Generates a data manifest that can be embedded or served statically
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:8000/api';
const CACHE_DIR = path.join(process.cwd(), '.cache');
const MANIFEST_FILE = path.join(CACHE_DIR, 'data-manifest.json');

const fetchJSON = async (url) => {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const etag = res.headers['etag'];
                    resolve({ data, etag });
                } catch (err) {
                    reject(new Error(`Failed to parse JSON from ${url}: ${err}`));
                }
            });
        }).on('error', reject);
    });
};

// Fetch individual endpoints and combine into page-specific payloads
const fetchAboutPageContent = async () => {
    const [heroRes, bioRes, qualRes, valRes, certRes] = await Promise.allSettled([
        fetchJSON(`${API_BASE}/pages/about/hero`),
        fetchJSON(`${API_BASE}/pages/about/bio`),
        fetchJSON(`${API_BASE}/pages/about/qualifications`),
        fetchJSON(`${API_BASE}/pages/about/values`),
        fetchJSON(`${API_BASE}/pages/about/certificates`),
    ]);

    const hero = heroRes.status === 'fulfilled' ? heroRes.value.data?.hero : null;
    const bio = bioRes.status === 'fulfilled' ? bioRes.value.data?.bio : null;
    const qualifications = qualRes.status === 'fulfilled' ? (Array.isArray(qualRes.value.data) ? qualRes.value.data : []) : [];
    const values = valRes.status === 'fulfilled' ? (Array.isArray(valRes.value.data) ? valRes.value.data : []) : [];
    const certificates = certRes.status === 'fulfilled' ? (Array.isArray(certRes.value.data) ? certRes.value.data : []) : [];

    return { hero, bio, qualifications, values, certificates };
};

const fetchServicesPageContent = async () => {
    const [catRes, servRes, instRes] = await Promise.allSettled([
        fetchJSON(`${API_BASE}/service-categories`),
        fetchJSON(`${API_BASE}/services`),
        fetchJSON(`${API_BASE}/service-instructions`),
    ]);

    const categories = catRes.status === 'fulfilled' ? (Array.isArray(catRes.value.data) ? catRes.value.data : []) : [];
    const services = servRes.status === 'fulfilled' ? (Array.isArray(servRes.value.data) ? servRes.value.data : []) : [];
    const instructions = instRes.status === 'fulfilled' ? (Array.isArray(instRes.value.data) ? instRes.value.data : []) : [];

    return { categories, services, instructions };
};

const endpoints = [
    // Home Page Data
    { key: 'home-services', url: `${API_BASE}/services/featured` },
    { key: 'all-services', url: `${API_BASE}/services` },
    { key: 'home-sliders', url: `${API_BASE}/sliders/public` },
    { key: 'home-about', url: `${API_BASE}/pages/home/about` },
    { key: 'home-features', url: `${API_BASE}/pages/home/features` },
    { key: 'home-cta', url: `${API_BASE}/pages/home/cta` },
    { key: 'home-testimonials', url: `${API_BASE}/pages/home/testimonials` },

    // About Page - composite (requires calling multiple endpoints)
    { key: 'about-page-content', fetcher: fetchAboutPageContent },

    // Services Page - composite (requires calling multiple endpoints)
    { key: 'services-page-content', fetcher: fetchServicesPageContent },
];

const run = async () => {
    console.log('🚀 Pre-fetching API data at build time...');

    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    const manifest = [];
    let successCount = 0;
    let errorCount = 0;

    for (const endpoint of endpoints) {
        try {
            console.log(`  📡 Fetching ${endpoint.key}...`);

            let data, etag;
            if (endpoint.fetcher) {
                // Custom fetcher function
                data = await endpoint.fetcher();
                etag = undefined;
            } else {
                // URL-based fetch
                const result = await fetchJSON(endpoint.url);
                data = result.data;
                etag = result.etag;
            }

            manifest.push({
                key: endpoint.key,
                url: endpoint.url || `(composite)`,
                data,
                timestamp: Date.now(),
                etag,
            });

            successCount++;
            console.log(`    ✅ Success`);
        } catch (error) {
            errorCount++;
            console.error(`    ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

    // Copy manifest to public folder for serving
    const publicDir = path.join(process.cwd(), 'public');
    const publicManifest = path.join(publicDir, 'data-manifest.json');

    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.copyFileSync(MANIFEST_FILE, publicManifest);

    console.log(`\n📊 Build-time data fetch complete:`);
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ❌ Failed: ${errorCount}`);
    console.log(`  📁 Manifest saved to: ${MANIFEST_FILE}`);
    console.log(`  📁 Manifest copied to: ${publicManifest}`);

    if (errorCount > 0) {
        console.warn(`\n⚠️  Some endpoints failed. Data will be fetched at runtime instead.`);
    }
};

run().catch((err) => {
    console.error('Fatal error during data pre-fetch:', err);
    process.exit(1);
});
