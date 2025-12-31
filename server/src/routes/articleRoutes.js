const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

// Stats route (must be before :id route)
router.get("/stats", articleController.getStats.bind(articleController));

// CRUD routes
router.post("/", articleController.createArticle.bind(articleController));
router.get("/", articleController.getAllArticles.bind(articleController));
router.get("/:id", articleController.getArticleById.bind(articleController));
router.put("/:id", articleController.updateArticle.bind(articleController));
router.delete("/:id", articleController.deleteArticle.bind(articleController));

// Enhancement route
router.post(
  "/:id/enhance",
  articleController.enhanceArticle.bind(articleController)
);

module.exports = router;
