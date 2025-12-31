import { useState, useEffect } from "react";
import { articleAPI } from "../services/api";

export const useArticles = (versionType = null) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = versionType ? { versionType } : {};
      const response = await articleAPI.getAllArticles(params);
      setArticles(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionType]);

  return { articles, loading, error, refetch: fetchArticles };
};

export const useArticle = (id) => {
  const [article, setArticle] = useState(null);
  const [enhancedVersion, setEnhancedVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleAPI.getArticle(id);
      setArticle(response.data);
      setEnhancedVersion(response.enhancedVersion);
    } catch (err) {
      setError(err.message || "Failed to fetch article");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { article, enhancedVersion, loading, error, refetch: fetchArticle };
};

export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchStats };
};
