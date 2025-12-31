require("dotenv").config();
const axios = require("axios");
const searchService = require("../services/searchService");
const scraperService = require("../services/scraperService");
const llmProvider = require("../config/llm");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";

class ArticleEnhancer {
  constructor() {
    this.processedCount = 0;
    this.failedCount = 0;
  }

  async enhanceAllArticles() {
    try {
      console.log("🚀 Starting article enhancement process...\n");

      // Fetch all original articles from API
      const response = await axios.get(`${API_BASE_URL}/articles`, {
        params: { versionType: "original", limit: 100 },
      });

      const originalArticles = response.data.data;

      if (originalArticles.length === 0) {
        console.log("⚠️  No original articles found to enhance");
        return;
      }

      console.log(`📚 Found ${originalArticles.length} articles to enhance\n`);

      // Process each article
      for (const article of originalArticles) {
        await this.enhanceArticle(article);

        // Delay between articles to respect rate limits
        await this.sleep(2000);
      }

      console.log("\n📊 Enhancement Summary:");
      console.log(`   ✅ Enhanced: ${this.processedCount}`);
      console.log(`   ❌ Failed: ${this.failedCount}`);
      console.log("\n✨ Enhancement process completed!\n");
    } catch (error) {
      console.error("❌ Enhancement script failed:", error.message);
      process.exit(1);
    }
  }

  async enhanceArticle(article) {
    try {
      console.log(`\n📖 Processing: "${article.title}"`);
      console.log("─".repeat(60));

      // Check if enhanced version already exists
      const existingEnhanced = await axios.get(
        `${API_BASE_URL}/articles/${article._id}`
      );
      if (existingEnhanced.data.enhancedVersion) {
        console.log("⏭️  Enhanced version already exists, skipping...");
        return;
      }

      // Step 1: Search Google for the article title
      console.log("🔍 Step 1: Searching Google...");
      const searchResults = await searchService.searchArticles(article.title);

      if (searchResults.length < 2) {
        console.log(
          `⚠️  Found only ${searchResults.length} reference article(s), skipping...`
        );
        this.failedCount++;
        return;
      }

      console.log(`   Found ${searchResults.length} reference articles`);

      // Step 2: Scrape reference articles
      console.log("📰 Step 2: Scraping reference articles...");
      const references = [];
      const referenceContents = [];

      for (const result of searchResults.slice(0, 2)) {
        console.log(`   - ${result.title}`);
        const scrapedContent = await scraperService.scrapeReferenceArticle(
          result.url
        );

        if (scrapedContent) {
          references.push({
            title: result.title,
            url: result.url,
          });
          referenceContents.push(scrapedContent);
        }

        await this.sleep(1000);
      }

      if (referenceContents.length === 0) {
        console.log("⚠️  Could not scrape reference articles, skipping...");
        this.failedCount++;
        return;
      }

      // Step 3: Use LLM to enhance the article
      console.log("🤖 Step 3: Enhancing article with AI...");
      const enhancedContent = await this.generateEnhancedArticle(
        article,
        referenceContents
      );

      if (!enhancedContent) {
        console.log("⚠️  LLM enhancement failed, skipping...");
        this.failedCount++;
        return;
      }

      // Step 4: Save enhanced article
      console.log("💾 Step 4: Saving enhanced article...");
      const enhancedArticle = {
        title: article.title,
        slug: `${article.slug}-enhanced`,
        publishedDate: article.publishedDate,
        author: article.author,
        contentHtml: enhancedContent.html,
        contentText: enhancedContent.text,
        versionType: "enhanced",
        parentArticleId: article._id,
        references: references,
        sourceUrl: `${article.sourceUrl}-enhanced`,
      };

      await axios.post(`${API_BASE_URL}/articles`, enhancedArticle);

      console.log("✅ Article enhanced successfully!");
      this.processedCount++;
    } catch (error) {
      console.error(
        `❌ Error enhancing article "${article.title}":`,
        error.message
      );
      this.failedCount++;
    }
  }

  async generateEnhancedArticle(originalArticle, referenceContents) {
    try {
      const systemPrompt = `You are an expert content writer and SEO specialist. Your task is to rewrite and enhance articles to improve their quality, SEO, structure, and readability while preserving factual accuracy.`;

      const userPrompt = `
ORIGINAL ARTICLE:
Title: ${originalArticle.title}
Content: ${originalArticle.contentText.slice(0, 2000)}

REFERENCE ARTICLES (Top-ranking on Google):

${referenceContents
  .map(
    (ref, i) => `
Reference ${i + 1}: ${ref.title}
Headings: ${ref.headings.join(", ")}
Structure: ${JSON.stringify(ref.structure)}
Content Preview: ${ref.content.slice(0, 1000)}
`
  )
  .join("\n---\n")}

TASK:
Rewrite the original article by:
1. Improving SEO and structure based on top-ranking articles
2. Matching the tone and formatting style of reference articles
3. Enhancing clarity, readability, and engagement
4. Adding relevant sections/headings from reference articles
5. Preserving all factual information from the original
6. Making it comprehensive and well-structured

Return ONLY the enhanced article content in HTML format with proper headings, paragraphs, and lists.
Do NOT include references section - that will be added separately.
      `;

      const enhancedHtml = await llmProvider.generateCompletion(
        systemPrompt,
        userPrompt,
        { temperature: 0.7, maxRetries: 3 }
      );

      // Convert HTML to text for contentText field
      const enhancedText = enhancedHtml
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return {
        html: enhancedHtml,
        text: enhancedText,
      };
    } catch (error) {
      console.error("LLM generation error:", error.message);
      return null;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Run the enhancement script
const enhancer = new ArticleEnhancer();
enhancer.enhanceAllArticles();
