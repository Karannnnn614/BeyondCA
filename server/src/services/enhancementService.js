const Article = require("../models/Article");
const searchService = require("./searchService");
const scraperService = require("./scraperService");
const llmProvider = require("../config/llm");

class EnhancementService {
  /**
   * Enhance a single article with AI
   */
  async enhanceArticle(articleId) {
    try {
      // Fetch the original article
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error("Article not found");
      }

      if (article.versionType !== "original") {
        throw new Error("Can only enhance original articles");
      }

      // Check if enhanced version already exists
      const existingEnhanced = await Article.findOne({
        parentArticleId: articleId,
      });
      if (existingEnhanced) {
        return {
          success: true,
          message: "Enhanced version already exists",
          data: existingEnhanced,
        };
      }

      // Step 1: Search Google for the article title
      const searchResults = await searchService.searchArticles(article.title);

      if (searchResults.length < 2) {
        throw new Error(
          `Not enough reference articles found (${searchResults.length}/2 required)`
        );
      }

      // Step 2: Scrape reference articles
      const references = [];
      const referenceContents = [];

      for (const result of searchResults.slice(0, 2)) {
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

        // Small delay between scrapes
        await this.sleep(1000);
      }

      if (referenceContents.length === 0) {
        throw new Error("Could not scrape reference articles");
      }

      // Step 3: Use LLM to enhance the article
      const enhancedContent = await this.generateEnhancedArticle(
        article,
        referenceContents
      );

      if (!enhancedContent) {
        throw new Error("LLM enhancement failed");
      }

      // Step 4: Save enhanced article
      const enhancedArticle = await Article.create({
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
      });

      return {
        success: true,
        message: "Article enhanced successfully",
        data: enhancedArticle,
      };
    } catch (error) {
      console.error("Enhancement error:", error.message);
      throw error;
    }
  }

  /**
   * Generate enhanced article content using LLM
   */
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

module.exports = new EnhancementService();
