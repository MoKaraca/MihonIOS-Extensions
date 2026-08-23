var SourceExtension = class {
    constructor() {
        this.id = "mangadex_en";
        this.name = "MangaDex";
        this.lang = "en";
        this.version = "1.0.0";
        this.supportsLatest = true;
        this.baseUrl = "https://api.mangadex.org";
    }

    async fetchPopularManga(page) {
        const limit = 20;
        const offset = (page - 1) * limit;
        const url = `${this.baseUrl}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&order[followedCount]=desc&availableTranslatedLanguage[]=en`;
        const jsonString = await nativeFetchHTML(url);
        const data = JSON.parse(jsonString);
        
        return JSON.stringify(data.data.map(manga => {
            let coverUrl = null;
            const coverRel = manga.relationships.find(r => r.type === 'cover_art');
            if (coverRel && coverRel.attributes && coverRel.attributes.fileName) {
                coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`;
            }
            return {
                sourceId: this.id,
                title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
                url: manga.id,
                coverUrl: coverUrl,
                status: 1
            };
        }));
    }

    async fetchSearchManga(query, page) {
        const limit = 20;
        const offset = (page - 1) * limit;
        const url = `${this.baseUrl}/manga?title=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&includes[]=cover_art&availableTranslatedLanguage[]=en`;
        const jsonString = await nativeFetchHTML(url);
        const data = JSON.parse(jsonString);
        
        return JSON.stringify(data.data.map(manga => {
            let coverUrl = null;
            const coverRel = manga.relationships.find(r => r.type === 'cover_art');
            if (coverRel && coverRel.attributes && coverRel.attributes.fileName) {
                coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`;
            }
            return {
                sourceId: this.id,
                title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
                url: manga.id,
                coverUrl: coverUrl,
                status: 1
            };
        }));
    }
    
    async fetchLatestUpdates(page) {
        return this.fetchPopularManga(page);
    }

    async fetchMangaDetails(url) {
        const apiUrl = `${this.baseUrl}/manga/${url}`;
        const jsonString = await nativeFetchHTML(apiUrl);
        const data = JSON.parse(jsonString);
        
        return JSON.stringify({
            description: data.data.attributes.description.en || "",
            author: "",
            genres: data.data.attributes.tags.map(t => t.attributes.name.en)
        });
    }

    async fetchChapterList(url) {
        // url is the manga ID
        const apiUrl = `${this.baseUrl}/manga/${url}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=100`;
        const jsonString = await nativeFetchHTML(apiUrl);
        const data = JSON.parse(jsonString);
        
        return JSON.stringify(data.data.map(chapter => {
            return {
                name: chapter.attributes.title ? `Ch. ${chapter.attributes.chapter} - ${chapter.attributes.title}` : `Ch. ${chapter.attributes.chapter}`,
                url: chapter.id, // url becomes chapter ID
                chapterNumber: parseFloat(chapter.attributes.chapter) || 0.0,
                dateUpload: chapter.attributes.publishAt
            };
        }));
    }

    async fetchPageList(chapterUrl) {
        // chapterUrl is chapter ID
        const apiUrl = `${this.baseUrl}/at-home/server/${chapterUrl}`;
        const jsonString = await nativeFetchHTML(apiUrl);
        const data = JSON.parse(jsonString);
        
        const host = data.baseUrl;
        const hash = data.chapter.hash;
        
        return JSON.stringify(data.chapter.data.map((filename, index) => {
            return {
                index: index,
                url: `${host}/data/${hash}/${filename}`,
                imageUrl: `${host}/data/${hash}/${filename}`
            };
        }));
    }
}
