import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useArticle } from "../hooks/useArticles";
import { articleAPI } from "../services/api";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { article, enhancedVersion, loading, error, refetch } = useArticle(id);
  const [activeTab, setActiveTab] = useState("content");
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState(null);

  const handleEnhance = async () => {
    try {
      setEnhancing(true);
      setEnhanceError(null);
      const result = await articleAPI.enhanceArticle(id);

      // Refetch to get the enhanced version
      await refetch();

      // Show success message
      alert("✅ Article enhanced successfully! Scroll down to see the link.");
    } catch (err) {
      setEnhanceError(err.response?.data?.error || "Failed to enhance article");
    } finally {
      setEnhancing(false);
    }
  };

  if (loading) return <Loading message="Loading article..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!article) return <ErrorMessage message="Article not found" />;

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Article Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`badge ${
                article.versionType === "original"
                  ? "badge-original"
                  : "badge-enhanced"
              }`}
            >
              {article.versionType === "original"
                ? "📄 Original"
                : "✨ Enhanced"}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(article.publishedDate)}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center text-gray-600 mb-6">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            By {article.author}
          </div>

          {/* Enhanced Version Link */}
          {article.versionType === "original" && enhancedVersion && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-green-800 font-medium">
                    An enhanced version is available
                  </span>
                </div>
                <Link
                  to={`/article/${enhancedVersion._id}`}
                  className="btn-primary text-sm"
                >
                  View Enhanced
                </Link>
              </div>
            </div>
          )}

          {/* Enhance Button (if no enhanced version exists) */}
          {article.versionType === "original" && !enhancedVersion && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 text-purple-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="text-purple-900 font-semibold">
                      Enhance this article with AI
                    </span>
                  </div>
                  <p className="text-purple-700 text-sm">
                    Improve SEO, structure, and readability using insights from
                    top-ranking articles
                  </p>
                  {enhanceError && (
                    <p className="text-red-600 text-sm mt-2">
                      ❌ {enhanceError}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleEnhance}
                  disabled={enhancing}
                  className="ml-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg"
                >
                  {enhancing ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Enhancing...
                    </>
                  ) : (
                    <>✨ Enhance Now</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Parent Article Link */}
          {article.versionType === "enhanced" && article.parentArticleId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-blue-800 font-medium">
                    This is an enhanced version of an original article
                  </span>
                </div>
                <Link
                  to={`/article/${article.parentArticleId}`}
                  className="btn-secondary text-sm"
                >
                  View Original
                </Link>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("content")}
                className={`${
                  activeTab === "content"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Content
              </button>
              {article.references && article.references.length > 0 && (
                <button
                  onClick={() => setActiveTab("references")}
                  className={`${
                    activeTab === "references"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  References ({article.references.length})
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === "content" && (
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
            </div>
          )}

          {activeTab === "references" && article.references && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                References
              </h2>
              <p className="text-gray-600 mb-6">
                This article was enhanced using insights from the following
                top-ranking sources:
              </p>
              <div className="space-y-4">
                {article.references.map((ref, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {ref.title}
                        </h3>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm break-all"
                        >
                          {ref.url}
                        </a>
                      </div>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Source URL */}
        <div className="mt-6 text-center">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            View original source →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
