const mongoose = require("mongoose");

const referenceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    author: {
      type: String,
      trim: true,
      default: "Unknown",
    },
    contentHtml: {
      type: String,
      required: true,
    },
    contentText: {
      type: String,
      required: true,
    },
    versionType: {
      type: String,
      enum: ["original", "enhanced"],
      default: "original",
      required: true,
    },
    parentArticleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      default: null,
    },
    references: {
      type: [referenceSchema],
      default: [],
    },
    sourceUrl: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
articleSchema.index({ versionType: 1 });
articleSchema.index({ parentArticleId: 1 });
articleSchema.index({ createdAt: -1 });

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
