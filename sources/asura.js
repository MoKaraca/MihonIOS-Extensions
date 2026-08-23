var SourceExtension = class {
    constructor() {
        this.id = "asura.en";
        this.name = "Asura Scans";
        this.lang = "en";
        this.version = "1.0.0";
        this.supportsLatest = true;
        this.baseUrl = "https://asuracomic.net";
    }

    async fetchPopularManga(page) {
        // Fetch raw HTML
        const html = await nativeFetchHTML(`${this.baseUrl}/manga?order=popular`);
        const results = [];
        
        // Very basic Regex parser for Asura Scans Astro SSR HTML
        // Note: Real extensions would use Cheerio, but we use Regex for this demo
        const blockRegex = /<a href="\/comics\/([^"]+)"[^>]*>.*?<img src="([^"]+)" alt="([^"]+)"/gs;
        
        let match;
        while ((match = blockRegex.exec(html)) !== null) {
            results.push({
                sourceId: this.id,
                title: match[3],
                url: `/comics/${match[1]}`, // This is the manga URL path
                coverUrl: match[2],
                status: 1
            });
        }
        
        // Remove duplicates if any
        const unique = [];
        const seen = new Set();
        for (const item of results) {
            if (!seen.has(item.url)) {
                seen.add(item.url);
                unique.push(item);
            }
        }
        
        return JSON.stringify(unique);
    }

    async fetchSearchManga(query, page) {
        const html = await nativeFetchHTML(`${this.baseUrl}/manga?name=${encodeURIComponent(query)}`);
        const results = [];
        const blockRegex = /<a href="\/comics\/([^"]+)"[^>]*>.*?<img src="([^"]+)" alt="([^"]+)"/gs;
        let match;
        while ((match = blockRegex.exec(html)) !== null) {
            results.push({
                sourceId: this.id,
                title: match[3],
                url: `/comics/${match[1]}`,
                coverUrl: match[2],
                status: 1
            });
        }
        return JSON.stringify(results);
    }
    
    async fetchLatestUpdates(page) {
        const html = await nativeFetchHTML(`${this.baseUrl}/manga?order=update`);
        const results = [];
        const blockRegex = /<a href="\/comics\/([^"]+)"[^>]*>.*?<img src="([^"]+)" alt="([^"]+)"/gs;
        let match;
        while ((match = blockRegex.exec(html)) !== null) {
            results.push({
                sourceId: this.id,
                title: match[3],
                url: `/comics/${match[1]}`,
                coverUrl: match[2],
                status: 1
            });
        }
        return JSON.stringify(results);
    }

    async fetchMangaDetails(url) {
        const html = await nativeFetchHTML(`${this.baseUrl}${url}`);
        
        // Extract Description
        const descMatch = /<span class="font-medium text-sm text-\[\#b9b9b9\][^>]*>(.*?)<\/span>/s.exec(html);
        const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : "No description available.";
        
        return JSON.stringify({
            description: description,
            author: "Asura Scans",
            genres: ["Action", "Fantasy", "Manhwa"] // Hardcoded for simplicity in this demo, real would regex
        });
    }

    async fetchChapterList(url) {
        const html = await nativeFetchHTML(`${this.baseUrl}${url}`);
        const results = [];
        
        // Match chapter links inside the Astro HTML
        const chapRegex = /<a href="(\/comics\/[^"]+)"[^>]*>.*?Chapter\s*(\d+(\.\d+)?)/gi;
        
        let match;
        const seen = new Set();
        while ((match = chapRegex.exec(html)) !== null) {
            if (!seen.has(match[1])) {
                seen.add(match[1]);
                results.push({
                    name: `Chapter ${match[2]}`,
                    url: match[1],
                    chapterNumber: parseFloat(match[2])
                });
            }
        }
        
        return JSON.stringify(results);
    }

    async fetchPageList(chapterUrl) {
        const html = await nativeFetchHTML(`${this.baseUrl}${chapterUrl}`);
        const results = [];
        
        // Extract images from the reader container
        const imgRegex = /<img[^>]*src="([^"]+)"[^>]*class="[^"]*object-cover[^"]*"/gi;
        
        let match;
        let idx = 0;
        while ((match = imgRegex.exec(html)) !== null) {
            // Ignore logo/UI images if any, just grab the actual pages
            if (match[1].includes("/pages/")) {
                results.push({
                    index: idx++,
                    url: chapterUrl,
                    imageUrl: match[1]
                });
            }
        }
        
        return JSON.stringify(results);
    }
}
