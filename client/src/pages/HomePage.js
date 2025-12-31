import React from "react";
import { useArticles } from "../hooks/useArticles";
import ArticleCard from "../components/ArticleCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import StatsBar from "../components/StatsBar";

const HomePage = ({ versionType = null }) => {
  const { articles, loading, error, refetch } = useArticles(versionType);

  if (loading) return <Loading message="Loading articles..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const getPageTitle = () => {
    if (versionType === "original") return "Original Articles";
    if (versionType === "enhanced") return "Enhanced Articles";
    return "All Articles";
  };

  const getPageDescription = () => {
    if (versionType === "original") {
      return "Original articles scraped from BeyondChats blog";
    }
    if (versionType === "enhanced") {
      return "AI-enhanced articles optimized for SEO and readability";
    }
    return "Browse all original and enhanced articles";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StatsBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600">{getPageDescription()}</p>
        </div>

        {/* Empty State */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 mb-6">
              There are no {versionType || "articles"} available yet.
            </p>
          </div>
        ) : (
          <>
            {/* Article Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{articles.length}</span>{" "}
                article{articles.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
