const axios = require("axios");
const cheerio = require("cheerio");

class ScraperService {
  /**
   * Scrape articles from BeyondChats blog
   * Fetches the last page and gets the 5 oldest articles
   */
  async scrapeBeyondChatsArticles() {
    try {
      const baseUrl = "https://beyondchats.com/blogs";

      console.log("📡 Fetching BeyondChats blog page...");

      // First, fetch the main blogs page to find pagination
      const response = await axios.get(baseUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Find the last page number from pagination
      let lastPage = 1;
      const paginationLinks = $(
        'a[href*="/blogs/page/"], .pagination a, a.page-numbers'
      );

      paginationLinks.each((i, elem) => {
        const href = $(elem).attr("href");
        const pageMatch = href && href.match(/page[\/=](\d+)/);
        if (pageMatch) {
          const pageNum = parseInt(pageMatch[1]);
          if (pageNum > lastPage) {
            lastPage = pageNum;
          }
        }
      });

      console.log(`📄 Last page found: ${lastPage}`);

      // Fetch the last page
      let lastPageUrl = baseUrl;
      if (lastPage > 1) {
        lastPageUrl = `${baseUrl}/page/${lastPage}`;
      }

      console.log(`🔍 Scraping last page: ${lastPageUrl}`);

      const lastPageResponse = await axios.get(lastPageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      const $lastPage = cheerio.load(lastPageResponse.data);

      // Extract article links from the last page
      const articleLinks = [];

      // Try different possible selectors
      const selectors = [
        'article a[href*="/blogs/"]',
        ".blog-post a",
        '.post a[href*="/blogs/"]',
        'a[href*="/blogs/"][href!="/blogs"]',
        ".entry-title a",
      ];

      for (const selector of selectors) {
        $lastPage(selector).each((i, elem) => {
          const href = $lastPage(elem).attr("href");
          if (
            href &&
            href.includes("/blogs/") &&
            href !== "/blogs" &&
            href !== "/blogs/"
          ) {
            const fullUrl = href.startsWith("http")
              ? href
              : `https://beyondchats.com${href}`;
            if (!articleLinks.includes(fullUrl)) {
              articleLinks.push(fullUrl);
            }
          }
        });

        if (articleLinks.length >= 5) break;
      }

      console.log(`📚 Found ${articleLinks.length} article links`);

      // Get the first 5 articles (oldest on last page)
      const articlesToScrape = articleLinks.slice(0, 5);

      // Scrape each article
      const articles = [];
      for (const url of articlesToScrape) {
        try {
          console.log(`📖 Scraping article: ${url}`);
          const article = await this.scrapeArticle(url);
          if (article) {
            articles.push(article);
          }

          // Delay between requests to be respectful
          await this.sleep(1000);
        } catch (error) {
          console.error(`❌ Error scraping ${url}:`, error.message);
        }
      }

      console.log(`✅ Successfully scraped ${articles.length} articles`);
      return articles;
    } catch (error) {
      console.error("❌ Error scraping BeyondChats blog:", error.message);
      throw error;
    }
  }

  /**
   * Scrape a single article
   */
  async scrapeArticle(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Extract title
      const title =
        $("h1").first().text().trim() ||
        $("title").text().trim() ||
        $(".entry-title").text().trim() ||
        "Untitled Article";

      // Create slug from URL or title
      const urlParts = url.split("/");
      const slug =
        urlParts[urlParts.length - 1] ||
        urlParts[urlParts.length - 2] ||
        this.createSlug(title);

      // Extract author
      const author =
        $(".author-name").text().trim() ||
        $('meta[name="author"]').attr("content") ||
        $(".author").text().trim() ||
        "BeyondChats";

      // Extract published date
      let publishedDate =
        $("time").attr("datetime") ||
        $('meta[property="article:published_time"]').attr("content") ||
        $(".published-date").text().trim();

      if (!publishedDate) {
        publishedDate = new Date().toISOString();
      }

      // Extract content HTML
      const contentHtml =
        $("article").html() ||
        $(".post-content").html() ||
        $(".entry-content").html() ||
        $("main").html() ||
        "";

      // Extract content text
      const contentText =
        $("article").text().trim() ||
        $(".post-content").text().trim() ||
        $(".entry-content").text().trim() ||
        $("main").text().trim() ||
        "";

      return {
        title,
        slug,
        publishedDate: new Date(publishedDate),
        author,
        contentHtml,
        contentText: this.cleanText(contentText),
        sourceUrl: url,
        versionType: "original",
      };
    } catch (error) {
      console.error(`Error scraping article ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Scrape content from a URL (for reference articles)
   */
  async scrapeReferenceArticle(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Extract title
      const title =
        $("h1").first().text().trim() ||
        $("title").text().trim() ||
        $(".entry-title").text().trim();

      // Extract headings
      const headings = [];
      $("h1, h2, h3").each((i, elem) => {
        const heading = $(elem).text().trim();
        if (heading && heading.length > 3) {
          headings.push(heading);
        }
      });

      // Extract main content
      const mainContent =
        $("article").text().trim() ||
        $(".post-content").text().trim() ||
        $(".entry-content").text().trim() ||
        $("main").text().trim();

      return {
        title,
        url,
        headings: headings.slice(0, 10),
        content: this.cleanText(mainContent).slice(0, 3000),
        structure: this.analyzeStructure($),
      };
    } catch (error) {
      console.error(`Error scraping reference article ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Analyze article structure and tone
   */
  analyzeStructure($) {
    const structure = {
      hasList: $("ul, ol").length > 0,
      hasCodeBlocks: $("code, pre").length > 0,
      hasImages: $("img").length > 0,
      paragraphCount: $("p").length,
      headingCount: $("h1, h2, h3, h4, h5, h6").length,
    };

    return structure;
  }

  /**
   * Clean text content
   */
  cleanText(text) {
    return text.replace(/\s+/g, " ").replace(/\n+/g, "\n").trim();
  }

  /**
   * Create slug from title
   */
  createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new ScraperService();
