import React from "react";
import { useStats } from "../hooks/useArticles";

const StatsBar = () => {
  const { stats, loading } = useStats();

  if (loading || !stats) return null;

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-primary-100 text-sm">Total Articles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.original}</div>
            <div className="text-primary-100 text-sm">Original Articles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.enhanced}</div>
            <div className="text-primary-100 text-sm">Enhanced Articles</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
