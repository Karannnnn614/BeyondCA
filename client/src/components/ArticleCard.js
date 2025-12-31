import React from "react";
import { Link } from "react-router-dom";

const ArticleCard = ({ article }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  return (
    <div
      className={`card ${
        article.versionType === "enhanced"
          ? "border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 hover:shadow-2xl"
          : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`badge ${
              article.versionType === "original"
                ? "badge-original"
                : "badge-enhanced"
            }`}
          >
            {article.versionType === "original"
              ? "📄 Original"
              : "✨ AI-Enhanced"}
          </span>
          {article.versionType === "enhanced" && (
            <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
              PREMIUM
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {formatDate(article.publishedDate)}
        </span>
      </div>

      <h2
        className={`text-xl font-bold mb-2 line-clamp-2 ${
          article.versionType === "enhanced"
            ? "bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            : "text-gray-900"
        }`}
      >
        {article.title}
      </h2>

      <p className="text-gray-600 text-sm mb-1">By {article.author}</p>

      <p className="text-gray-700 mb-4 line-clamp-3">
        {truncateText(article.contentText)}
      </p>

      {article.references && article.references.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-medium mb-1">
            {article.references.length} Reference
            {article.references.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <Link
        to={`/article/${article._id}`}
        className={`inline-flex items-center font-medium text-sm ${
          article.versionType === "enhanced"
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-md"
            : "text-primary-600 hover:text-primary-700"
        }`}
      >
        {article.versionType === "enhanced" ? "✨ Read Enhanced" : "Read More"}
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
};

export default ArticleCard;
