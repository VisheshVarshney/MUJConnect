import React from 'react';
import ContentLoader from 'react-content-loader';

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    {/* Profile Header */}
    <div className="bg-white dark:bg-amoled rounded-xl shadow-md p-6">
      <ContentLoader
        speed={2}
        width={800}
        height={200}
        viewBox="0 0 800 200"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        className="w-full"
      >
        {/* Profile Picture */}
        <circle cx="60" cy="60" r="50" />

        {/* Name and Username */}
        <rect x="130" y="30" rx="4" ry="4" width="200" height="24" />
        <rect x="130" y="64" rx="4" ry="4" width="150" height="16" />

        {/* Bio */}
        <rect x="130" y="100" rx="4" ry="4" width="400" height="16" />
        <rect x="130" y="124" rx="4" ry="4" width="350" height="16" />

        {/* Stats */}
        <rect x="130" y="160" rx="4" ry="4" width="80" height="20" />
        <rect x="230" y="160" rx="4" ry="4" width="80" height="20" />
        <rect x="330" y="160" rx="4" ry="4" width="80" height="20" />
      </ContentLoader>
    </div>

    {/* Posts Section */}
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="bg-white dark:bg-amoled rounded-xl shadow-md p-6"
        >
          <ContentLoader
            speed={2}
            width={800}
            height={120}
            viewBox="0 0 800 120"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            className="w-full"
          >
            {/* Post Header */}
            <circle cx="30" cy="30" r="20" />
            <rect x="60" y="20" rx="4" ry="4" width="150" height="16" />
            <rect x="60" y="44" rx="4" ry="4" width="100" height="12" />

            {/* Post Content */}
            <rect x="20" y="70" rx="4" ry="4" width="760" height="16" />
            <rect x="20" y="94" rx="4" ry="4" width="600" height="16" />
          </ContentLoader>
        </div>
      ))}
    </div>
  </div>
);
