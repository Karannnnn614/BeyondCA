require("dotenv").config();
const axios = require("axios");
const scraperService = require("../services/scraperService");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";

async function scrapeAndSaveArticles() {
  try {
    console.log("🚀 Starting BeyondChats article scraping...\n");

    // Scrape articles from BeyondChats blog
    const articles = await scraperService.scrapeBeyondChatsArticles();

    if (articles.length === 0) {
      console.log("⚠️  No articles found to scrape");
      return;
    }

    console.log(`\n📦 Saving ${articles.length} articles to database...\n`);

    // Save each article via API
    let savedCount = 0;
    let skippedCount = 0;

    for (const article of articles) {
      try {
        const response = await axios.post(`${API_BASE_URL}/articles`, article);

        if (response.data.success) {
          console.log(`✅ Saved: ${article.title}`);
          savedCount++;
        }
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⏭️  Skipped (already exists): ${article.title}`);
          skippedCount++;
        } else {
          console.error(`❌ Failed to save: ${article.title}`, error.message);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Saved: ${savedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📝 Total: ${articles.length}`);
    console.log("\n✨ Scraping completed!\n");
  } catch (error) {
    console.error("❌ Scraping script failed:", error.message);
    process.exit(1);
  }
}

// Run the script
scrapeAndSaveArticles();
