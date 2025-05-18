import React from 'react';
import ContentLoader from 'react-content-loader';

export const MenuSkeleton = () => (
  <div className="space-y-6">
    {/* Menu Header */}
    <div className="bg-white dark:bg-amoled rounded-xl shadow-md p-6">
      <ContentLoader
        speed={2}
        width={800}
        height={60}
        viewBox="0 0 800 60"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        className="w-full"
      >
        <rect x="0" y="0" rx="4" ry="4" width="300" height="40" />
        <rect x="320" y="0" rx="4" ry="4" width="200" height="40" />
      </ContentLoader>
    </div>

    {/* Menu Categories */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <div
          key={index}
          className="bg-white dark:bg-amoled rounded-xl shadow-md p-6"
        >
          <ContentLoader
            speed={2}
            width={400}
            height={300}
            viewBox="0 0 400 300"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            className="w-full"
          >
            {/* Category Header */}
            <rect x="0" y="0" rx="4" ry="4" width="200" height="24" />

            {/* Menu Items */}
            <rect x="0" y="40" rx="4" ry="4" width="360" height="20" />
            <rect x="0" y="70" rx="4" ry="4" width="320" height="20" />
            <rect x="0" y="100" rx="4" ry="4" width="340" height="20" />
            <rect x="0" y="130" rx="4" ry="4" width="300" height="20" />
            <rect x="0" y="160" rx="4" ry="4" width="360" height="20" />

            {/* Price Tags */}
            <rect x="320" y="40" rx="4" ry="4" width="60" height="20" />
            <rect x="320" y="70" rx="4" ry="4" width="60" height="20" />
            <rect x="320" y="100" rx="4" ry="4" width="60" height="20" />
            <rect x="320" y="130" rx="4" ry="4" width="60" height="20" />
            <rect x="320" y="160" rx="4" ry="4" width="60" height="20" />
          </ContentLoader>
        </div>
      ))}
    </div>
  </div>
);
