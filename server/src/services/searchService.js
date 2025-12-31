const axios = require("axios");
const cheerio = require("cheerio");

class SearchService {
  /**
   * Search Google using SerpAPI
   */
  async searchGoogleSerpAPI(query) {
    try {
      if (
        !process.env.SERPAPI_KEY ||
        process.env.SERPAPI_KEY === "your_serpapi_key_here"
      ) {
        console.warn(
          "⚠️  SerpAPI key not configured, falling back to scraping"
        );
        return await this.searchGoogleScraping(query);
      }

      const response = await axios.get("https://serpapi.com/search", {
        params: {
          q: query,
          api_key: process.env.SERPAPI_KEY,
          num: 5,
        },
        timeout: 10000,
      });

      const results = response.data.organic_results || [];

      // Filter for blog/article links
      const articleLinks = results
        .filter((result) => this.isArticleUrl(result.link))
        .slice(0, 2)
        .map((result) => ({
          title: result.title,
          url: result.link,
        }));

      return articleLinks;
    } catch (error) {
      console.error("SerpAPI search failed:", error.message);
      console.log("Falling back to scraping method...");
      return await this.searchGoogleScraping(query);
    }
  }

  /**
   * Search Google via web scraping (fallback)
   */
  async searchGoogleScraping(query) {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}`;

      const response = await axios.get(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const results = [];

      // Parse Google search results
      $("div.g").each((i, elem) => {
        if (results.length >= 5) return false;

        const link = $(elem).find("a").first().attr("href");
        const title = $(elem).find("h3").first().text();

        if (link && title && this.isArticleUrl(link)) {
          results.push({
            title: title.trim(),
            url: link,
          });
        }
      });

      // Filter and return first 2 article links
      return results.slice(0, 2);
    } catch (error) {
      console.error("Google scraping failed:", error.message);
      return [];
    }
  }

  /**
   * Check if URL is likely a blog/article
   */
  isArticleUrl(url) {
    if (!url) return false;

    const lowerUrl = url.toLowerCase();

    // Exclude non-article domains
    const excludePatterns = [
      "google.com",
      "youtube.com",
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "linkedin.com/in/",
      "pinterest.com",
      "wikipedia.org",
      "reddit.com/r/",
      "amazon.com",
      "ebay.com",
    ];

    if (excludePatterns.some((pattern) => lowerUrl.includes(pattern))) {
      return false;
    }

    // Include article patterns
    const includePatterns = [
      "/blog",
      "/article",
      "/post",
      "/news",
      "/guide",
      "/tutorial",
      "/story",
      "/insights",
      "/resources",
    ];

    return includePatterns.some((pattern) => lowerUrl.includes(pattern));
  }

  /**
   * Main search method with fallback
   */
  async searchArticles(query) {
    console.log(`🔍 Searching for: "${query}"`);

    try {
      const results = await this.searchGoogleSerpAPI(query);

      if (results.length === 0) {
        console.warn("⚠️  No results found, trying alternative search...");
        return await this.searchGoogleScraping(query);
      }

      console.log(`✅ Found ${results.length} article(s)`);
      return results;
    } catch (error) {
      console.error("❌ Search failed:", error.message);
      return [];
    }
  }
}

module.exports = new SearchService();
