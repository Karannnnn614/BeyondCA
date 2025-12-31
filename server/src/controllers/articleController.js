const Article = require("../models/Article");

class ArticleController {
  /**
   * Create a new article
   * POST /api/articles
   */
  async createArticle(req, res, next) {
    try {
      const articleData = req.body;

      // Check if article with same sourceUrl already exists
      const existingArticle = await Article.findOne({
        sourceUrl: articleData.sourceUrl,
      });
      if (existingArticle) {
        return res.status(409).json({
          success: false,
          error: "Article with this source URL already exists",
        });
      }

      const article = await Article.create(articleData);

      res.status(201).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all articles with optional filtering
   * GET /api/articles
   */
  async getAllArticles(req, res, next) {
    try {
      const { versionType, limit = 50, page = 1 } = req.query;

      const query = {};
      if (versionType) {
        query.versionType = versionType;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const articles = await Article.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate("parentArticleId", "title slug");

      const total = await Article.countDocuments(query);

      res.json({
        success: true,
        data: articles,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single article by ID
   * GET /api/articles/:id
   */
  async getArticleById(req, res, next) {
    try {
      const { id } = req.params;

      const article = await Article.findById(id).populate(
        "parentArticleId",
        "title slug"
      );

      if (!article) {
        return res.status(404).json({
          success: false,
          error: "Article not found",
        });
      }

      // Also fetch enhanced version if this is an original article
      let enhancedVersion = null;
      if (article.versionType === "original") {
        enhancedVersion = await Article.findOne({ parentArticleId: id });
      }

      res.json({
        success: true,
        data: article,
        enhancedVersion,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update article
   * PUT /api/articles/:id
   */
  async updateArticle(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Don't allow changing sourceUrl to avoid duplicates
      delete updateData.sourceUrl;

      const article = await Article.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!article) {
        return res.status(404).json({
          success: false,
          error: "Article not found",
        });
      }

      res.json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete article
   * DELETE /api/articles/:id
   */
  async deleteArticle(req, res, next) {
    try {
      const { id } = req.params;

      const article = await Article.findByIdAndDelete(id);

      if (!article) {
        return res.status(404).json({
          success: false,
          error: "Article not found",
        });
      }

      // Also delete enhanced version if this is an original article
      if (article.versionType === "original") {
        await Article.deleteMany({ parentArticleId: id });
      }

      res.json({
        success: true,
        message: "Article deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get article statistics
   * GET /api/articles/stats
   */
  async getStats(req, res, next) {
    try {
      const totalOriginal = await Article.countDocuments({
        versionType: "original",
      });
      const totalEnhanced = await Article.countDocuments({
        versionType: "enhanced",
      });
      const totalArticles = totalOriginal + totalEnhanced;

      res.json({
        success: true,
        data: {
          total: totalArticles,
          original: totalOriginal,
          enhanced: totalEnhanced,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enhance article with AI
   * POST /api/articles/:id/enhance
   */
  async enhanceArticle(req, res, next) {
    try {
      const { id } = req.params;
      const enhancementService = require("../services/enhancementService");

      const result = await enhancementService.enhanceArticle(id);

      res.json(result);
    } catch (error) {
      // Return user-friendly error message
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new ArticleController();
