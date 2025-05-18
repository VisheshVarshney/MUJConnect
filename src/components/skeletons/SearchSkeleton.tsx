import React from 'react';
import ContentLoader from 'react-content-loader';

export const SearchSkeleton = () => (
  <div className="space-y-6">
    {/* Search Results Header */}
    <div className="bg-white dark:bg-amoled rounded-xl shadow-md p-6">
      <ContentLoader
        speed={2}
        width={800}
        height={40}
        viewBox="0 0 800 40"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        className="w-full"
      >
        <rect x="0" y="0" rx="4" ry="4" width="200" height="40" />
      </ContentLoader>
    </div>

    {/* Search Results */}
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="bg-white dark:bg-amoled rounded-xl shadow-md p-6"
        >
          <ContentLoader
            speed={2}
            width={800}
            height={100}
            viewBox="0 0 800 100"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            className="w-full"
          >
            {/* Result Item */}
            <circle cx="30" cy="30" r="20" />
            <rect x="70" y="20" rx="4" ry="4" width="200" height="20" />
            <rect x="70" y="50" rx="4" ry="4" width="400" height="16" />
            <rect x="70" y="74" rx="4" ry="4" width="300" height="16" />
          </ContentLoader>
        </div>
      ))}
    </div>
  </div>
);
